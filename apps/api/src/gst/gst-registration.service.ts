import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type GstRegistrationSummary = { id: string; organizationId: string; businessId: string; gstin: string; legalName: string; registrationType: string; status: string; effectiveFrom: Date | null; createdAt: Date; updatedAt: Date };
export type GstRegistrationListResult = { items: GstRegistrationSummary[]; nextCursor: string | null };
export type GstRegistrationInput = { businessId: string; gstin: string; legalName: string; registrationType?: string; status?: string; effectiveFrom?: string };

type GstReader = Pick<PrismaClient, 'gstRegistration'>;
type GstWriter = Pick<PrismaClient, '$transaction'>;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const registrationSelect = { id: true, organizationId: true, businessId: true, gstin: true, legalName: true, registrationType: true, status: true, effectiveFrom: true, createdAt: true, updatedAt: true } as const;

export function encodeGstRegistrationCursor(id: string): string { return Buffer.from(JSON.stringify({ id }), 'utf8').toString('base64url'); }
export function decodeGstRegistrationCursor(cursor: string): string {
  if (cursor.length < 8 || cursor.length > 512) throw new BadRequestException('Invalid GST registration cursor');
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { id?: unknown };
    if (typeof decoded.id !== 'string' || decoded.id.length < 1 || decoded.id.length > 128) throw new Error('Invalid cursor');
    return decoded.id;
  } catch { throw new BadRequestException('Invalid GST registration cursor'); }
}
export function normalizeGstRegistrationPageSize(value: string | undefined): number {
  if (value === undefined) return DEFAULT_PAGE_SIZE;
  if (!/^\d+$/.test(value)) throw new BadRequestException('Invalid GST registration page size');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) throw new BadRequestException('Invalid GST registration page size');
  return parsed;
}

export async function listGstRegistrationsForOrganization(prisma: GstReader, organizationId: string, limit: number, cursor?: string, businessId?: string): Promise<GstRegistrationListResult> {
  const registrationCursor = cursor ? decodeGstRegistrationCursor(cursor) : undefined;
  if (registrationCursor) {
    const validCursor = await prisma.gstRegistration.findFirst({ where: { id: registrationCursor, organizationId, ...(businessId ? { businessId } : {}) }, select: { id: true } });
    if (!validCursor) throw new BadRequestException('Invalid GST registration cursor');
  }
  const registrations = await prisma.gstRegistration.findMany({ where: { organizationId, ...(businessId ? { businessId } : {}) }, ...(registrationCursor ? { cursor: { id: registrationCursor }, skip: 1 } : {}), take: limit + 1, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: registrationSelect });
  const hasNextPage = registrations.length > limit;
  const page = hasNextPage ? registrations.slice(0, limit) : registrations;
  return { items: page, nextCursor: hasNextPage ? encodeGstRegistrationCursor(page[page.length - 1]!.id) : null };
}

export async function createGstRegistrationForOrganization(prisma: GstWriter, organizationId: string, input: GstRegistrationInput, actorUserId: string, requestId: string): Promise<GstRegistrationSummary> {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.findFirst({ where: { id: input.businessId, organizationId }, select: { id: true } });
    if (!business) throw new NotFoundException('Business not found');
    try {
      const registration = await tx.gstRegistration.create({ data: { organizationId, businessId: input.businessId, gstin: input.gstin, legalName: input.legalName, registrationType: input.registrationType ?? 'REGULAR', status: input.status ?? 'ACTIVE', ...(input.effectiveFrom !== undefined ? { effectiveFrom: new Date(input.effectiveFrom) } : {}) }, select: registrationSelect });
      await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'GST_REGISTRATION_CREATED', entityType: 'GstRegistration', entityId: registration.id, requestId, metadata: { businessId: registration.businessId, gstin: registration.gstin, legalName: registration.legalName, registrationType: registration.registrationType, status: registration.status, effectiveFrom: registration.effectiveFrom?.toISOString() ?? null } } });
      return registration;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('A GST registration with this GSTIN already exists in the organization');
      throw error;
    }
  });
}

function isUniqueConstraintError(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002'; }

@Injectable()
export class GstRegistrationService {
  private readonly prisma = new PrismaClient();
  async list(organizationId: string, limit: number, cursor?: string, businessId?: string): Promise<GstRegistrationListResult> { return listGstRegistrationsForOrganization(this.prisma, organizationId, limit, cursor, businessId); }
  async create(organizationId: string, input: GstRegistrationInput, actorUserId: string, requestId: string): Promise<GstRegistrationSummary> { return createGstRegistrationForOrganization(this.prisma, organizationId, input, actorUserId, requestId); }
  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}
