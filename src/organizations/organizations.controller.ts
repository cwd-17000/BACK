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
import { OrgMembershipGuard } from './guards/org-membership.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

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

  // ✅ NEW: invite a member (permission-gated)
  @Post(':id/invite')
  @UseGuards(OrgMembershipGuard, PermissionsGuard)
  @Permissions('members.invite')
  inviteMember(
    @Param('id') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(
      orgId,
      dto.email,
      dto.role,
    );
  }

  // ✅ NEW: accept an invite
  @Post('invites/accept')
  acceptInvite(@Req() req, @Body() dto: AcceptInviteDto) {
    return this.organizationsService.acceptInvite(
      req.user.userId,
      dto.token,
    );
  }
}
