import { Transform, Type } from 'class-transformer';
import { IsISO8601, IsInt, IsString, Length, Max, Min } from 'class-validator';
import { normalizeFeedingPlanText } from './feeding-plan-dto.helpers';

export class CreateFeedingPlanDto {
  @IsString()
  @Length(1, 100)
  @Transform(normalizeFeedingPlanText)
  name!: string;

  @IsString()
  @Length(1, 2000)
  @Transform(normalizeFeedingPlanText)
  instructions!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  repeatEveryDays!: number;

  @IsString()
  @IsISO8601({ strict: true })
  initialDueAt!: string;
}
