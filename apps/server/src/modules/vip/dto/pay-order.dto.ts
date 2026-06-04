import { IsInt, IsOptional } from 'class-validator';

export class PayOrderDto {
  @IsOptional()
  @IsInt()
  payChannel?: number;
}
