import { IsIn, IsString } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsString()
  @IsIn(['admin', 'member'])
  role: string;
}
