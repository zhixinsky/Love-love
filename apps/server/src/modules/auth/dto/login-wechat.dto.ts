import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginWechatDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
