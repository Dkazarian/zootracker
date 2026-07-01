import { InternalServerErrorException } from '@nestjs/common';
import { isApplicationRole } from '../common/authorization/application-role';
import type { PersonnelRecord, PersonnelResponse } from './personnel.types';

export function toPersonnelResponse(
  person: PersonnelRecord,
): PersonnelResponse {
  if (!isApplicationRole(person.role)) {
    throw new InternalServerErrorException(
      'A personnel account has an invalid role',
    );
  }

  return {
    id: person.id,
    name: person.name,
    email: person.email,
    role: person.role,
    active: person.banned !== true,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  };
}

export function toPersonnelResponses(
  personnel: PersonnelRecord[],
): PersonnelResponse[] {
  return personnel.map(toPersonnelResponse);
}
