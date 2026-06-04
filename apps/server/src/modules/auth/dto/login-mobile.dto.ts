import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class LoginMobileDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1\d{10}$/, { message: '手机号格式不正确' })
  mobile: string;

  @IsString()
  @Length(6, 6, { message: '验证码为6位数字' })
  code: string;
}