import { IsInt, IsOptional, IsString } from 'class-validator';

export class ThrowBottleDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsInt()
  bottleType?: number;

  @IsOptional()
  @IsInt()
  isAnonymous?: number;

  @IsOptional()
  @IsString()
  city?: string;
}
