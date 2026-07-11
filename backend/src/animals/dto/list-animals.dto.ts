import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AnimalDirectoryStatus } from '../animal.types';

const ANIMAL_DIRECTORY_STATUSES = ['active', 'archived', 'all'] as const;

export class ListAnimalsDto {
  @ApiProperty({
    description: 'Search query by animal name or species',
    maxLength: 100,
    example: 'Lion',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(normalizeSearch)
  search?: string;

  @ApiProperty({
    description: 'Filter animals by status',
    enum: ANIMAL_DIRECTORY_STATUSES,
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(ANIMAL_DIRECTORY_STATUSES)
  status: AnimalDirectoryStatus = 'active';
}

function normalizeSearch({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
