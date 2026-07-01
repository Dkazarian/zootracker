import type { ApplicationRole } from '../common/authorization/application-role';

export interface PersonnelResponse {
  id: string;
  name: string;
  email: string;
  role: ApplicationRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
