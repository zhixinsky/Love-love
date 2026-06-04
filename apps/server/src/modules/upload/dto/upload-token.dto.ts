import { IsIn, IsString } from 'class-validator';

export class UploadTokenDto {
  @IsString()
  @IsIn(['avatar', 'diary', 'post', 'chat', 'bottle'])
  scene: string;
}
