import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import type { AnimalRecord } from './animal.types';
import { AnimalsRepository } from './animals.repository';

const animalRecord: AnimalRecord = {
  id: 'animal-1',
  name: 'Amara',
  species: 'African elephant',
  sex: 'female',
  dateOfBirth: null,
  arrivalDate: null,
  currentLocation: 'Savanna Habitat',
  notes: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  archivedAt: null,
};

describe('AnimalsRepository', () => {
  const animal = {
    create: jest.fn<(input: unknown) => Promise<AnimalRecord>>(),
    findMany: jest.fn<(input: unknown) => Promise<AnimalRecord[]>>(),
    findFirst: jest.fn<(input: unknown) => Promise<AnimalRecord | null>>(),
    update: jest.fn<(input: unknown) => Promise<AnimalRecord>>(),
  };
  const repository = new AnimalsRepository({
    animal,
  } as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['active', { archivedAt: null }],
    ['archived', { archivedAt: { not: null } }],
    ['all', {}],
  ] as const)(
    'applies the %s archive filter',
    async (status, archiveFilter) => {
      animal.findMany.mockResolvedValueOnce([]);

      await repository.getAnimalsByQuery({ status });

      expect(animal.findMany).toHaveBeenCalledWith({
        where: archiveFilter,
        orderBy: [{ name: 'asc' }, { species: 'asc' }],
      });
    },
  );

  it('searches supported fields case-insensitively and preserves ordering', async () => {
    animal.findMany.mockResolvedValueOnce([animalRecord]);

    await repository.getAnimalsByQuery({
      search: 'savanna',
      status: 'active',
    });

    expect(animal.findMany).toHaveBeenCalledWith({
      where: {
        archivedAt: null,
        OR: [
          { name: { contains: 'savanna', mode: 'insensitive' } },
          { species: { contains: 'savanna', mode: 'insensitive' } },
          {
            currentLocation: {
              contains: 'savanna',
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: [{ name: 'asc' }, { species: 'asc' }],
    });
  });

  it('finds an animal by id without applying visibility rules', async () => {
    animal.findFirst.mockResolvedValueOnce(animalRecord);

    await repository.getAnimalById(animalRecord.id);

    expect(animal.findFirst).toHaveBeenCalledWith({
      where: { id: animalRecord.id },
    });
  });

  it('delegates create and update data without adding fields', async () => {
    animal.create.mockResolvedValueOnce(animalRecord);
    animal.update.mockResolvedValueOnce(animalRecord);
    const createData = {
      name: animalRecord.name,
      species: animalRecord.species,
      sex: null,
      dateOfBirth: null,
      arrivalDate: null,
      currentLocation: null,
      notes: null,
    };

    await repository.createAnimal(createData);
    await repository.updateAnimal(animalRecord.id, { notes: 'Observed' });

    expect(animal.create).toHaveBeenCalledWith({ data: createData });
    expect(animal.update).toHaveBeenCalledWith({
      where: { id: animalRecord.id },
      data: { notes: 'Observed' },
    });
  });

  it('archives by setting a timestamp', async () => {
    animal.update.mockResolvedValueOnce({
      ...animalRecord,
      archivedAt: new Date(),
    });

    await repository.archiveAnimal(animalRecord.id);

    const input = animal.update.mock.calls[0]?.[0] as {
      where: { id: string };
      data: { archivedAt: Date };
    };
    expect(input.where).toEqual({ id: animalRecord.id });
    expect(input.data.archivedAt).toBeInstanceOf(Date);
  });
});
