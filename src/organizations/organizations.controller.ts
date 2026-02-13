import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgMembershipGuard } from './org-membership.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Req() req, @Body('name') name: string) {
    return this.organizationsService.createOrganization(req.user.userId, name);
  }

  @Get()
  findMine(@Req() req) {
    return this.organizationsService.getUserOrganizations(req.user.userId);
  }

  @Get(':id/members')
  @UseGuards(OrgMembershipGuard)
  findMembers(@Param('id') orgId: string) {
    return this.organizationsService.getOrganizationMembers(orgId);
  }
}
