import { IsIn, IsOptional, IsString } from 'class-validator';

export class AuditHandleDto {
  @IsString()
  @IsIn(['post', 'report'])
  targetType: string;

  @IsString()
  targetId: string;

  @IsString()
  @IsIn(['approve', 'reject', 'hide'])
  action: string;

  @IsOptional()
  @IsString()
  relatedPostId?: string;

  @IsOptional()
  hideContent?: boolean;
}
