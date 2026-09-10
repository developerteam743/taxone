import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, type AuthenticatedRequest } from '../auth/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { OrganizationService } from './organization.service.js';

@Controller('api/v1/organizations')
@UseGuards(AccessTokenGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get(':id')
  @Roles('MEMBER')
  async getOrganization(@Param('id') organizationId: string, @Req() request: AuthenticatedRequest) {
    if (request.user.organizationId !== organizationId) {
      return this.organizationService.getByIdForUser(organizationId, request.user.userId);
    }
    return this.organizationService.getByIdForUser(organizationId, request.user.userId);
  }
}
