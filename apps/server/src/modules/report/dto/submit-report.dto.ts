import { IsInt, IsOptional, IsString } from 'class-validator';

export class SubmitReportDto {
  @IsInt()
  targetType: number;

  @IsInt()
  targetId: number;

  @IsInt()
  reasonType: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
