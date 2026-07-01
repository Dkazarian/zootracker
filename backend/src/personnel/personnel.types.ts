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

export interface CreatePersonnelInput {
  name: string;
  email: string;
  password: string;
  role: ApplicationRole;
}

export interface PersonnelRecord {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelIdentifierRecord {
  id: string;
}

export interface PersonnelLifecycleOperations {
  findById(id: string): Promise<PersonnelRecord | null>;
  countActiveAdministrators(): Promise<number>;
  deactivate(id: string): Promise<void>;
  reactivate(id: string): Promise<void>;
  deleteSessions(id: string): Promise<void>;
}
