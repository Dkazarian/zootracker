import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import type { Animal } from '../generated/prisma/client';
import { AnimalsService } from './animals.service';

const activeAnimal: Animal = {
  id: 'animal-1',
  name: 'Amara',
  species: 'African elephant',
  sex: 'female',
  dateOfBirth: new Date('2004-05-12T00:00:00.000Z'),
  arrivalDate: new Date('2018-03-20T00:00:00.000Z'),
  currentLocation: 'Savanna Habitat',
  notes: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  archivedAt: null,
};

describe('AnimalsService', () => {
  const animal = {
    findMany: jest.fn<(input: unknown) => Promise<Animal[]>>(),
    findFirst: jest.fn<(input: unknown) => Promise<Animal | null>>(),
    findUnique: jest.fn<(input: unknown) => Promise<Animal | null>>(),
    create: jest.fn<(input: unknown) => Promise<Animal>>(),
    update: jest.fn<(input: unknown) => Promise<Animal>>(),
  };
  const service = new AnimalsService({ animal } as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not let a keeper request archived animals', async () => {
    await expect(
      service.list({ status: 'archived' }, 'keeper'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(animal.findMany).not.toHaveBeenCalled();
  });

  it('rejects inconsistent dates before creating an animal', async () => {
    await expect(
      service.create({
        name: 'Nilo',
        species: 'Capybara',
        dateOfBirth: new Date('2025-01-02T00:00:00.000Z'),
        arrivalDate: new Date('2025-01-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(animal.create).not.toHaveBeenCalled();
  });

  it('does not edit an archived animal', async () => {
    animal.findUnique.mockResolvedValueOnce({
      ...activeAnimal,
      archivedAt: new Date(),
    });

    await expect(
      service.update(activeAnimal.id, { name: 'Updated' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(animal.update).not.toHaveBeenCalled();
  });

  it('archives an active animal without deleting it', async () => {
    const archived = { ...activeAnimal, archivedAt: new Date() };
    animal.findUnique.mockResolvedValueOnce(activeAnimal);
    animal.update.mockResolvedValueOnce(archived);

    await expect(service.archive(activeAnimal.id)).resolves.toEqual(archived);
    expect(animal.update).toHaveBeenCalledTimes(1);
    const updateInput = animal.update.mock.calls[0]?.[0] as {
      where: { id: string };
      data: { archivedAt: Date };
    };
    expect(updateInput.where).toEqual({ id: activeAnimal.id });
    expect(updateInput.data.archivedAt).toBeInstanceOf(Date);
  });
});
