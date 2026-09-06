import { Controller, Get, Post, Body, Param, Headers, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { claims, nonNegative } from './auth';
import { reconcileSets, ReconcileRecord } from '@taxone/gst';

const db = new PrismaClient();

type ImportRow = { supplierGstin?: string; invoiceNumber: string; invoiceDate: string; taxableValue: number | string; cgst?: number | string; sgst?: number | string; igst?: number | string; cess?: number | string };

@Controller('api/v1/businesses/:id/gst')
export class GstController {
  /** Import a GSTR-2B period (records supplied by the upstream pipeline / portal export). */
  @Post('returns/:period/import')
  async importReturn(@Headers('authorization') h: string, @Param('id') id: string, @Param('period') period: string, @Body() b: { records: ImportRow[] }) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    if (!/^\d{4}-\d{2}$/.test(period)) throw new BadRequestException('period must be YYYY-MM');
    if (!Array.isArray(b?.records) || !b.records.length) throw new BadRequestException('records are required');
    const valid = b.records.map(r => {
      if (!r.invoiceNumber?.trim() || !r.invoiceDate) throw new BadRequestException('Each record needs invoiceNumber and invoiceDate');
      return {
        businessId: id,
        supplierGstin: r.supplierGstin ?? null,
        invoiceNumber: r.invoiceNumber.trim(),
        invoiceDate: new Date(r.invoiceDate),
        taxableValue: nonNegative(r.taxableValue ?? 0, 'taxableValue').toFixed(2),
        cgst: nonNegative(r.cgst ?? 0, 'cgst').toFixed(2),
        sgst: nonNegative(r.sgst ?? 0, 'sgst').toFixed(2),
        igst: nonNegative(r.igst ?? 0, 'igst').toFixed(2),
        cess: nonNegative(r.cess ?? 0, 'cess').toFixed(2),
      };
    });
    const created = await db.$transaction(async tx => {
      const rows = [];
      for (const r of valid) {
        const existing = await tx.gSTPurchaseRecord.findFirst({ where: { businessId: id, invoiceNumber: r.invoiceNumber, invoiceDate: r.invoiceDate } });
        rows.push(existing ? await tx.gSTPurchaseRecord.update({ where: { id: existing.id }, data: r }) : await tx.gSTPurchaseRecord.create({ data: r }));
      }
      await tx.gSTReturnPeriod.upsert({
        where: { businessId_period_returnType: { businessId: id, period, returnType: 'GSTR2B' } },
        create: { businessId: id, period, returnType: 'GSTR2B', status: 'IMPORTED' },
        update: { status: 'IMPORTED' },
      });
      return rows;
    });
    await db.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'IMPORT', entity: 'GSTR2B', entityId: period, metadata: { count: created.length } } });
    return { imported: created.length, records: created };
  }

  /** Reconcile the purchase book against the imported GSTR-2B records for a period. */
  @Post('reconciliation/:period/run')
  async runReconciliation(@Headers('authorization') h: string, @Param('id') id: string, @Param('period') period: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    if (!/^\d{4}-\d{2}$/.test(period)) throw new BadRequestException('period must be YYYY-MM');
    const [year, month] = period.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1)), end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const purchases = await db.purchase.findMany({ where: { businessId: id, invoiceDate: { gte: start, lte: end } }, include: { supplier: true } });
    const returnRecords = await db.gSTPurchaseRecord.findMany({ where: { businessId: id, invoiceDate: { gte: start, lte: end } } });
    const book: ReconcileRecord[] = purchases.map(x => ({
      gstin: x.supplier.gstin ?? undefined,
      invoiceNumber: x.invoiceNumber,
      invoiceDate: x.invoiceDate.toISOString().slice(0, 10),
      taxable: x.taxableValue.toString(), cgst: x.cgst.toString(), sgst: x.sgst.toString(), igst: x.igst.toString(), cess: x.cess.toString(),
    }));
    const ret: ReconcileRecord[] = returnRecords.map(x => ({
      gstin: x.supplierGstin ?? undefined,
      invoiceNumber: x.invoiceNumber,
      invoiceDate: x.invoiceDate.toISOString().slice(0, 10),
      taxable: x.taxableValue.toString(), cgst: x.cgst.toString(), sgst: x.sgst.toString(), igst: x.igst.toString(), cess: x.cess.toString(),
    }));
    const pairs = reconcileSets(book, ret);
    const counts = { MATCHED: 0, PROBABLE: 0, PARTIAL: 0, MISSING: 0, EXTRA: 0, MISMATCH: 0, REVIEW: 0 } as Record<string, number>;
    const items = pairs.map(pr => {
      const result = pr.result;
      counts[result.status] = (counts[result.status] ?? 0) + 1;
      const bookRow = pr.bookIndex !== null ? book[pr.bookIndex] : null;
      const retRow = pr.returnIndex !== null ? ret[pr.returnIndex] : null;
      return {
        bookInvoiceNumber: bookRow?.invoiceNumber ?? null,
        returnInvoiceNumber: retRow?.invoiceNumber ?? null,
        supplierGstin: bookRow?.gstin ?? retRow?.gstin ?? null,
        taxableDifference: result.taxableDifference.toFixed(2),
        taxDifference: result.taxDifference.toFixed(2),
        score: result.score,
        status: result.status,
      };
    });
    const reconciliation = await db.gSTReconciliation.create({
      data: {
        businessId: id, name: `GSTR-2B ${period}`, status: 'COMPLETED', total: items.length,
        matched: counts.MATCHED, partial: counts.PARTIAL, missing: counts.MISSING, extra: counts.EXTRA, mismatch: counts.MISMATCH,
        items: { create: pairs.map(pr => ({ returnRecordId: pr.returnIndex !== null ? returnRecords[pr.returnIndex].id : null, bookRecordKey: pr.bookIndex !== null ? book[pr.bookIndex].invoiceNumber : null, status: pr.result.status, score: pr.result.score, taxDifference: pr.result.taxDifference.toFixed(2), taxableDifference: pr.result.taxableDifference.toFixed(2) })) },
      },
    });
    await db.gSTReturnPeriod.upsert({ where: { businessId_period_returnType: { businessId: id, period, returnType: 'GSTR2B' } }, create: { businessId: id, period, returnType: 'GSTR2B', status: 'RECONCILED' }, update: { status: 'RECONCILED' } });
    await db.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'RUN', entity: 'GSTReconciliation', entityId: reconciliation.id, metadata: { period, ...counts } } });
    return { reconciliationId: reconciliation.id, period, counts, items };
  }

  /** Exception workflow: non-matched items from the latest reconciliation for a period. */
  @Get('reconciliation/:period/exceptions')
  async exceptions(@Headers('authorization') h: string, @Param('id') id: string, @Param('period') period: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const reconciliation = await db.gSTReconciliation.findFirst({ where: { businessId: id, name: `GSTR-2B ${period}` }, orderBy: { id: 'desc' }, include: { items: true } });
    if (!reconciliation) throw new NotFoundException('Run a reconciliation for this period first');
    const EXCEPTION_STATUSES = ['PARTIAL', 'MISMATCH', 'REVIEW'];
    const exceptionItems = reconciliation.items.filter(i => EXCEPTION_STATUSES.includes(i.status));
    const missing = reconciliation.items.filter(i => i.status === 'MISSING');
    const extra = reconciliation.items.filter(i => i.status === 'EXTRA');
    return { reconciliationId: reconciliation.id, mismatches: exceptionItems, missingInReturn: missing, extraInReturn: extra };
  }
}
