import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { AnimalDirectoryStatus } from '../animal.types';

const ANIMAL_DIRECTORY_STATUSES = ['active', 'archived', 'all'] as const;

export class ListAnimalsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(normalizeSearch)
  search?: string;

  @IsOptional()
  @IsEnum(ANIMAL_DIRECTORY_STATUSES)
  status: AnimalDirectoryStatus = 'active';
}

function normalizeSearch({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
