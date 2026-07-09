import { BadRequestException, ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AnimalsService } from '../animals/animals.service';
import type { FeedingPlanRecord } from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';
import { FeedingPlansService } from './feeding-plans.service';

const person = { id: 'keeper-1', name: 'Ada Keeper' };
const activePlan: FeedingPlanRecord = {
  id: 'plan-1',
  animalId: 'animal-1',
  name: 'Morning fruit',
  instructions: '3 bananas and an apple',
  repeatEveryDays: 1,
  createdById: person.id,
  lastModifiedById: person.id,
  createdAt: new Date('2026-06-30T12:00:00.000Z'),
  updatedAt: new Date('2026-06-30T12:00:00.000Z'),
  archivedAt: null,
  createdBy: person,
  lastModifiedBy: person,
  feedingTasks: [
    {
      id: 'task-1',
      scheduledDueAt: new Date('2026-07-01T09:00:00.000Z'),
      status: 'AVAILABLE',
    },
  ],
};

describe('FeedingPlansService', () => {
  const repository = {
    list: jest.fn<FeedingPlansRepository['list']>(),
    findPlanById: jest.fn<FeedingPlansRepository['findPlanById']>(),
    create: jest.fn<FeedingPlansRepository['create']>(),
    archive: jest.fn<FeedingPlansRepository['archive']>(),
  };
  const animalsService = {
    getAnimalRecord: jest.fn<AnimalsService['getAnimalRecord']>(),
    requireActiveAnimal: jest.fn<AnimalsService['requireActiveAnimal']>(),
  };
  const service = new FeedingPlansService(
    repository as unknown as FeedingPlansRepository,
    animalsService as unknown as AnimalsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a plan for an active animal with audit identifiers', async () => {
    animalsService.requireActiveAnimal.mockResolvedValueOnce(undefined);
    repository.create.mockResolvedValueOnce(activePlan);
    await service.create(
      activePlan.animalId,
      {
        name: activePlan.name,
        instructions: activePlan.instructions,
        repeatEveryDays: 1,
        initialDueAt: '2026-07-01T09:00:00.000Z',
      },
      person.id,
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        animalId: activePlan.animalId,
        createdById: person.id,
        lastModifiedById: person.id,
      }),
      new Date('2026-07-01T09:00:00.000Z'),
      person.id,
    );
  });

  it('rejects invalid timestamps', async () => {
    animalsService.requireActiveAnimal.mockResolvedValueOnce(undefined);
    await expect(
      service.create(
        activePlan.animalId,
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          repeatEveryDays: 1,
          initialDueAt: 'not-a-timestamp',
        },
        person.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects plans for archived animals', async () => {
    animalsService.requireActiveAnimal.mockRejectedValueOnce(
      new ConflictException(
        'Feeding plans cannot be changed for an archived animal',
      ),
    );
    await expect(
      service.create(
        activePlan.animalId,
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          repeatEveryDays: 1,
          initialDueAt: '2026-07-01T09:00:00.000Z',
        },
        person.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not archive an already archived plan', async () => {
    repository.findPlanById.mockResolvedValueOnce({
      archivedAt: new Date(),
      animal: { archivedAt: null },
    });
    await expect(
      service.archive(activePlan.id, person.id),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('archives an active plan with modifier accountability', async () => {
    repository.findPlanById.mockResolvedValueOnce({
      archivedAt: null,
      animal: { archivedAt: null },
    });
    repository.archive.mockResolvedValueOnce({
      ...activePlan,
      archivedAt: new Date('2026-07-01T12:00:00.000Z'),
    });
    await service.archive(activePlan.id, person.id);
    expect(repository.archive).toHaveBeenCalledWith(activePlan.id, person.id);
  });
});
