import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from '../auth/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { validateCreateGstRegistrationRequest } from './gst-registration.contract.js';
import { GstRegistrationService, normalizeGstRegistrationPageSize } from './gst-registration.service.js';

@Controller('api/v1/gst/registrations')
@UseGuards(AccessTokenGuard, RolesGuard)
export class GstRegistrationController {
  constructor(private readonly gstRegistrationService: GstRegistrationService) {}

  @Get()
  @Roles('MEMBER')
  async list(@Req() request: AuthenticatedRequest, @Query('limit') limit: string | undefined, @Query('cursor') cursor: string | undefined, @Query('businessId') businessId: string | undefined) {
    if (businessId !== undefined && (businessId.trim().length === 0 || businessId.length > 128)) throw new BadRequestException('Invalid businessId');
    return this.gstRegistrationService.list(requireOrganizationId(request), normalizeGstRegistrationPageSize(limit), cursor, businessId?.trim());
  }

  @Post()
  @Roles('CA')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateCreateGstRegistrationRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.gstRegistrationService.create(requireOrganizationId(request), validation.data, request.user.userId, requestId ?? 'unknown');
  }
}

function requireOrganizationId(request: AuthenticatedRequest): string {
  if (!request.user.organizationId) throw new ForbiddenException('Organization membership is required');
  return request.user.organizationId;
}
