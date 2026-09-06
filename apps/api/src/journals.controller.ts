import { Controller, Get, Post, Body, Param, Headers, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient, EntryStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { claims } from './auth';
import { assertBalanced } from '@taxone/accounting';

const db = new PrismaClient();

@Controller('api/v1/businesses/:id/journals')
export class JournalsController {
  @Get()
  async list(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    return db.journalEntry.findMany({ where: { businessId: id }, include: { lines: { include: { account: true } } }, orderBy: { entryNumber: 'desc' }, take: 100 });
  }

  /** Manual journal posting. Lines must balance (debit == credit). */
  @Post()
  async create(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { date?: string; narration: string; lines: { accountId: string; debit: number | string; credit: number | string; description?: string }[] }) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    if (!b?.narration?.trim() || !Array.isArray(b.lines) || b.lines.length < 2) throw new BadRequestException('narration and at least two lines are required');
    const lines = b.lines.map(l => ({ accountId: l.accountId, debit: new Decimal(String(l.debit ?? 0)).toFixed(2), credit: new Decimal(String(l.credit ?? 0)).toFixed(2), description: l.description }));
    assertBalanced(lines);
    const date = b.date ? new Date(b.date) : new Date();
    const fy = await db.financialYear.findFirst({ where: { businessId: id, startDate: { lte: date }, endDate: { gte: date } } });
    if (!fy) throw new BadRequestException('No financial year covers this date');
    for (const l of lines) {
      const account = await db.account.findFirst({ where: { id: l.accountId, businessId: id } });
      if (!account) throw new BadRequestException(`Account ${l.accountId} does not belong to this business`);
    }
    return db.$transaction(async tx => {
      const last = await tx.journalEntry.findFirst({ where: { businessId: id }, orderBy: { entryNumber: 'desc' } });
      const entry = await tx.journalEntry.create({
        data: { businessId: id, financialYearId: fy.id, entryNumber: (last?.entryNumber ?? 0) + 1, date, narration: b.narration.trim(), sourceType: 'MANUAL', status: EntryStatus.POSTED, lines: { create: lines } },
        include: { lines: { include: { account: true } } },
      });
      await tx.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'CREATE', entity: 'JournalEntry', entityId: entry.id, metadata: { entryNumber: entry.entryNumber } } });
      return entry;
    });
  }
}
