import { SetMetadata } from '@nestjs/common';
import type { ApplicationRole } from './application-role';

export const APPLICATION_ROLES_KEY = 'zootracker:application-roles';

export const ApplicationRoles = (...roles: ApplicationRole[]) =>
  SetMetadata(APPLICATION_ROLES_KEY, roles);
