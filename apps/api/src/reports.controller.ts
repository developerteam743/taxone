import { Controller, Get, Param, Headers, Query, Header, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { claims, csv } from './auth';

const db = new PrismaClient();

type Line = { accountId: string; debit: Decimal; credit: Decimal };

async function postedLines(businessId: string, from?: Date, to?: Date): Promise<Line[]> {
  const entries = await db.journalEntry.findMany({
    where: { businessId, status: 'POSTED', date: { gte: from, lte: to } },
    include: { lines: true },
  });
  return entries.flatMap(e => e.lines.map(l => ({ accountId: l.accountId, debit: new Decimal(l.debit.toString()), credit: new Decimal(l.credit.toString()) })));
}

function accountMap(accounts: { id: string; code: string; name: string; type: string }[]) {
  return new Map(accounts.map(a => [a.id, a]));
}

function sumLines(lines: Line[]) {
  const m = new Map<string, { debit: Decimal; credit: Decimal }>();
  for (const l of lines) {
    const x = m.get(l.accountId) ?? { debit: new Decimal(0), credit: new Decimal(0) };
    m.set(l.accountId, { debit: x.debit.plus(l.debit), credit: x.credit.plus(l.credit) });
  }
  return m;
}

function parseRange(from?: string, to?: string) {
  const f = from ? new Date(from) : undefined;
  const t = to ? new Date(to) : undefined;
  if (from && isNaN(f!.getTime())) throw new BadRequestException('Invalid from date');
  if (to && isNaN(t!.getTime())) throw new BadRequestException('Invalid to date');
  return { f, t };
}

@Controller('api/v1/businesses/:id/reports')
export class ReportsController {
  @Get('ledger')
  async ledger(@Headers('authorization') h: string, @Param('id') id: string, @Query('accountId') accountId: string, @Query('from') from?: string, @Query('to') to?: string, @Query('format') format?: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    if (!accountId) throw new BadRequestException('accountId is required');
    const account = await db.account.findFirst({ where: { id: accountId, businessId: id } });
    if (!account) throw new NotFoundException('Account not found');
    const { f, t } = parseRange(from, to);
    const entries = await db.journalEntry.findMany({
      where: { businessId: id, status: 'POSTED', date: { gte: f, lte: t } },
      include: { lines: { where: { accountId } } },
      orderBy: [{ date: 'asc' }, { entryNumber: 'asc' }],
    });
    let balance = new Decimal(0);
    const rows = entries.map(e => {
      const line = e.lines[0];
      const debit = new Decimal(line.debit.toString()), credit = new Decimal(line.credit.toString());
      balance = balance.plus(debit).minus(credit);
      return { date: e.date.toISOString().slice(0, 10), entryNumber: e.entryNumber, narration: e.narration, debit: debit.toFixed(2), credit: credit.toFixed(2), balance: balance.toFixed(2) };
    });
    if (format === 'csv') return csv(rows);
    return { account: { id: account.id, code: account.code, name: account.name }, rows };
  }

  @Get('trial-balance')
  async trialBalance(@Headers('authorization') h: string, @Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string, @Query('format') format?: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const { f, t } = parseRange(from, to);
    const accounts = await db.account.findMany({ where: { businessId: id } });
    const totals = sumLines(await postedLines(id, f, t));
    let totalDebit = new Decimal(0), totalCredit = new Decimal(0);
    const rows = accounts.map(a => {
      const x = totals.get(a.id) ?? { debit: new Decimal(0), credit: new Decimal(0) };
      const net = ['ASSET', 'EXPENSE'].includes(a.type) ? x.debit.minus(x.credit) : x.credit.minus(x.debit);
      totalDebit = totalDebit.plus(net.gt(0) ? net : new Decimal(0));
      totalCredit = totalCredit.plus(net.lt(0) ? net.neg() : new Decimal(0));
      return { code: a.code, name: a.name, type: a.type, debit: net.gt(0) ? net.toFixed(2) : '0.00', credit: net.lt(0) ? net.neg().toFixed(2) : '0.00' };
    }).filter(r => r.debit !== '0.00' || r.credit !== '0.00');
    return { rows, totalDebit: totalDebit.toFixed(2), totalCredit: totalCredit.toFixed(2) };
  }

  @Get('pnl')
  async pnl(@Headers('authorization') h: string, @Param('id') id: string, @Query('from') from?: string, @Query('to') to?: string, @Query('format') format?: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const { f, t } = parseRange(from, to);
    const accounts = await db.account.findMany({ where: { businessId: id, type: { in: ['INCOME', 'EXPENSE'] } } });
    const totals = sumLines(await postedLines(id, f, t));
    const map = accountMap(accounts);
    let income = new Decimal(0), expense = new Decimal(0);
    const incomeRows: unknown[] = [], expenseRows: unknown[] = [];
    for (const [accountId, x] of totals) {
      const a = map.get(accountId);
      if (!a) continue;
      const net = a.type === 'INCOME' ? new Decimal(0).plus(x.credit).minus(x.debit) : x.debit.minus(x.credit);
      if (a.type === 'INCOME') { income = income.plus(net); incomeRows.push({ code: a.code, name: a.name, amount: net.toFixed(2) }); }
      else { expense = expense.plus(net); expenseRows.push({ code: a.code, name: a.name, amount: net.toFixed(2) }); }
    }
    return { income: incomeRows, expense: expenseRows, totalIncome: income.toFixed(2), totalExpense: expense.toFixed(2), netProfit: income.minus(expense).toFixed(2) };
  }

  @Get('balance-sheet')
  async balanceSheet(@Headers('authorization') h: string, @Param('id') id: string, @Query('asOf') asOf?: string, @Query('format') format?: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const t = asOf ? new Date(asOf) : new Date();
    if (asOf && isNaN(t.getTime())) throw new BadRequestException('Invalid asOf date');
    const accounts = await db.account.findMany({ where: { businessId: id } });
    const totals = sumLines(await postedLines(id, undefined, t));
    const map = accountMap(accounts);
    let assets = new Decimal(0), liabilities = new Decimal(0), equity = new Decimal(0), income = new Decimal(0), expense = new Decimal(0);
    const rows: Record<string, unknown[]> = { ASSET: [], LIABILITY: [], EQUITY: [] };
    for (const [accountId, x] of totals) {
      const a = map.get(accountId);
      if (!a) continue;
      const net = ['ASSET', 'EXPENSE'].includes(a.type) ? x.debit.minus(x.credit) : x.credit.minus(x.debit);
      if (a.type === 'ASSET') { assets = assets.plus(net); rows.ASSET.push({ code: a.code, name: a.name, amount: net.toFixed(2) }); }
      else if (a.type === 'LIABILITY') { liabilities = liabilities.plus(net); rows.LIABILITY.push({ code: a.code, name: a.name, amount: net.toFixed(2) }); }
      else if (a.type === 'EQUITY') { equity = equity.plus(net); rows.EQUITY.push({ code: a.code, name: a.name, amount: net.toFixed(2) }); }
      else if (a.type === 'INCOME') income = income.plus(net);
      else expense = expense.plus(net);
    }
    const netProfit = income.minus(expense);
    return { ...rows, totalAssets: assets.toFixed(2), totalLiabilities: liabilities.toFixed(2), totalEquity: equity.plus(netProfit).toFixed(2), netProfit: netProfit.toFixed(2) };
  }

  @Get('exports/invoices.csv')
  async invoicesCsv(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    const biz = await db.business.findFirst({ where: { id, organizationId: p.organizationId } });
    if (!biz) throw new ForbiddenException();
    const invoices = await db.invoice.findMany({ where: { businessId: id }, include: { customer: true }, orderBy: { invoiceDate: 'desc' } });
    return csv(invoices.map(i => ({ invoiceNumber: i.invoiceNumber, date: i.invoiceDate.toISOString().slice(0, 10), customer: i.customer?.name ?? '', taxableValue: i.taxableValue.toString(), cgst: i.cgst.toString(), sgst: i.sgst.toString(), igst: i.igst.toString(), cess: i.cess.toString(), total: i.total.toString(), status: i.status })));
  }
}
