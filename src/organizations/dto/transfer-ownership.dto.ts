import { IsString, IsUUID } from 'class-validator';

export class TransferOwnershipDto {
  @IsUUID()
  newOwnerId: string;
}
