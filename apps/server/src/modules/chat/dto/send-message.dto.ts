import { IsInt, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt()
  sessionId: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  messageType?: number;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
