import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import type { Animal } from '../generated/prisma/client';
import type { AnimalResponse } from './animal.types';
import type { CreateAnimalDto } from './dto/create-animal.dto';
import type { ListAnimalsDto } from './dto/list-animals.dto';
import type { UpdateAnimalDto } from './dto/update-animal.dto';
import { AnimalsRepository } from './animals.repository';

// TODO: Separate controller DTO and DB's
@Injectable()
export class AnimalsService {
  constructor(private readonly repository: AnimalsRepository) {}

  async list(
    query: ListAnimalsDto,
    role: ApplicationRole,
  ): Promise<AnimalResponse[]> {
    if (query.status !== 'active' && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to view archived animals',
      );
    }

    return this.repository.getAnimalsByQuery({
      search: query.search,
      status: query.status,
    });
  }

  async get(id: string, role: ApplicationRole): Promise<AnimalResponse> {
    const animal = await this.repository.getAnimalById(id, role === 'admin');

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    return animal;
  }

  async create(input: CreateAnimalDto): Promise<AnimalResponse> {
    return this.repository.createAnimal(input);
  }

  async update(id: string, input: UpdateAnimalDto): Promise<AnimalResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    const animal = await this.repository.getAnimalById(id, true);
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    if (isAnimalArchived(animal)) {
      throw new ConflictException('Cannot update an archived animal');
    }

    return await this.repository.updateAnimal(id, input);
  }

  async archive(id: string): Promise<AnimalResponse> {
    const animal = await this.repository.getAnimalById(id, true);

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    if (isAnimalArchived(animal)) {
      throw new ConflictException('Animal is already archived');
    }

    return this.repository.archiveAnimal(id);
  }
}

function isAnimalArchived(animal: Animal): boolean {
  return animal.archivedAt !== null;
}
