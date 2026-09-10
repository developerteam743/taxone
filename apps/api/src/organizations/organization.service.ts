import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type OrganizationSummary = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationMember = {
  id: string;
  userId: string;
  role: string;
  user: { id: string; email: string; name: string };
  createdAt: Date;
};

export type OrganizationListResult = {
  items: OrganizationSummary[];
  nextCursor: string | null;
};

type OrganizationReader = Pick<PrismaClient, 'organization' | 'membership'>;
type OrganizationWriter = Pick<PrismaClient, '$transaction'>;

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function encodeOrganizationCursor(membershipId: string): string {
  return Buffer.from(JSON.stringify({ membershipId }), 'utf8').toString('base64url');
}

export function decodeOrganizationCursor(cursor: string): string {
  if (cursor.length < 8 || cursor.length > 512) throw new BadRequestException('Invalid organization cursor');
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { membershipId?: unknown };
    if (typeof decoded.membershipId !== 'string' || decoded.membershipId.length < 1 || decoded.membershipId.length > 128) throw new Error('Invalid cursor');
    return decoded.membershipId;
  } catch {
    throw new BadRequestException('Invalid organization cursor');
  }
}

export function normalizeOrganizationPageSize(value: string | undefined): number {
  if (value === undefined) return DEFAULT_PAGE_SIZE;
  if (!/^\d+$/.test(value)) throw new BadRequestException('Invalid organization page size');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) throw new BadRequestException('Invalid organization page size');
  return parsed;
}

export async function findOrganizationForUser(prisma: OrganizationReader, organizationId: string, userId: string): Promise<OrganizationSummary> {
  const organization = await prisma.organization.findFirst({
    where: { id: organizationId, memberships: { some: { userId } } },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  if (!organization) throw new NotFoundException('Organization not found');
  return organization;
}

export async function listOrganizationsForUser(prisma: OrganizationReader, userId: string, limit: number, cursor?: string): Promise<OrganizationListResult> {
  const membershipCursor = cursor ? decodeOrganizationCursor(cursor) : undefined;
  if (membershipCursor) {
    const cursorMembership = await prisma.membership.findFirst({ where: { id: membershipCursor, userId }, select: { id: true } });
    if (!cursorMembership) throw new BadRequestException('Invalid organization cursor');
  }
  const memberships = await prisma.membership.findMany({
    where: { userId },
    ...(membershipCursor ? { cursor: { id: membershipCursor }, skip: 1 } : {}),
    take: limit + 1,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, organization: { select: { id: true, name: true, createdAt: true, updatedAt: true } } },
  });

  const hasNextPage = memberships.length > limit;
  const page = hasNextPage ? memberships.slice(0, limit) : memberships;
  return { items: page.map(({ organization }) => organization), nextCursor: hasNextPage ? encodeOrganizationCursor(page[page.length - 1]!.id) : null };
}

export async function listOrganizationMembersForUser(prisma: OrganizationReader, organizationId: string, userId: string): Promise<OrganizationMember[]> {
  const membership = await prisma.membership.findFirst({ where: { organizationId, userId }, select: { id: true } });
  if (!membership) throw new NotFoundException('Organization not found');
  return prisma.membership.findMany({
    where: { organizationId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, userId: true, role: true, createdAt: true, user: { select: { id: true, email: true, name: true } } },
  });
}

export type CreateOrganizationInput = { name: string };
type OrganizationCreateResult = OrganizationSummary;

export async function createOrganizationForUser(prisma: OrganizationWriter, input: CreateOrganizationInput, userId: string, requestId: string): Promise<OrganizationCreateResult> {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: { name: input.name }, select: { id: true, name: true, createdAt: true, updatedAt: true } });
    await tx.membership.create({ data: { organizationId: organization.id, userId, role: 'OWNER' } });
    await tx.auditLog.create({ data: { organizationId: organization.id, actorUserId: userId, action: 'ORGANIZATION_CREATED', entityType: 'Organization', entityId: organization.id, requestId, metadata: { name: organization.name } } });
    return organization;
  });
}

@Injectable()
export class OrganizationService {
  private readonly prisma = new PrismaClient();
  async listForUser(userId: string, limit: number, cursor?: string): Promise<OrganizationListResult> { return listOrganizationsForUser(this.prisma, userId, limit, cursor); }
  async getByIdForUser(organizationId: string, userId: string): Promise<OrganizationSummary> { return findOrganizationForUser(this.prisma, organizationId, userId); }
  async listMembersForUser(organizationId: string, userId: string): Promise<OrganizationMember[]> { return listOrganizationMembersForUser(this.prisma, organizationId, userId); }
  async createForUser(input: CreateOrganizationInput, userId: string, requestId: string): Promise<OrganizationCreateResult> { return createOrganizationForUser(this.prisma, input, userId, requestId); }
  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}
