import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import { PrismaService } from '../database/prisma.service';
import type { Animal, Prisma } from '../generated/prisma/client';
import type { AnimalResponse } from './animal.types';
import type { CreateAnimalDto } from './dto/create-animal.dto';
import type { ListAnimalsDto } from './dto/list-animals.dto';
import type { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListAnimalsDto,
    role: ApplicationRole,
  ): Promise<AnimalResponse[]> {
    if (query.status !== 'active' && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to view archived animals',
      );
    }

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

  async get(id: string, role: ApplicationRole): Promise<AnimalResponse> {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        ...(role === 'admin' ? {} : { archivedAt: null }),
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    return animal;
  }

  async create(input: CreateAnimalDto): Promise<AnimalResponse> {
    this.validateDates(input.dateOfBirth, input.arrivalDate);

    return this.prisma.animal.create({
      data: input,
    });
  }

  async update(id: string, input: UpdateAnimalDto): Promise<AnimalResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    const current = await this.requireActive(id);
    const dateOfBirth =
      input.dateOfBirth === undefined ? current.dateOfBirth : input.dateOfBirth;
    const arrivalDate =
      input.arrivalDate === undefined ? current.arrivalDate : input.arrivalDate;
    this.validateDates(dateOfBirth, arrivalDate);

    return this.prisma.animal.update({
      where: { id },
      data: input,
    });
  }

  async archive(id: string): Promise<AnimalResponse> {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
    if (animal.archivedAt) {
      throw new ConflictException('Animal is already archived');
    }

    return this.prisma.animal.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  private async requireActive(id: string): Promise<Animal> {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
    if (animal.archivedAt) {
      throw new ConflictException('Archived animals cannot be edited');
    }
    return animal;
  }

  private validateDates(
    dateOfBirth: Date | null | undefined,
    arrivalDate: Date | null | undefined,
  ): void {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    if (dateOfBirth && dateOfBirth > today) {
      throw new BadRequestException('Date of birth cannot be in the future');
    }
    if (arrivalDate && arrivalDate > today) {
      throw new BadRequestException('Arrival date cannot be in the future');
    }
    if (dateOfBirth && arrivalDate && arrivalDate < dateOfBirth) {
      throw new BadRequestException(
        'Arrival date cannot be earlier than date of birth',
      );
    }
  }
}
