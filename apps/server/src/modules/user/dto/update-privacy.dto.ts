import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePrivacyDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  showNearby?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  allowDm?: number;
}
