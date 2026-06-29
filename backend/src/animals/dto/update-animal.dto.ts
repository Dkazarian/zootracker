import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import type { AnimalSex } from '../../generated/prisma/client';
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from './animal-dto.helpers';

const ANIMAL_SEXES = ['female', 'male', 'unknown'] as const;

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(normalizeRequiredText)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  @Transform(normalizeRequiredText)
  species?: string;

  @IsOptional()
  @IsEnum(ANIMAL_SEXES)
  sex?: AnimalSex | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalDate?: Date | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(normalizeOptionalText)
  currentLocation?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(normalizeOptionalText)
  notes?: string | null;
}
