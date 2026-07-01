import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateAnimalData,
  AnimalRecord,
  ListAnimalsQuery,
  UpdateAnimalData,
} from './animal.types';

@Injectable()
export class AnimalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAnimal(data: CreateAnimalData): Promise<AnimalRecord> {
    return this.prisma.animal.create({
      data,
    });
  }

  async getAnimalsByQuery(query: ListAnimalsQuery): Promise<AnimalRecord[]> {
    const archiveFilter: Prisma.AnimalWhereInput =
      query.status === 'active'
        ? { archivedAt: null }
        : query.status === 'archived'
          ? { archivedAt: { not: null } }
          : {};

    const searchFilter: Prisma.AnimalWhereInput = query.search
      ? {
          OR: [
            {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              species: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              currentLocation: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    return this.prisma.animal.findMany({
      where: {
        ...archiveFilter,
        ...searchFilter,
      },
      orderBy: [{ name: 'asc' }, { species: 'asc' }],
    });
  }

  async getAnimalById(
    id: string,
    includeArchived: boolean,
  ): Promise<AnimalRecord | null> {
    const where: Prisma.AnimalWhereInput = includeArchived
      ? { id }
      : { id, archivedAt: null };

    return this.prisma.animal.findFirst({
      where,
    });
  }

  async updateAnimal(
    id: string,
    data: UpdateAnimalData,
  ): Promise<AnimalRecord> {
    return this.prisma.animal.update({
      where: { id },
      data,
    });
  }

  async archiveAnimal(id: string): Promise<AnimalRecord> {
    return this.prisma.animal.update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
    });
  }
}
