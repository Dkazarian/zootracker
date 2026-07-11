import { Transform, Type } from 'class-transformer';
import { IsISO8601, IsInt, IsString, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { normalizeFeedingPlanText } from './feeding-plan-dto.helpers';

export class CreateFeedingPlanDto {
  @ApiProperty({
    description: 'Feeding plan name',
    minLength: 1,
    maxLength: 100,
    example: 'Morning Feeding',
  })
  @IsString()
  @Length(1, 100)
  @Transform(normalizeFeedingPlanText)
  name!: string;

  @ApiProperty({
    description: 'Feeding instructions and details',
    minLength: 1,
    maxLength: 2000,
    example: 'Give 5kg of meat, ensure fresh water',
  })
  @IsString()
  @Length(1, 2000)
  @Transform(normalizeFeedingPlanText)
  instructions!: string;

  @ApiProperty({
    description: 'Repeat feeding plan every N days',
    type: 'number',
    minimum: 1,
    maximum: 3650,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  repeatEveryDays!: number;

  @ApiProperty({
    description:
      'Initial due date for the first feeding task in ISO 8601 format',
    format: 'date-time',
    example: '2024-01-15T09:00:00Z',
  })
  @IsString()
  @IsISO8601({ strict: true })
  initialDueAt!: string;
}
