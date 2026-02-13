import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // Supabase handles authentication and JWT validation
  // This service can be extended for role management and other auth-related operations
}