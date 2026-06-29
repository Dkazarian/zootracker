import type { AnimalSex } from '../generated/prisma/client';

export interface AnimalResponse {
  id: string;
  name: string;
  species: string;
  sex: AnimalSex | null;
  dateOfBirth: Date | null;
  arrivalDate: Date | null;
  currentLocation: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export type AnimalDirectoryStatus = 'active' | 'archived' | 'all';
