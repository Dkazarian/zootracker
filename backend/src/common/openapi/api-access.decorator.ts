import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExtension,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  formatApplicationRole,
  type ApplicationRole,
} from '../authorization/application-role';
import { ErrorResponseDto } from './error-response.dto';

export const ApiAccess = (...roles: ApplicationRole[]) =>
  applyDecorators(
    ApiCookieAuth('session'),
    ApiExtension(
      'x-roles',
      roles.map((role) => formatApplicationRole(role)),
    ),
    ApiUnauthorizedResponse({
      description: 'Valid Better Auth session cookie required',
      type: ErrorResponseDto,
    }),
  );
