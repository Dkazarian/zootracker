import type { AnimalSex } from '../generated/prisma/client';

export interface AnimalRecord {
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

export type ListAnimalsInput = {
  search?: string;
  status?: AnimalDirectoryStatus;
};

export type CreateAnimalInput = {
  name: string;
  species: string;
  sex?: AnimalSex | null;
  dateOfBirth?: Date | null;
  arrivalDate?: Date | null;
  currentLocation?: string | null;
  notes?: string | null;
};

export type UpdateAnimalInput = Partial<CreateAnimalInput>;

export type ListAnimalsQuery = {
  search?: string;
  status?: AnimalDirectoryStatus;
};

export type CreateAnimalData = {
  name: string;
  species: string;
  sex: AnimalSex | null;
  dateOfBirth: Date | null;
  arrivalDate: Date | null;
  currentLocation: string | null;
  notes: string | null;
};

export type UpdateAnimalData = Partial<CreateAnimalData>;
