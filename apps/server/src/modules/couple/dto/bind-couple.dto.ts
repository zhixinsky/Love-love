import { IsNotEmpty, IsString } from 'class-validator';

export class BindCoupleDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
