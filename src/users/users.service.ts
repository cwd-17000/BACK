import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(email: string, password: string) {
    return this.prisma.user.create({
      data: { email, password },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
