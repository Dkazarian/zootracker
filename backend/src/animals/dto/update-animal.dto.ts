import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AnimalSex } from '../../generated/prisma/client';
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from './animal-dto.helpers';

const ANIMAL_SEXES = ['female', 'male', 'unknown'] as const;

export class UpdateAnimalDto {
  @ApiProperty({
    description: 'Animal name',
    minLength: 1,
    maxLength: 100,
    example: 'Simba',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(normalizeRequiredText)
  name?: string;

  @ApiProperty({
    description: 'Species name',
    minLength: 2,
    maxLength: 120,
    example: 'Lion',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  @Transform(normalizeRequiredText)
  species?: string;

  @ApiProperty({
    description: 'Animal sex',
    enum: ANIMAL_SEXES,
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsEnum(ANIMAL_SEXES)
  sex?: AnimalSex | null;

  @ApiProperty({
    description: 'Date of birth',
    type: 'string',
    format: 'date-time',
    example: '2015-06-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date | null;

  @ApiProperty({
    description: 'Arrival date at the zoo',
    type: 'string',
    format: 'date-time',
    example: '2020-03-20T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalDate?: Date | null;

  @ApiProperty({
    description: 'Current location in the zoo',
    maxLength: 120,
    example: 'Savanna Enclosure A',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(normalizeOptionalText)
  currentLocation?: string | null;

  @ApiProperty({
    description: 'Additional notes about the animal',
    maxLength: 2000,
    example: 'Very active in the morning',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(normalizeOptionalText)
  notes?: string | null;
}
