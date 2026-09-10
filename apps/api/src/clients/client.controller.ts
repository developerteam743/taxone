import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from '../auth/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ClientService, normalizeClientPageSize } from './client.service.js';
import { validateCreateClientRequest, validateUpdateClientRequest } from './client.contract.js';

@Controller('api/v1/clients')
@UseGuards(AccessTokenGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @Roles('MEMBER')
  async list(@Req() request: AuthenticatedRequest, @Query('limit') limit: string | undefined, @Query('cursor') cursor: string | undefined) {
    return this.clientService.list(requireOrganizationId(request), normalizeClientPageSize(limit), cursor);
  }

  @Get(':id')
  @Roles('MEMBER')
  async get(@Param('id') clientId: string, @Req() request: AuthenticatedRequest) {
    return this.clientService.get(requireOrganizationId(request), clientId);
  }

  @Post()
  @Roles('CA')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateCreateClientRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.clientService.create(requireOrganizationId(request), validation.data, request.user.userId, requestId ?? 'unknown');
  }

  @Patch(':id')
  @Roles('CA')
  async update(@Param('id') clientId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateUpdateClientRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.clientService.update(requireOrganizationId(request), clientId, validation.data, request.user.userId, requestId ?? 'unknown');
  }

  @Delete(':id')
  @Roles('CA')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') clientId: string, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    return this.clientService.delete(requireOrganizationId(request), clientId, request.user.userId, requestId ?? 'unknown');
  }
}

function requireOrganizationId(request: AuthenticatedRequest): string {
  if (!request.user.organizationId) throw new ForbiddenException('Organization membership is required');
  return request.user.organizationId;
}
