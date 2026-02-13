import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**   * 🔑 Sync user from Supabase JWT into Prisma
   * Called on authenticated requests
   */
  async findOrCreateFromSupabase(user: {
    userId: string;
    email: string;
  }) {
    return this.prisma.user.upsert({
      where: { id: user.userId },
      update: {
        email: user.email,
      },
      create: {
        id: user.userId,
        email: user.email,
      },
    });
  }

  /**   *  Used by RolesGuard
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**

   * �🛠 Admin / debug use
   */
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * 🛡 Promote / demote users
   */
  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
