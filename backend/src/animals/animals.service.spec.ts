import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import type { AnimalRecord } from './animal.types';
import { AnimalsRepository } from './animals.repository';
import { AnimalsService } from './animals.service';

const activeAnimal: AnimalRecord = {
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
  const repository = {
    createAnimal: jest.fn<AnimalsRepository['createAnimal']>(),
    getAnimalsByQuery: jest.fn<AnimalsRepository['getAnimalsByQuery']>(),
    getAnimalById: jest.fn<AnimalsRepository['getAnimalById']>(),
    updateAnimal: jest.fn<AnimalsRepository['updateAnimal']>(),
    archiveAnimal: jest.fn<AnimalsRepository['archiveAnimal']>(),
  };
  const service = new AnimalsService(
    repository as unknown as AnimalsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults lists to active animals and maps repository records', async () => {
    repository.getAnimalsByQuery.mockResolvedValueOnce([activeAnimal]);

    await expect(service.list({}, 'keeper')).resolves.toEqual([activeAnimal]);
    expect(repository.getAnimalsByQuery).toHaveBeenCalledWith({
      search: undefined,
      status: 'active',
    });
  });

  it('does not let a keeper request archived animals', async () => {
    await expect(
      service.list({ status: 'archived' }, 'keeper'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.getAnimalsByQuery).not.toHaveBeenCalled();
  });

  it('returns not found when an animal is not visible', async () => {
    repository.getAnimalById.mockResolvedValueOnce(null);

    await expect(service.get('missing', 'keeper')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.getAnimalById).toHaveBeenCalledWith('missing', false);
  });

  it.each([
    {
      dateOfBirth: new Date('2999-01-01T00:00:00.000Z'),
      arrivalDate: null,
    },
    {
      dateOfBirth: null,
      arrivalDate: new Date('2999-01-01T00:00:00.000Z'),
    },
    {
      dateOfBirth: new Date('2025-01-02T00:00:00.000Z'),
      arrivalDate: new Date('2025-01-01T00:00:00.000Z'),
    },
  ])('rejects invalid dates before creating an animal', async (dates) => {
    await expect(
      service.create({
        name: 'Nilo',
        species: 'Capybara',
        ...dates,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createAnimal).not.toHaveBeenCalled();
  });

  it('maps omitted nullable fields when creating an animal', async () => {
    repository.createAnimal.mockResolvedValueOnce(activeAnimal);

    await service.create({ name: 'Amara', species: 'African elephant' });

    expect(repository.createAnimal).toHaveBeenCalledWith({
      name: 'Amara',
      species: 'African elephant',
      sex: null,
      dateOfBirth: null,
      arrivalDate: null,
      currentLocation: null,
      notes: null,
    });
  });

  it('rejects an empty update', async () => {
    await expect(service.update(activeAnimal.id, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.getAnimalById).not.toHaveBeenCalled();
  });

  it('does not edit an archived animal', async () => {
    repository.getAnimalById.mockResolvedValueOnce({
      ...activeAnimal,
      archivedAt: new Date(),
    });

    await expect(
      service.update(activeAnimal.id, { name: 'Updated' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.updateAnimal).not.toHaveBeenCalled();
  });

  it('validates updated dates together with stored dates', async () => {
    repository.getAnimalById.mockResolvedValueOnce(activeAnimal);

    await expect(
      service.update(activeAnimal.id, {
        arrivalDate: new Date('2000-01-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.updateAnimal).not.toHaveBeenCalled();
  });

  it('maps only fields supplied by an update', async () => {
    const updated = { ...activeAnimal, currentLocation: null };
    repository.getAnimalById.mockResolvedValueOnce(activeAnimal);
    repository.updateAnimal.mockResolvedValueOnce(updated);

    await expect(
      service.update(activeAnimal.id, { currentLocation: null }),
    ).resolves.toEqual(updated);
    expect(repository.updateAnimal).toHaveBeenCalledWith(activeAnimal.id, {
      currentLocation: null,
    });
  });

  it('archives an active animal without deleting it', async () => {
    const archived = { ...activeAnimal, archivedAt: new Date() };
    repository.getAnimalById.mockResolvedValueOnce(activeAnimal);
    repository.archiveAnimal.mockResolvedValueOnce(archived);

    await expect(service.archive(activeAnimal.id)).resolves.toEqual(archived);
    expect(repository.archiveAnimal).toHaveBeenCalledWith(activeAnimal.id);
  });

  it('does not archive an animal twice', async () => {
    repository.getAnimalById.mockResolvedValueOnce({
      ...activeAnimal,
      archivedAt: new Date(),
    });

    await expect(service.archive(activeAnimal.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.archiveAnimal).not.toHaveBeenCalled();
  });
});
