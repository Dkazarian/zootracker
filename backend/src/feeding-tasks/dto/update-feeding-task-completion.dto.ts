import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const trimOptionalText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateFeedingTaskCompletionDto {
  @ApiProperty({
    description:
      'Updated timestamp when the feeding task was completed in ISO 8601 format',
    format: 'date-time',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  completedAt?: string;

  @ApiProperty({
    description: 'Updated notes on the feeding completion',
    maxLength: 2000,
    example: 'Animal ate all food, seemed healthy',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(trimOptionalText)
  notes?: string;
}
