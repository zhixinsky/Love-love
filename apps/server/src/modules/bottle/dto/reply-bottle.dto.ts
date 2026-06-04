import { IsInt, IsString } from 'class-validator';

export class ReplyBottleDto {
  @IsInt()
  bottleId: number;

  @IsString()
  content: string;
}
