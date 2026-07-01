import { Injectable } from '@nestjs/common';
import { ListAnimalsDto } from './dto/list-animals.dto';
import { Animal, Prisma } from 'src/generated/prisma/browser';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';

export interface AnimalFilterOptions {
  search?: string;
  status?: 'active' | 'archived' | 'all';
}

@Injectable()
export class AnimalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAnimal(input: CreateAnimalDto): Promise<Animal> {
    return this.prisma.animal.create({ data: input });
  }

  async getAnimalsByQuery(query: ListAnimalsDto): Promise<Animal[]> {
    const archiveFilter =
      query.status === 'active'
        ? { archivedAt: null }
        : query.status === 'archived'
          ? { archivedAt: { not: null } }
          : {};

    const searchFilter: Prisma.AnimalWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { species: { contains: query.search, mode: 'insensitive' } },
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

  async getAnimalById(id: string, includeArchived: boolean): Promise<Animal | null> {
    const whereClause: Prisma.AnimalWhereInput = includeArchived
      ? { id }
      : { id, archivedAt: null };

    return this.prisma.animal.findFirst({
      where: whereClause,
    });
  }

  async archiveAnimal(id: string): Promise<Animal> {
    return this.prisma.animal.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  async updateAnimal(id: string, data: UpdateAnimalDto): Promise<Animal> {
    return this.prisma.animal.update({ where: { id }, data });
  }
}
