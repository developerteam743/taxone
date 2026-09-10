import { BadRequestException, Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from '../auth/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { OrganizationService, normalizeOrganizationPageSize } from './organization.service.js';
import { validateCreateOrganizationInvitationRequest, validateCreateOrganizationRequest, validateUpdateOrganizationRequest } from './organization.contract.js';

@Controller('api/v1/organizations')
@UseGuards(AccessTokenGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @Roles('MEMBER')
  async listOrganizations(@Req() request: AuthenticatedRequest, @Query('limit') limit: string | undefined, @Query('cursor') cursor: string | undefined) { return this.organizationService.listForUser(request.user.userId, normalizeOrganizationPageSize(limit), cursor); }

  @Get(':id')
  @Roles('MEMBER')
  async getOrganization(@Param('id') organizationId: string, @Req() request: AuthenticatedRequest) { return this.organizationService.getByIdForUser(organizationId, request.user.userId); }

  @Get(':id/members')
  @Roles('MEMBER')
  async listMembers(@Param('id') organizationId: string, @Req() request: AuthenticatedRequest) { return this.organizationService.listMembersForUser(organizationId, request.user.userId); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(@Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateCreateOrganizationRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.organizationService.createForUser(validation.data, request.user.userId, requestId ?? 'unknown');
  }

  @Patch(':id')
  @Roles('ADMIN')
  async updateOrganization(@Param('id') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateUpdateOrganizationRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.organizationService.updateForUser(organizationId, validation.data, request.user.userId, requestId ?? 'unknown');
  }

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN')
  async createInvitation(@Param('id') organizationId: string, @Body() body: unknown, @Req() request: AuthenticatedRequest, @Headers('x-request-id') requestId: string | undefined) {
    const validation = validateCreateOrganizationInvitationRequest(body);
    if (!validation.success) throw new BadRequestException({ message: 'Request validation failed.', issues: validation.errors });
    return this.organizationService.createInvitationForUser(organizationId, validation.data, request.user.userId, requestId ?? 'unknown');
  }
}
