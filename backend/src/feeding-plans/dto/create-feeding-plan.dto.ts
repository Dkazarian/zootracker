import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { FeedingPeriod } from '../../generated/prisma/client';
import { normalizeFeedingPlanText } from './feeding-plan-dto.helpers';

const FEEDING_PERIODS = ['morning', 'afternoon', 'evening'] as const;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateFeedingPlanDto {
  @IsString()
  @Length(1, 100)
  @Transform(normalizeFeedingPlanText)
  name!: string;

  @IsString()
  @Length(1, 2000)
  @Transform(normalizeFeedingPlanText)
  instructions!: string;

  @IsEnum(FEEDING_PERIODS)
  period!: FeedingPeriod;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  repeatEveryDays!: number;

  @IsString()
  @MaxLength(10)
  @Matches(DATE_ONLY_PATTERN, {
    message: 'initialDueDate must use YYYY-MM-DD format',
  })
  initialDueDate!: string;
}
