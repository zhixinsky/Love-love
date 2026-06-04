import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAnniversaryDto {
  @IsString()
  title: string;

  @IsString()
  eventDate: string;

  @IsOptional()
  @IsInt()
  repeatType?: number;

  @IsOptional()
  @IsInt()
  reminderDays?: number;
}
