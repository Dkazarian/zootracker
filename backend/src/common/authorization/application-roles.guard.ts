import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { isApplicationRole, type ApplicationRole } from './application-role';
import { APPLICATION_ROLES_KEY } from './application-roles.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    role?: unknown;
  };
}

@Injectable()
export class ApplicationRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ApplicationRole[]>(
      APPLICATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.role;

    if (role === undefined) {
      throw new UnauthorizedException();
    }

    if (!isApplicationRole(role) || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
