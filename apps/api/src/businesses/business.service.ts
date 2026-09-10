import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type BusinessSummary = { id: string; organizationId: string; clientId: string; name: string; tradeName: string | null; pan: string | null; gstin: string | null; createdAt: Date; updatedAt: Date };
export type BusinessListResult = { items: BusinessSummary[]; nextCursor: string | null };
export type BusinessInput = { clientId: string; name: string; tradeName?: string; pan?: string; gstin?: string };
export type BusinessUpdateInput = { name?: string; tradeName?: string; pan?: string; gstin?: string };

type BusinessReader = Pick<PrismaClient, 'business'>;
type BusinessWriter = Pick<PrismaClient, '$transaction'>;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function encodeBusinessCursor(businessId: string): string { return Buffer.from(JSON.stringify({ businessId }), 'utf8').toString('base64url'); }
export function decodeBusinessCursor(cursor: string): string {
  if (cursor.length < 8 || cursor.length > 512) throw new BadRequestException('Invalid business cursor');
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { businessId?: unknown };
    if (typeof decoded.businessId !== 'string' || decoded.businessId.length < 1 || decoded.businessId.length > 128) throw new Error('Invalid cursor');
    return decoded.businessId;
  } catch { throw new BadRequestException('Invalid business cursor'); }
}
export function normalizeBusinessPageSize(value: string | undefined): number {
  if (value === undefined) return DEFAULT_PAGE_SIZE;
  if (!/^\d+$/.test(value)) throw new BadRequestException('Invalid business page size');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) throw new BadRequestException('Invalid business page size');
  return parsed;
}

const businessSelect = { id: true, organizationId: true, clientId: true, name: true, tradeName: true, pan: true, gstin: true, createdAt: true, updatedAt: true } as const;

export async function listBusinessesForOrganization(prisma: BusinessReader, organizationId: string, limit: number, cursor?: string): Promise<BusinessListResult> {
  const businessCursor = cursor ? decodeBusinessCursor(cursor) : undefined;
  if (businessCursor) {
    const validCursor = await prisma.business.findFirst({ where: { id: businessCursor, organizationId }, select: { id: true } });
    if (!validCursor) throw new BadRequestException('Invalid business cursor');
  }
  const businesses = await prisma.business.findMany({ where: { organizationId }, ...(businessCursor ? { cursor: { id: businessCursor }, skip: 1 } : {}), take: limit + 1, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: businessSelect });
  const hasNextPage = businesses.length > limit;
  const page = hasNextPage ? businesses.slice(0, limit) : businesses;
  return { items: page, nextCursor: hasNextPage ? encodeBusinessCursor(page[page.length - 1]!.id) : null };
}

export async function getBusinessForOrganization(prisma: BusinessReader, organizationId: string, businessId: string): Promise<BusinessSummary> {
  const business = await prisma.business.findFirst({ where: { id: businessId, organizationId }, select: businessSelect });
  if (!business) throw new NotFoundException('Business not found');
  return business;
}

export async function createBusinessForOrganization(prisma: BusinessWriter, organizationId: string, input: BusinessInput, actorUserId: string, requestId: string): Promise<BusinessSummary> {
  return prisma.$transaction(async (tx) => {
    const client = await tx.client.findFirst({ where: { id: input.clientId, organizationId }, select: { id: true } });
    if (!client) throw new NotFoundException('Client not found');
    try {
      const business = await tx.business.create({ data: { organizationId, clientId: input.clientId, name: input.name, ...(input.tradeName !== undefined ? { tradeName: input.tradeName } : {}), ...(input.pan !== undefined ? { pan: input.pan } : {}), ...(input.gstin !== undefined ? { gstin: input.gstin } : {}) }, select: businessSelect });
      await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'BUSINESS_CREATED', entityType: 'Business', entityId: business.id, requestId, metadata: { clientId: business.clientId, name: business.name, tradeName: business.tradeName, pan: business.pan, gstin: business.gstin } } });
      return business;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('A business with this GSTIN already exists in the organization');
      throw error;
    }
  });
}

export async function updateBusinessForOrganization(prisma: BusinessWriter, organizationId: string, businessId: string, input: BusinessUpdateInput, actorUserId: string, requestId: string): Promise<BusinessSummary> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.business.findFirst({ where: { id: businessId, organizationId }, select: businessSelect });
    if (!existing) throw new NotFoundException('Business not found');
    try {
      const business = await tx.business.update({ where: { id: businessId }, data: { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.tradeName !== undefined ? { tradeName: input.tradeName } : {}), ...(input.pan !== undefined ? { pan: input.pan } : {}), ...(input.gstin !== undefined ? { gstin: input.gstin } : {}) }, select: businessSelect });
      await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'BUSINESS_UPDATED', entityType: 'Business', entityId: business.id, requestId, metadata: { before: { name: existing.name, tradeName: existing.tradeName, pan: existing.pan, gstin: existing.gstin }, after: { name: business.name, tradeName: business.tradeName, pan: business.pan, gstin: business.gstin } } } });
      return business;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('A business with this GSTIN already exists in the organization');
      throw error;
    }
  });
}

function isUniqueConstraintError(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002'; }

@Injectable()
export class BusinessService {
  private readonly prisma = new PrismaClient();
  async list(organizationId: string, limit: number, cursor?: string): Promise<BusinessListResult> { return listBusinessesForOrganization(this.prisma, organizationId, limit, cursor); }
  async get(organizationId: string, businessId: string): Promise<BusinessSummary> { return getBusinessForOrganization(this.prisma, organizationId, businessId); }
  async create(organizationId: string, input: BusinessInput, actorUserId: string, requestId: string): Promise<BusinessSummary> { return createBusinessForOrganization(this.prisma, organizationId, input, actorUserId, requestId); }
  async update(organizationId: string, businessId: string, input: BusinessUpdateInput, actorUserId: string, requestId: string): Promise<BusinessSummary> { return updateBusinessForOrganization(this.prisma, organizationId, businessId, input, actorUserId, requestId); }
  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}
