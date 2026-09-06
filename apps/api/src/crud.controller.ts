import { Controller, Get, Post, Body, Param, Headers, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, AccountType, InvoiceStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { claims, positive, nonNegative } from './auth';

const db = new PrismaClient();

/** Helper: verify the business belongs to the caller's organization, else 403. */
async function ownBusiness(organizationId: string, businessId: string) {
  const biz = await db.business.findFirst({ where: { id: businessId, organizationId } });
  if (!biz) throw new ForbiddenException();
  return biz;
}

@Controller('api/v1')
export class CrudController {
  // ---- Clients -------------------------------------------------------------
  @Get('clients')
  async clients(@Headers('authorization') h: string) {
    const p = claims(h);
    return db.client.findMany({ where: { organizationId: p.organizationId }, orderBy: { name: 'asc' } });
  }

  @Post('clients')
  async createClient(@Headers('authorization') h: string, @Body() b: { name: string; email?: string; phone?: string; address?: string }) {
    const p = claims(h);
    if (!b?.name?.trim()) throw new BadRequestException('name is required');
    return db.client.create({ data: { organizationId: p.organizationId, name: b.name.trim(), email: b.email, phone: b.phone, address: b.address } });
  }

  // ---- Businesses ----------------------------------------------------------
  @Post('businesses')
  async createBusiness(@Headers('authorization') h: string, @Body() b: { legalName: string; tradeName?: string; pan?: string; clientId?: string }) {
    const p = claims(h);
    if (!b?.legalName?.trim()) throw new BadRequestException('legalName is required');
    if (b.clientId) {
      const client = await db.client.findFirst({ where: { id: b.clientId, organizationId: p.organizationId } });
      if (!client) throw new BadRequestException('Client does not belong to this organization');
    }
    return db.business.create({ data: { organizationId: p.organizationId, legalName: b.legalName.trim(), tradeName: b.tradeName, pan: b.pan, clientId: b.clientId } });
  }

  // ---- Chart of accounts ---------------------------------------------------
  @Get('businesses/:id/accounts')
  async accounts(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    return db.account.findMany({ where: { businessId: id }, orderBy: { code: 'asc' } });
  }

  @Post('businesses/:id/accounts')
  async createAccount(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { code: string; name: string; type: AccountType; parentId?: string }) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    if (!b?.code?.trim() || !b?.name?.trim()) throw new BadRequestException('code and name are required');
    if (!Object.values(AccountType).includes(b.type)) throw new BadRequestException('Invalid account type');
    const exists = await db.account.findFirst({ where: { businessId: id, code: b.code.trim() } });
    if (exists) throw new BadRequestException(`Account code ${b.code.trim()} already exists`);
    if (b.parentId) {
      const parent = await db.account.findFirst({ where: { id: b.parentId, businessId: id } });
      if (!parent) throw new BadRequestException('Parent account does not belong to this business');
    }
    return db.account.create({ data: { businessId: id, code: b.code.trim(), name: b.name.trim(), type: b.type, parentId: b.parentId } });
  }

  // ---- Suppliers -----------------------------------------------------------
  @Get('businesses/:id/suppliers')
  async suppliers(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    return db.supplier.findMany({ where: { businessId: id }, orderBy: { name: 'asc' } });
  }

  @Post('businesses/:id/suppliers')
  async createSupplier(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { name: string; gstin?: string; pan?: string; address?: string; phone?: string; email?: string }) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    if (!b?.name?.trim()) throw new BadRequestException('name is required');
    return db.supplier.create({ data: { businessId: id, name: b.name.trim(), gstin: b.gstin, pan: b.pan, address: b.address, phone: b.phone, email: b.email } });
  }

  // ---- Items ---------------------------------------------------------------
  @Get('businesses/:id/items')
  async items(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    return db.item.findMany({ where: { businessId: id }, orderBy: { name: 'asc' } });
  }

  @Post('businesses/:id/items')
  async createItem(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { name: string; sku?: string; hsnSac?: string; unit?: string; saleRate?: number; purchaseRate?: number; gstRate?: number }) {
    const p = claims(h);
    await ownBusiness(p.organizationId, id);
    if (!b?.name?.trim()) throw new BadRequestException('name is required');
    const saleRate = nonNegative(b.saleRate ?? 0, 'saleRate');
    const purchaseRate = nonNegative(b.purchaseRate ?? 0, 'purchaseRate');
    const gstRate = nonNegative(b.gstRate ?? 0, 'gstRate');
    if (gstRate.gt(100)) throw new BadRequestException('gstRate cannot exceed 100');
    const exists = await db.item.findFirst({ where: { businessId: id, name: b.name.trim() } });
    if (exists) throw new BadRequestException(`Item "${b.name.trim()}" already exists`);
    return db.item.create({ data: { businessId: id, name: b.name.trim(), sku: b.sku, hsnSac: b.hsnSac, unit: b.unit?.trim() || 'NOS', saleRate: saleRate.toFixed(2), purchaseRate: purchaseRate.toFixed(2), gstRate: gstRate.toFixed(2) } });
  }

  // ---- Credit / debit notes ------------------------------------------------
  private async listNotes(h: string, businessId: string, model: 'creditNote' | 'debitNote') {
    const p = claims(h);
    await ownBusiness(p.organizationId, businessId);
    return (db[model] as any).findMany({ where: { businessId }, orderBy: { date: 'desc' }, take: 200 });
  }

  private async createNote(h: string, businessId: string, body: { number: string; date?: string; amount: number; reason: string }, model: 'creditNote' | 'debitNote', entity: string) {
    const p = claims(h);
    await ownBusiness(p.organizationId, businessId);
    if (!body?.number?.trim() || !body?.reason?.trim()) throw new BadRequestException('number and reason are required');
    const amount = positive(body.amount, 'amount');
    const note = await (db[model] as any).create({ data: { businessId, number: body.number.trim(), date: body.date ? new Date(body.date) : new Date(), amount: amount.toFixed(2), reason: body.reason.trim() } });
    await db.auditLog.create({ data: { organizationId: p.organizationId, userId: p.sub, action: 'CREATE', entity, entityId: note.id, metadata: { amount: amount.toFixed(2) } } });
    return note;
  }

  @Get('businesses/:id/credit-notes')
  async creditNotes(@Headers('authorization') h: string, @Param('id') id: string) { return this.listNotes(h, id, 'creditNote'); }

  @Post('businesses/:id/credit-notes')
  async createCreditNote(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { number: string; date?: string; amount: number; reason: string }) {
    return this.createNote(h, id, b, 'creditNote', 'CreditNote');
  }

  @Get('businesses/:id/debit-notes')
  async debitNotes(@Headers('authorization') h: string, @Param('id') id: string) { return this.listNotes(h, id, 'debitNote'); }

  @Post('businesses/:id/debit-notes')
  async createDebitNote(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: { number: string; date?: string; amount: number; reason: string }) {
    return this.createNote(h, id, b, 'debitNote', 'DebitNote');
  }

  // ---- Notifications -------------------------------------------------------
  @Get('notifications')
  async notifications(@Headers('authorization') h: string) {
    const p = claims(h);
    return db.notification.findMany({ where: { organizationId: p.organizationId, userId: p.sub }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post('notifications/:id/read')
  async markRead(@Headers('authorization') h: string, @Param('id') id: string) {
    const p = claims(h);
    const n = await db.notification.findFirst({ where: { id, organizationId: p.organizationId, userId: p.sub } });
    if (!n) throw new NotFoundException();
    return db.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
}
