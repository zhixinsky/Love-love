import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class MediaDto {
  @IsInt()
  mediaType: number;
  @IsString()
  url: string;
  @IsInt()
  sort: number;
}

export class UpdateDiaryDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  content?: string;
  @IsOptional()
  @IsString()
  mood?: string;
  @IsOptional()
  @IsString()
  weather?: string;
  @IsOptional()
  @IsString()
  location?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  visibility?: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  mediaList?: MediaDto[];
}
