import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
