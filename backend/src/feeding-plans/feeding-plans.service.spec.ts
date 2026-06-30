import { ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import type { FeedingPlan } from '../generated/prisma/client';
import { FeedingPlansService } from './feeding-plans.service';

const person = { id: 'keeper-1', name: 'Ada Keeper' };
const activePlan: FeedingPlan & {
  createdBy: typeof person;
  lastModifiedBy: typeof person;
} = {
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
  const animal = {
    findFirst: jest.fn<(input: unknown) => Promise<{ id: string } | null>>(),
    findUnique:
      jest.fn<
        (input: unknown) => Promise<{ archivedAt: Date | null } | null>
      >(),
  };
  const feedingPlan = {
    findMany: jest.fn<(input: unknown) => Promise<(typeof activePlan)[]>>(),
    findFirst: jest.fn<(input: unknown) => Promise<unknown>>(),
    create: jest.fn<(input: unknown) => Promise<typeof activePlan>>(),
    update: jest.fn<(input: unknown) => Promise<typeof activePlan>>(),
  };
  const service = new FeedingPlansService({
    animal,
    feedingPlan,
  } as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a plan for an active animal with session accountability', async () => {
    animal.findUnique.mockResolvedValueOnce({ archivedAt: null });
    feedingPlan.create.mockResolvedValueOnce(activePlan);

    await expect(
      service.create(
        'animal-1',
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          period: 'morning',
          repeatEveryDays: 1,
          nextDueDate: '2026-07-01',
        },
        person.id,
      ),
    ).resolves.toMatchObject({
      id: activePlan.id,
      nextDueDate: '2026-07-01',
      createdBy: person,
    });

    const createInput = feedingPlan.create.mock.calls[0]?.[0] as {
      data: {
        createdById: string;
        lastModifiedById: string;
        nextDueDate: Date;
      };
    };
    expect(createInput.data.createdById).toBe(person.id);
    expect(createInput.data.lastModifiedById).toBe(person.id);
    expect(createInput.data.nextDueDate).toEqual(
      new Date('2026-07-01T00:00:00.000Z'),
    );
  });

  it('rejects plans for archived animals', async () => {
    animal.findUnique.mockResolvedValueOnce({ archivedAt: new Date() });

    await expect(
      service.create(
        'animal-1',
        {
          name: activePlan.name,
          instructions: activePlan.instructions,
          period: 'morning',
          repeatEveryDays: 1,
          nextDueDate: '2026-07-01',
        },
        person.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(feedingPlan.create).not.toHaveBeenCalled();
  });

  it('does not update an archived plan', async () => {
    feedingPlan.findFirst.mockResolvedValueOnce({
      ...activePlan,
      archivedAt: new Date(),
      animal: { archivedAt: null },
    });

    await expect(
      service.update(
        activePlan.animalId,
        activePlan.id,
        { name: 'Changed' },
        person.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(feedingPlan.update).not.toHaveBeenCalled();
  });

  it('archives a plan without deleting it', async () => {
    feedingPlan.findFirst.mockResolvedValueOnce({
      ...activePlan,
      animal: { archivedAt: null },
    });
    feedingPlan.update.mockResolvedValueOnce({
      ...activePlan,
      archivedAt: new Date(),
    });

    await expect(
      service.archive(activePlan.animalId, activePlan.id, person.id),
    ).resolves.toMatchObject({ id: activePlan.id });
    expect(feedingPlan.update).toHaveBeenCalledTimes(1);
    const updateInput = feedingPlan.update.mock.calls[0]?.[0] as {
      data: { archivedAt: Date; lastModifiedById: string };
    };
    expect(updateInput.data.archivedAt).toBeInstanceOf(Date);
    expect(updateInput.data.lastModifiedById).toBe(person.id);
  });
});
