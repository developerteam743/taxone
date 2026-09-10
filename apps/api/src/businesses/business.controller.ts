import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from '../auth/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { BusinessService, normalizeBusinessPageSize } from './business.service.js';
import { validateCreateBusinessRequest, validateUpdateBusinessRequest } from './business.contract.js';

@Controller('api/v1/businesses')
@UseGuards(AccessTokenGuard, RolesGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @Roles('MEMBER')
  async list(@Req() request: AuthenticatedRequest, @Query('limit') limit: string | undefined, @Query('cursor') cursor: string | undefined) {
    return this.businessService.list(requireOrganizationId(request), normalizeBusinessPageSize(limit), cursor);
  }

  @Get(':id')
  @Roles('MEMBER')
  async get(@Param('id') businessId: string, @Req() request: AuthenticatedRequest) {
    return this.businessService.get(requireOrganizationId(request), businessId);
  }

  @Post()
  @Roles('CA')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateCreateBusinessRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.businessService.create(requireOrganizationId(request), validation.data, request.user.userId, requestId ?? 'unknown');
  }

  @Patch(':id')
  @Roles('CA')
  async update(@Param('id') businessId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateUpdateBusinessRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.businessService.update(requireOrganizationId(request), businessId, validation.data, request.user.userId, requestId ?? 'unknown');
  }
}

function requireOrganizationId(request: AuthenticatedRequest): string {
  if (!request.user.organizationId) throw new ForbiddenException('Organization membership is required');
  return request.user.organizationId;
}
