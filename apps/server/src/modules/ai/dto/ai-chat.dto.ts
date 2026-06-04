import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class AiChatDto {
  @IsInt()
  sessionId: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  useDiaryMemory?: boolean;
}
