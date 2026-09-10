import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type OrganizationSummary = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrganizationReader = Pick<PrismaClient, 'organization'>;

export async function findOrganizationForUser(prisma: OrganizationReader, organizationId: string, userId: string): Promise<OrganizationSummary> {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      memberships: { some: { userId } },
    },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  if (!organization) throw new NotFoundException('Organization not found');
  return organization;
}

@Injectable()
export class OrganizationService {
  private readonly prisma = new PrismaClient();

  async getByIdForUser(organizationId: string, userId: string): Promise<OrganizationSummary> {
    return findOrganizationForUser(this.prisma, organizationId, userId);
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
