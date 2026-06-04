import { IsInt } from 'class-validator';

export class ToggleTargetDto {
  @IsInt()
  targetType: number;

  @IsInt()
  targetId: number;
}
