import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post()
  create(@Body() body: { email: string; password: string }) {
    return this.users.create(body.email, body.password);
  }

  @Get()
  findAll() {
    return this.users.findAll();
  }
}