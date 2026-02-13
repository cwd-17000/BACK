import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(userId: string, name: string) {
    return this.prisma.organization.create({
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
  }

  async getUserOrganizations(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
    });
  }

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

  // ✅ NEW: invite a member
  async inviteMember(
    orgId: string,
    email: string,
    role: 'admin' | 'member',
  ) {
    return this.prisma.organizationInvite.create({
      data: {
        email,
        organizationId: orgId,
        role,
        token: randomUUID(),
      },
    });
  }

  // ✅ NEW: accept invite
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

    return { success: true };
  }
}
