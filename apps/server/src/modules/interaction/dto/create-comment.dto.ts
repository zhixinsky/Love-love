import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  targetType: number;

  @IsInt()
  targetId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  replyUserId?: number;

  @IsString()
  content: string;
}
