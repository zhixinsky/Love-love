import { IsOptional, IsString } from 'class-validator';

export class InviteCoupleDto {
  @IsOptional()
  @IsString()
  loveStartDate?: string;
}
