import { IsIn, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'admin'])
  role: string;
}
