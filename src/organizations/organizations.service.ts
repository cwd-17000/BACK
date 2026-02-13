import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { randomUUID } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  // -------------------------------
  // Create organization
  // -------------------------------
  async createOrganization(userId: string, name: string) {
    const org = await this.prisma.organization.create({
      data: {
        name,
        memberships: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
    });

    await this.audit.log({
      organizationId: org.id,
      actorId: userId,
      action: 'organization.created',
      metadata: { name },
    });

    return org;
  }

  // -------------------------------
  // List user's organizations
  // -------------------------------
  async getUserOrganizations(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
    });
  }

  // -------------------------------
  // List organization members
  // -------------------------------
  async getOrganizationMembers(orgId: string) {
    return this.prisma.membership.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });
  }

  // -------------------------------
  // Invite member
  // -------------------------------
  async inviteMember(
    orgId: string,
    email: string,
    role: 'admin' | 'member',
    actorId: string,
  ) {
    const invite = await this.prisma.organizationInvite.create({
      data: {
        email,
        organizationId: orgId,
        role,
        token: randomUUID(),
      },
    });

    await this.audit.log({
      organizationId: orgId,
      actorId,
      action: 'member.invited',
      metadata: { email, role },
    });

    return invite;
  }

  // -------------------------------
  // Accept invite
  // -------------------------------
  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.acceptedAt) {
      throw new BadRequestException('Invalid or expired invite');
    }

    await this.prisma.membership.create({
      data: {
        userId,
        organizationId: invite.organizationId,
        role: invite.role,
      },
    });

    await this.prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    await this.audit.log({
      organizationId: invite.organizationId,
      actorId: userId,
      action: 'member.joined',
      metadata: { via: 'invite' },
    });

    return { success: true };
  }

  // -------------------------------
  // Remove member
  // -------------------------------
  async removeMember(
    orgId: string,
    userId: string,
    actorId: string,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership) return;

    if (membership.role === 'owner') {
      throw new ForbiddenException('Cannot remove organization owner');
    }

    await this.prisma.membership.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    await this.audit.log({
      organizationId: orgId,
      actorId,
      action: 'member.removed',
      targetId: userId,
    });

    return { success: true };
  }

  // -------------------------------
  // Update member role
  // -------------------------------
  async updateMemberRole(
    orgId: string,
    userId: string,
    role: 'admin' | 'member',
    actorId: string,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member');
    }

    if (membership.role === 'owner') {
      throw new ForbiddenException('Cannot change owner role');
    }

    const updated = await this.prisma.membership.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      data: { role },
    });

    await this.audit.log({
      organizationId: orgId,
      actorId,
      action: 'member.role_updated',
      targetId: userId,
      metadata: { newRole: role },
    });

    return updated;
  }

  // -------------------------------
  // Read audit logs
  // -------------------------------
  async getAuditLogs(orgId: string) {
    return this.prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
