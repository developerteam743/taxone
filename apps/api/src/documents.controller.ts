import { Controller, Get, Post, Body, Param, Headers, Res, UploadedFile, UseInterceptors, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { claims } from './auth';

const db = new PrismaClient();

let ocrQueue: Queue | null = null;
function queue() {
  if (!ocrQueue) ocrQueue = new Queue('ocr', { connection: new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null }) });
  return ocrQueue;
}

@Controller('api/v1/businesses/:id/documents')
export class DocumentsController {
  @Get()
  async list(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    return db.document.findMany({ where: { businessId: id }, include: { ocrJobs: { include: { result: true } } }, orderBy: { id: 'desc' }, take: 100 });
  }

  /** Upload a document, checksum it for duplicate detection, and enqueue OCR. */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Headers('authorization') h: string, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    if (!file?.buffer?.length) throw new BadRequestException('file is required');
    if (file.size > 10 * 1024 * 1024) throw new BadRequestException('File exceeds 10MB limit');
    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const duplicate = await db.document.findFirst({ where: { organizationId: p.organizationId, checksum } });
    if (duplicate) return { duplicateOf: duplicate.id, document: duplicate, message: 'Identical document already uploaded' };
    const storageKey = `${p.organizationId}/${checksum}-${file.originalname}`;
    const dir = join(process.env.STORAGE_DIR ?? '/tmp/taxone-storage', p.organizationId);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${checksum}-${file.originalname}`), file.buffer);
    const document = await db.document.create({
      data: {
        organizationId: p.organizationId, businessId: id, filename: file.originalname, mimeType: file.mimetype,
        size: BigInt(file.size), checksum, storageKey, status: DocumentStatus.PROCESSING, uploaderId: p.sub,
        ocrJobs: { create: { status: 'QUEUED', provider: process.env.OCR_PROVIDER ?? 'mock' } },
      },
      include: { ocrJobs: true },
    });
    await queue().add('extract', { documentId: document.id, jobId: document.ocrJobs[0].id, storageKey }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    return { document };
  }

  @Get(':docId')
  async get(@Headers('authorization') h: string, @Param('id') id: string, @Param('docId') docId: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const document = await db.document.findFirst({ where: { id: docId, businessId: id }, include: { ocrJobs: { include: { result: true } }, reviews: true } });
    if (!document) throw new NotFoundException();
    return document;
  }

  /** Human review: approve with corrections and generate a draft purchase entry; reject to discard. */
  @Post(':docId/review')
  async review(@Headers('authorization') h: string, @Param('id') id: string, @Param('docId') docId: string, @Body() b: { action: 'APPROVE' | 'REJECT'; corrections?: { supplierName?: string; supplierGstin?: string; invoiceNumber?: string; invoiceDate?: string; taxableValue?: number | string; cgst?: number | string; sgst?: number | string; igst?: number | string; cess?: number | string; supplierId?: string } }) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const document = await db.document.findFirst({ where: { id: docId, businessId: id }, include: { ocrJobs: { include: { result: true } } } });
    if (!document) throw new NotFoundException();
    if (document.status !== DocumentStatus.REVIEW) throw new BadRequestException('Document is not awaiting review');
    if (b.action === 'REJECT') {
      await db.documentReview.create({ data: { documentId: docId, reviewerId: p.sub, status: 'REJECTED' } });
      const updated = await db.document.update({ where: { id: docId }, data: { status: DocumentStatus.REJECTED } });
      await db.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'REVIEW', entity: 'Document', entityId: docId, metadata: { action: 'REJECT' } } });
      return updated;
    }
    const extracted = { ...(document.ocrJobs[0]?.result?.structuredJson as Record<string, unknown> ?? {}), ...(b.corrections ?? {}) };
    const invoiceNumber = String(extracted.invoiceNumber ?? '').trim();
    const invoiceDate = extracted.invoiceDate ? new Date(String(extracted.invoiceDate)) : new Date();
    const taxable = Number(extracted.taxableValue ?? 0);
    if (!invoiceNumber || !isFinite(taxable) || taxable <= 0) throw new BadRequestException('invoiceNumber and taxableValue are required (provide corrections)');
    // Duplicate detection: same business + supplier invoice number already booked.
    const dup = await db.purchase.findFirst({ where: { businessId: id, invoiceNumber } });
    if (dup) return { duplicateOf: dup.id, message: `Purchase ${invoiceNumber} is already booked`, document: await db.document.update({ where: { id: docId }, data: { status: DocumentStatus.REJECTED } }) };
    let supplierId = extracted.supplierId ? String(extracted.supplierId) : undefined;
    if (!supplierId && extracted.supplierGstin) {
      const supplier = await db.supplier.findFirst({ where: { businessId: id, gstin: String(extracted.supplierGstin) } });
      supplierId = supplier?.id;
    }
    if (!supplierId) {
      const supplier = await db.supplier.create({ data: { businessId: id, name: String(extracted.supplierName ?? `Supplier ${String(extracted.supplierGstin ?? invoiceNumber)}`), gstin: extracted.supplierGstin ? String(extracted.supplierGstin) : undefined } });
      supplierId = supplier.id;
    }
    const purchase = await db.purchase.create({
      data: {
        businessId: id, supplierId, invoiceNumber, invoiceDate,
        taxableValue: taxable.toFixed(2),
        cgst: Number(extracted.cgst ?? 0).toFixed(2), sgst: Number(extracted.sgst ?? 0).toFixed(2),
        igst: Number(extracted.igst ?? 0).toFixed(2), cess: Number(extracted.cess ?? 0).toFixed(2),
        itcEligible: true, status: 'VALIDATED',
      },
    });
    await db.documentReview.create({ data: { documentId: docId, reviewerId: p.sub, status: 'APPROVED', corrections: (b.corrections ?? undefined) as object | undefined } });
    const updated = await db.document.update({ where: { id: docId }, data: { status: DocumentStatus.APPROVED } });
    await db.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'REVIEW', entity: 'Document', entityId: docId, metadata: { action: 'APPROVE', purchaseId: purchase.id } } });
    return { document: updated, purchase };
  }
}
