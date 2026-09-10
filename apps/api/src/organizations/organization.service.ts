import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type OrganizationSummary = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class OrganizationService {
  private readonly prisma = new PrismaClient();

  async getByIdForUser(organizationId: string, userId: string): Promise<OrganizationSummary> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        memberships: { some: { userId } },
      },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
