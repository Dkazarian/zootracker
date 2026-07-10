import { Controller, ForbiddenException, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { auth } from './auth';

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  role: ApplicationRole;
}

@ApiTags('Authentication')
@Controller('me')
@ApplicationRoles('keeper', 'admin')
export class AuthController {
  @Get()
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Returns the authenticated user profile and role information',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Current user information',
    schema: {
      example: {
        id: 'user-uuid',
        name: 'John Doe',
        email: 'john@zoo.local',
        role: 'keeper',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User account does not have a valid role',
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
