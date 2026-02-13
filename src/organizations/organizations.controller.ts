import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMembershipGuard } from './org-membership.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // Any authenticated user can create an org
  @Post()
  create(@Req() req, @Body('name') name: string) {
    return this.organizationsService.createOrganization(req.user.userId, name);
  }

  // Any authenticated user can list their orgs
  @Get()
  findMine(@Req() req) {
    return this.organizationsService.getUserOrganizations(req.user.userId);
  }

  // Only members with permission can view members
  @Get(':id/members')
  @UseGuards(OrgMembershipGuard, PermissionsGuard)
  @Permissions('members.read')
  findMembers(@Param('id') orgId: string) {
    return this.organizationsService.getOrganizationMembers(orgId);
  }
}

