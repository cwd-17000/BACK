import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const membership = request.membership;

    if (!membership) {
      throw new ForbiddenException('No organization context');
    }

    const rolePermissions = await this.prisma.orgRolePermission.findMany({
      where: {
        role: membership.role,
      },
    });

    const allowed = rolePermissions.map(p => p.permission);

    const hasPermission = requiredPermissions.every(p =>
      allowed.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
