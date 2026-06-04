import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
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

export class CreatePostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  topicId?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  mediaList?: MediaDto[];
}
