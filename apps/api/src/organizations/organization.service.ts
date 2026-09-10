import { Injectable, NotFoundException } from '@nestjs/common';
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

type OrganizationReader = Pick<PrismaClient, 'organization' | 'membership'>;
type OrganizationWriter = Pick<PrismaClient, '$transaction'>;

export async function findOrganizationForUser(prisma: OrganizationReader, organizationId: string, userId: string): Promise<OrganizationSummary> {
  const organization = await prisma.organization.findFirst({
    where: { id: organizationId, memberships: { some: { userId } } },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  if (!organization) throw new NotFoundException('Organization not found');
  return organization;
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

  async getByIdForUser(organizationId: string, userId: string): Promise<OrganizationSummary> {
    return findOrganizationForUser(this.prisma, organizationId, userId);
  }

  async listMembersForUser(organizationId: string, userId: string): Promise<OrganizationMember[]> {
    return listOrganizationMembersForUser(this.prisma, organizationId, userId);
  }

  async createForUser(input: CreateOrganizationInput, userId: string, requestId: string): Promise<OrganizationCreateResult> {
    return createOrganizationForUser(this.prisma, input, userId, requestId);
  }

  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}
