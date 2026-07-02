import { BadRequestException, ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import type { FeedingPlanRecord } from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';
import { FeedingPlansService } from './feeding-plans.service';

const person = { id: 'keeper-1', name: 'Ada Keeper' };
const activePlan: FeedingPlanRecord = {
  id: 'plan-1',
  animalId: 'animal-1',
  name: 'Morning fruit',
  instructions: '3 bananas and an apple',
  period: 'morning',
  repeatEveryDays: 1,
  nextDueDate: new Date('2026-07-01T00:00:00.000Z'),
  createdById: person.id,
  lastModifiedById: person.id,
  createdAt: new Date('2026-06-30T12:00:00.000Z'),
  updatedAt: new Date('2026-06-30T12:00:00.000Z'),
  archivedAt: null,
  createdBy: person,
  lastModifiedBy: person,
};

describe('FeedingPlansService', () => {
  const repository = {
    list: jest.fn<FeedingPlansRepository['list']>(),
    findVisibleAnimal: jest.fn<FeedingPlansRepository['findVisibleAnimal']>(),
    findAnimalState: jest.fn<FeedingPlansRepository['findAnimalState']>(),
    findPlanForMutation:
      jest.fn<FeedingPlansRepository['findPlanForMutation']>(),
    create: jest.fn<FeedingPlansRepository['create']>(),
    archive: jest.fn<FeedingPlansRepository['archive']>(),
  };
  const service = new FeedingPlansService(
    repository as unknown as FeedingPlansRepository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a plan for an active animal with audit identifiers', async () => {
    repository.findAnimalState.mockResolvedValueOnce({ archivedAt: null });
    repository.create.mockResolvedValueOnce(activePlan);
    await service.create(
      activePlan.animalId,
      {
        name: activePlan.name,
        instructions: activePlan.instructions,
        period: activePlan.period,
        repeatEveryDays: 1,
        nextDueDate: '2026-07-01',
      },
      person.id,
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        animalId: activePlan.animalId,
        createdById: person.id,
        lastModifiedById: person.id,
        nextDueDate: new Date('2026-07-01T00:00:00.000Z'),
      }),
    );
  });

  it('rejects invalid calendar dates', async () => {
    repository.findAnimalState.mockResolvedValueOnce({ archivedAt: null });
    await expect(
      service.create(
        activePlan.animalId,
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          period: activePlan.period,
          repeatEveryDays: 1,
          nextDueDate: '2026-02-31',
        },
        person.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects plans for archived animals', async () => {
    repository.findAnimalState.mockResolvedValueOnce({
      archivedAt: new Date(),
    });
    await expect(
      service.create(
        activePlan.animalId,
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          period: activePlan.period,
          repeatEveryDays: 1,
          nextDueDate: '2026-07-01',
        },
        person.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not archive an already archived plan', async () => {
    repository.findPlanForMutation.mockResolvedValueOnce({
      archivedAt: new Date(),
      animal: { archivedAt: null },
    });
    await expect(
      service.archive(activePlan.animalId, activePlan.id, person.id),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('archives an active plan with modifier accountability', async () => {
    repository.findPlanForMutation.mockResolvedValueOnce({
      archivedAt: null,
      animal: { archivedAt: null },
    });
    repository.archive.mockResolvedValueOnce({
      ...activePlan,
      archivedAt: new Date('2026-07-01T12:00:00.000Z'),
    });
    await service.archive(activePlan.animalId, activePlan.id, person.id);
    expect(repository.archive).toHaveBeenCalledWith(activePlan.id, person.id);
  });
});
