import { Controller, ForbiddenException, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { isApplicationRole } from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { ApiAccess } from '../common/openapi/api-access.decorator';
import { ErrorResponseDto } from '../common/openapi/error-response.dto';
import { auth } from './auth';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

export type CurrentUserResponse = CurrentUserResponseDto;

@ApiTags('Authentication')
@Controller('me')
@ApplicationRoles('keeper', 'admin')
export class AuthController {
  @Get()
  @ApiOperation({
    summary: 'Get current user information',
    description:
      'Keeper or Administrator. Returns the authenticated Better Auth user identity and application role.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiOkResponse({
    description: 'Current user information',
    type: CurrentUserResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'User account does not have a valid role',
    type: ErrorResponseDto,
  })
  getCurrentUser(
    @Session() session: UserSession<typeof auth>,
  ): CurrentUserResponse {
    if (!isApplicationRole(session.user.role)) {
      throw new ForbiddenException('Your account does not have a valid role');
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    };
  }
}
