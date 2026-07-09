import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import { AnimalsService } from '../animals/animals.service';
import type { FeedingTaskRecord } from './feeding-task.types';
import { FeedingTasksRepository } from './feeding-tasks.repository';
import { FeedingTasksService } from './feeding-tasks.service';

const person = { id: 'keeper-1', name: 'Ada Keeper' };

function taskRecord(
  overrides: Partial<FeedingTaskRecord> = {},
): FeedingTaskRecord {
  return {
    id: 'task-1',
    feedingPlanId: 'plan-1',
    scheduledDueAt: new Date('2026-07-01T09:00:00.000Z'),
    status: 'AVAILABLE',
    completedById: null,
    completedAt: null,
    notes: null,
    lastModifiedById: person.id,
    createdAt: new Date('2026-07-01T00:00:00.000Z'),
    updatedAt: new Date('2026-07-01T00:00:00.000Z'),
    completedBy: null,
    lastModifiedBy: person,
    feedingPlan: {
      id: 'plan-1',
      animalId: 'animal-1',
      name: 'Morning fruit',
      instructions: '3 bananas and an apple',
      repeatEveryDays: 1,
      archivedAt: null,
      animal: { archivedAt: null },
    },
    ...overrides,
  };
}

describe('FeedingTasksService', () => {
  const repository = {
    listCompleted: jest.fn<FeedingTasksRepository['listCompleted']>(),
    findById: jest.fn<FeedingTasksRepository['findById']>(),
    createScheduledTask:
      jest.fn<FeedingTasksRepository['createScheduledTask']>(),
    scheduledTaskCreationOperations:
      jest.fn<FeedingTasksRepository['scheduledTaskCreationOperations']>(),
    complete: jest.fn<FeedingTasksRepository['complete']>(),
    updateCompletion: jest.fn<FeedingTasksRepository['updateCompletion']>(),
    undoCompletion: jest.fn<FeedingTasksRepository['undoCompletion']>(),
  };
  const animalsService = {
    getAnimalRecord: jest.fn<AnimalsService['getAnimalRecord']>(),
  };
  const service = new FeedingTasksService(
    repository as unknown as FeedingTasksRepository,
    animalsService as unknown as AnimalsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a scheduled task with modifier accountability', async () => {
    const operations = { createScheduledTask: jest.fn<() => Promise<void>>() };

    await service.createScheduledTask(
      'plan-1',
      new Date('2026-07-02T09:00:00.000Z'),
      person.id,
      operations,
    );

    expect(repository.createScheduledTask).toHaveBeenCalledWith(
      {
        feedingPlanId: 'plan-1',
        scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
        lastModifiedById: person.id,
      },
      operations,
    );
  });

  it('requires a visible animal before returning completed history', async () => {
    animalsService.getAnimalRecord.mockRejectedValueOnce(
      new NotFoundException('Animal not found'),
    );
    await expect(
      service.listCompleted('animal-1', 'keeper'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.listCompleted).not.toHaveBeenCalled();
  });

  it('completes an available task with authenticated accountability', async () => {
    const available = taskRecord();
    const completed = taskRecord({
      status: 'COMPLETED',
      completedById: person.id,
      completedAt: new Date('2026-07-02T10:00:00.000Z'),
      notes: 'Ate everything',
      completedBy: person,
    });
    repository.findById.mockResolvedValueOnce(available);
    const operations = { createScheduledTask: jest.fn<() => Promise<void>>() };
    repository.complete.mockImplementationOnce(
      async (_taskId, _userId, _completedAt, _notes, createSuccessor) => {
        await createSuccessor(operations, available.feedingPlanId);
        return completed;
      },
    );

    const response = await service.complete(
      available.id,
      {
        completedAt: '2026-07-02T10:00:00.000Z',
        notes: 'Ate everything',
      },
      person.id,
    );

    expect(repository.complete).toHaveBeenCalledWith(
      available.id,
      person.id,
      new Date('2026-07-02T10:00:00.000Z'),
      'Ate everything',
      expect.any(Function),
    );
    expect(repository.createScheduledTask).toHaveBeenCalledWith(
      {
        feedingPlanId: available.feedingPlanId,
        scheduledDueAt: new Date('2026-07-03T09:00:00.000Z'),
        lastModifiedById: person.id,
      },
      operations,
    );
    expect(response).toMatchObject({
      id: available.id,
      status: 'COMPLETED',
      completedBy: person,
      notes: 'Ate everything',
    });
  });

  it('rejects archived plans, repeated completion, future completion, and dates before schedule', async () => {
    repository.findById.mockResolvedValueOnce(
      taskRecord({
        feedingPlan: { ...taskRecord().feedingPlan, archivedAt: new Date() },
      }),
    );
    await expect(
      service.complete('task-1', {}, person.id),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findById.mockResolvedValueOnce(
      taskRecord({ status: 'COMPLETED' }),
    );
    await expect(
      service.complete('task-1', {}, person.id),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findById.mockResolvedValueOnce(taskRecord());
    await expect(
      service.complete(
        'task-1',
        { completedAt: '2999-01-01T00:00:00.000Z' },
        person.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    repository.findById.mockResolvedValueOnce(taskRecord());
    await expect(
      service.complete(
        'task-1',
        { completedAt: '2026-07-01T08:59:59.000Z' },
        person.id,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('corrects only completed tasks and preserves the original completer', async () => {
    const completed = taskRecord({
      status: 'COMPLETED',
      completedById: person.id,
      completedBy: person,
      completedAt: new Date('2026-07-02T10:00:00.000Z'),
    });
    repository.findById.mockResolvedValueOnce(completed);
    repository.updateCompletion.mockResolvedValueOnce({
      ...completed,
      notes: 'Left some food',
      lastModifiedBy: { id: 'admin-1', name: 'Admin User' },
    });

    const response = await service.updateCompletion(
      completed.id,
      { notes: 'Left some food' },
      'admin-1',
    );

    expect(repository.updateCompletion).toHaveBeenCalledWith(
      completed.id,
      'admin-1',
      undefined,
      'Left some food',
    );
    expect(response.completedBy).toEqual(person);
    expect(response.lastModifiedBy).toEqual({
      id: 'admin-1',
      name: 'Admin User',
    });
  });

  it('maps undo repository outcomes to useful responses', async () => {
    repository.undoCompletion.mockResolvedValueOnce({ kind: 'not-found' });
    await expect(
      service.undoCompletion('missing', person.id),
    ).rejects.toBeInstanceOf(NotFoundException);

    repository.undoCompletion.mockResolvedValueOnce({
      kind: 'later-completion',
    });
    await expect(
      service.undoCompletion('task-1', person.id),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.undoCompletion.mockResolvedValueOnce({
      kind: 'success',
      task: taskRecord(),
    });
    await expect(
      service.undoCompletion('task-1', person.id),
    ).resolves.toMatchObject({
      status: 'AVAILABLE',
      completedAt: null,
    });
  });
});
