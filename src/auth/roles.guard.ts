import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;

    // Sync / fetch Prisma user
    const appUser = await this.usersService.findOrCreateFromSupabase({
      userId: jwtUser.userId,
      email: jwtUser.email,
    });

    request.appUser = appUser;

    return requiredRoles.includes(appUser.role);
  }
}
