import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Length, MinLength } from 'class-validator';
import {
  APPLICATION_ROLES,
  type ApplicationRole,
} from '../../common/authorization/application-role';

export class CreatePersonnelDto {
  @IsString()
  @Length(2, 100)
  @Transform(({ value }: TransformFnParams) => normalizeText(value as unknown))
  name!: string;

  @IsEmail()
  @Length(3, 254)
  @Transform(({ value }: TransformFnParams) => normalizeEmail(value as unknown))
  email!: string;

  @IsEnum(APPLICATION_ROLES)
  role!: ApplicationRole;

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
