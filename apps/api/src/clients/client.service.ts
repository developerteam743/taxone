import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@taxone/database';

export type ClientSummary = { id: string; organizationId: string; name: string; email: string | null; phone: string | null; pan: string | null; createdAt: Date; updatedAt: Date };
export type ClientListResult = { items: ClientSummary[]; nextCursor: string | null };
export type ClientInput = { name: string; email?: string; phone?: string; pan?: string };
export type ClientUpdateInput = { name?: string; email?: string; phone?: string; pan?: string };

type ClientReader = Pick<PrismaClient, 'client'>;
type ClientWriter = Pick<PrismaClient, '$transaction'>;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function encodeClientCursor(clientId: string): string { return Buffer.from(JSON.stringify({ clientId }), 'utf8').toString('base64url'); }
export function decodeClientCursor(cursor: string): string {
  if (cursor.length < 8 || cursor.length > 512) throw new BadRequestException('Invalid client cursor');
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { clientId?: unknown };
    if (typeof decoded.clientId !== 'string' || decoded.clientId.length < 1 || decoded.clientId.length > 128) throw new Error('Invalid cursor');
    return decoded.clientId;
  } catch { throw new BadRequestException('Invalid client cursor'); }
}
export function normalizeClientPageSize(value: string | undefined): number {
  if (value === undefined) return DEFAULT_PAGE_SIZE;
  if (!/^\d+$/.test(value)) throw new BadRequestException('Invalid client page size');
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) throw new BadRequestException('Invalid client page size');
  return parsed;
}

const clientSelect = { id: true, organizationId: true, name: true, email: true, phone: true, pan: true, createdAt: true, updatedAt: true } as const;

export async function listClientsForOrganization(prisma: ClientReader, organizationId: string, limit: number, cursor?: string): Promise<ClientListResult> {
  const clientCursor = cursor ? decodeClientCursor(cursor) : undefined;
  if (clientCursor) {
    const validCursor = await prisma.client.findFirst({ where: { id: clientCursor, organizationId }, select: { id: true } });
    if (!validCursor) throw new BadRequestException('Invalid client cursor');
  }
  const clients = await prisma.client.findMany({ where: { organizationId }, ...(clientCursor ? { cursor: { id: clientCursor }, skip: 1 } : {}), take: limit + 1, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: clientSelect });
  const hasNextPage = clients.length > limit;
  const page = hasNextPage ? clients.slice(0, limit) : clients;
  return { items: page, nextCursor: hasNextPage ? encodeClientCursor(page[page.length - 1]!.id) : null };
}

export async function getClientForOrganization(prisma: ClientReader, organizationId: string, clientId: string): Promise<ClientSummary> {
  const client = await prisma.client.findFirst({ where: { id: clientId, organizationId }, select: clientSelect });
  if (!client) throw new NotFoundException('Client not found');
  return client;
}

export async function createClientForOrganization(prisma: ClientWriter, organizationId: string, input: ClientInput, actorUserId: string, requestId: string): Promise<ClientSummary> {
  return prisma.$transaction(async (tx) => {
    try {
      const client = await tx.client.create({ data: { organizationId, name: input.name, ...(input.email !== undefined ? { email: input.email } : {}), ...(input.phone !== undefined ? { phone: input.phone } : {}), ...(input.pan !== undefined ? { pan: input.pan } : {}) }, select: clientSelect });
      await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'CLIENT_CREATED', entityType: 'Client', entityId: client.id, requestId, metadata: { name: client.name, email: client.email, phone: client.phone, pan: client.pan } } });
      return client;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('A client with this PAN already exists in the organization');
      throw error;
    }
  });
}

export async function updateClientForOrganization(prisma: ClientWriter, organizationId: string, clientId: string, input: ClientUpdateInput, actorUserId: string, requestId: string): Promise<ClientSummary> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.client.findFirst({ where: { id: clientId, organizationId }, select: clientSelect });
    if (!existing) throw new NotFoundException('Client not found');
    try {
      const data = {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.pan !== undefined ? { pan: input.pan } : {}),
      };
      const client = await tx.client.update({ where: { id: clientId }, data, select: clientSelect });
      await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'CLIENT_UPDATED', entityType: 'Client', entityId: client.id, requestId, metadata: { before: { name: existing.name, email: existing.email, phone: existing.phone, pan: existing.pan }, after: { name: client.name, email: client.email, phone: client.phone, pan: client.pan } } } });
      return client;
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictException('A client with this PAN already exists in the organization');
      throw error;
    }
  });
}

export async function deleteClientForOrganization(prisma: ClientWriter, organizationId: string, clientId: string, actorUserId: string, requestId: string): Promise<{ deleted: true; id: string }> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.client.findFirst({ where: { id: clientId, organizationId }, select: clientSelect });
    if (!existing) throw new NotFoundException('Client not found');
    await tx.client.delete({ where: { id: clientId } });
    await tx.auditLog.create({ data: { organizationId, actorUserId, action: 'CLIENT_DELETED', entityType: 'Client', entityId: clientId, requestId, metadata: { name: existing.name, email: existing.email, phone: existing.phone, pan: existing.pan } } });
    return { deleted: true, id: clientId };
  });
}

function isUniqueConstraintError(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002'; }

@Injectable()
export class ClientService {
  private readonly prisma = new PrismaClient();
  async list(organizationId: string, limit: number, cursor?: string): Promise<ClientListResult> { return listClientsForOrganization(this.prisma, organizationId, limit, cursor); }
  async get(organizationId: string, clientId: string): Promise<ClientSummary> { return getClientForOrganization(this.prisma, organizationId, clientId); }
  async create(organizationId: string, input: ClientInput, actorUserId: string, requestId: string): Promise<ClientSummary> { return createClientForOrganization(this.prisma, organizationId, input, actorUserId, requestId); }
  async update(organizationId: string, clientId: string, input: ClientUpdateInput, actorUserId: string, requestId: string): Promise<ClientSummary> { return updateClientForOrganization(this.prisma, organizationId, clientId, input, actorUserId, requestId); }
  async delete(organizationId: string, clientId: string, actorUserId: string, requestId: string): Promise<{ deleted: true; id: string }> { return deleteClientForOrganization(this.prisma, organizationId, clientId, actorUserId, requestId); }
  async onModuleDestroy(): Promise<void> { await this.prisma.$disconnect(); }
}
