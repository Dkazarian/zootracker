import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  APPLICATION_ROLES,
  type ApplicationRole,
} from '../../common/authorization/application-role';

export class CreatePersonnelDto {
  @ApiProperty({
    description: 'Personnel name',
    minLength: 2,
    maxLength: 100,
    example: 'Jane Smith',
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: TransformFnParams) => normalizeText(value as unknown))
  name!: string;

  @ApiProperty({
    description: 'Personnel email address',
    format: 'email',
    minLength: 3,
    maxLength: 254,
    example: 'jane@zoo.local',
  })
  @IsEmail()
  @Length(3, 254)
  @Transform(({ value }: TransformFnParams) => normalizeEmail(value as unknown))
  email!: string;

  @ApiProperty({
    description: 'Personnel role',
    enum: APPLICATION_ROLES,
    example: 'keeper',
  })
  @IsEnum(APPLICATION_ROLES)
  role!: ApplicationRole;

  @ApiProperty({
    description: 'Password for the personnel account',
    minLength: 12,
    maxLength: 128,
    example: 'SecurePassword123!',
  })
  @IsString()
  @MinLength(12)
  @Length(12, 128)
  password!: string;
}

function normalizeText(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}
