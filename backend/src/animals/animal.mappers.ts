import type {
  AnimalRecord,
  AnimalResponse,
  CreateAnimalData,
  CreateAnimalInput,
  UpdateAnimalData,
  UpdateAnimalInput,
} from './animal.types';

export function toAnimalResponse(animal: AnimalRecord): AnimalResponse {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species,
    sex: animal.sex,
    dateOfBirth: animal.dateOfBirth,
    arrivalDate: animal.arrivalDate,
    currentLocation: animal.currentLocation,
    notes: animal.notes,
    createdAt: animal.createdAt,
    updatedAt: animal.updatedAt,
    archivedAt: animal.archivedAt,
  };
}

export function toAnimalResponses(animals: AnimalRecord[]): AnimalResponse[] {
  return animals.map(toAnimalResponse);
}

export function toCreateAnimalData(input: CreateAnimalInput): CreateAnimalData {
  return {
    name: input.name,
    species: input.species,
    sex: input.sex ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    arrivalDate: input.arrivalDate ?? null,
    currentLocation: input.currentLocation ?? null,
    notes: input.notes ?? null,
  };
}

export function toUpdateAnimalData(input: UpdateAnimalInput): UpdateAnimalData {
  const data: UpdateAnimalData = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.species !== undefined) {
    data.species = input.species;
  }

  if (input.sex !== undefined) {
    data.sex = input.sex;
  }

  if (input.dateOfBirth !== undefined) {
    data.dateOfBirth = input.dateOfBirth;
  }

  if (input.arrivalDate !== undefined) {
    data.arrivalDate = input.arrivalDate;
  }

  if (input.currentLocation !== undefined) {
    data.currentLocation = input.currentLocation;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  return data;
}
