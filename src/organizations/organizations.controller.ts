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
import { Delete, Patch } from '@nestjs/common';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { ForbiddenException } from '@nestjs/common';

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
    @Req() req,
  ) {
    return this.organizationsService.inviteMember(
      orgId,
      dto.email,
      dto.role,
      req.user.userId,
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
   // ✅ Remove member
  @Delete(':id/members/:userId')
  @UseGuards(OrgMembershipGuard, PermissionsGuard)
  @Permissions('members.remove')
  removeMember(
    @Param('id') orgId: string,
    @Param('userId') userId: string,
    @Req() req,
  ) {
    return this.organizationsService.removeMember(orgId, userId, req.user.userId);
  }

  // ✅ Update member role
  @Patch(':id/members/:userId/role')
  @UseGuards(OrgMembershipGuard, PermissionsGuard)
  @Permissions('members.updateRole')
  updateMemberRole(
    @Param('id') orgId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req,
  ) {
    return this.organizationsService.updateMemberRole(
      orgId,
      userId,
      dto.role,
      req.user.userId,
    );
  }
  @Post(':id/transfer-ownership')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
transferOwnership(
  @Param('id') orgId: string,
  @Req() req,
  @Body() dto: TransferOwnershipDto,
) {
  // Guard ensures membership exists
  if (req.membership.role !== 'owner') {
    throw new ForbiddenException('Only the owner can transfer ownership');
  }

  return this.organizationsService.transferOwnership(
    orgId,
    req.user.userId,
    dto.newOwnerId,
  );
}
}
