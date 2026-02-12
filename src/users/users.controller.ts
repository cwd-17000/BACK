import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    // req.user comes from JwtStrategy.validate()
    return this.usersService.findAll();
  }
}
