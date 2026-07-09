import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AnimalRecord,
  AnimalResponse,
  CreateAnimalInput,
  ListAnimalsInput,
  UpdateAnimalInput,
} from './animal.types';
import {
  toAnimalResponse,
  toAnimalResponses,
  toCreateAnimalData,
  toUpdateAnimalData,
} from './animal.mappers';
import { AnimalsRepository } from './animals.repository';

@Injectable()
export class AnimalsService {
  constructor(private readonly repository: AnimalsRepository) {}

  async list(query: ListAnimalsInput): Promise<AnimalResponse[]> {
    const status = query.status ?? 'active';

    const animals = await this.repository.getAnimalsByQuery({
      search: query.search,
      status,
    });

    return toAnimalResponses(animals);
  }

  async getAnimal(id: string): Promise<AnimalResponse> {
    const animal = await this.getAnimalRecord(id);
    return toAnimalResponse(animal);
  }

  async getAnimalRecord(id: string): Promise<AnimalRecord> {
    const animal = await this.repository.getAnimalById(id);

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    return animal;
  }

  async requireActiveAnimal(id: string): Promise<void> {
    const animal = await this.getAnimalRecord(id);
    if (isAnimalArchived(animal)) {
      throw new ConflictException('Animal is archived');
    }
  }

  async create(input: CreateAnimalInput): Promise<AnimalResponse> {
    validateAnimalDates(input.dateOfBirth ?? null, input.arrivalDate ?? null);

    const animal = await this.repository.createAnimal(
      toCreateAnimalData(input),
    );

    return toAnimalResponse(animal);
  }

  async update(id: string, input: UpdateAnimalInput): Promise<AnimalResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    const animal = await this.getAnimalRecord(id);

    if (isAnimalArchived(animal)) {
      throw new ConflictException('Cannot update an archived animal');
    }

    validateAnimalDates(
      input.dateOfBirth === undefined ? animal.dateOfBirth : input.dateOfBirth,
      input.arrivalDate === undefined ? animal.arrivalDate : input.arrivalDate,
    );

    const updatedAnimal = await this.repository.updateAnimal(
      id,
      toUpdateAnimalData(input),
    );

    return toAnimalResponse(updatedAnimal);
  }

  async archive(id: string): Promise<AnimalResponse> {
    const animal = await this.getAnimalRecord(id);

    if (isAnimalArchived(animal)) {
      throw new ConflictException('Animal is already archived');
    }

    const archivedAnimal = await this.repository.archiveAnimal(id);

    return toAnimalResponse(archivedAnimal);
  }
}

function isAnimalArchived(animal: AnimalRecord): boolean {
  return animal.archivedAt !== null;
}

function validateAnimalDates(
  dateOfBirth: Date | null,
  arrivalDate: Date | null,
): void {
  const now = new Date();

  if (dateOfBirth && dateOfBirth > now) {
    throw new BadRequestException('Date of birth cannot be in the future');
  }

  if (arrivalDate && arrivalDate > now) {
    throw new BadRequestException('Arrival date cannot be in the future');
  }

  if (dateOfBirth && arrivalDate && arrivalDate < dateOfBirth) {
    throw new BadRequestException(
      'Arrival date cannot be earlier than date of birth',
    );
  }
}
