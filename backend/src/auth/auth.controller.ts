import { Controller, ForbiddenException, Get } from '@nestjs/common';
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

@Controller('me')
@ApplicationRoles('keeper', 'admin')
export class AuthController {
  @Get()
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
