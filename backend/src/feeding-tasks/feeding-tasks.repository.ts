import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  type CreateScheduledTaskData,
  feedingTaskRelations,
  type FeedingTaskRecord,
  type ScheduledTaskCreationOperations,
  type UndoCompletionResult,
} from './feeding-task.types';

@Injectable()
export class FeedingTasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  listCompleted(animalId: string): Promise<FeedingTaskRecord[]> {
    return this.prisma.feedingTask.findMany({
      where: {
        status: 'COMPLETED',
        feedingPlan: { animalId },
      },
      include: feedingTaskRelations,
      orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findById(taskId: string): Promise<FeedingTaskRecord | null> {
    return this.prisma.feedingTask.findUnique({
      where: { id: taskId },
      include: feedingTaskRelations,
    });
  }

  createScheduledTask(
    data: CreateScheduledTaskData,
    operations = this.scheduledTaskCreationOperations(this.prisma),
  ): Promise<void> {
    return operations.createScheduledTask(data);
  }

  scheduledTaskCreationOperations(
    client: Prisma.TransactionClient | PrismaService,
  ): ScheduledTaskCreationOperations {
    return {
      createScheduledTask: async (data) => {
        await client.feedingTask.create({ data });
      },
    };
  }

  complete(
    taskId: string,
    userId: string,
    completedAt: Date,
    notes: string | undefined,
    createSuccessor: (
      operations: ScheduledTaskCreationOperations,
      feedingPlanId: string,
    ) => Promise<void>,
  ): Promise<FeedingTaskRecord | null> {
    return this.prisma.$transaction(async (transaction) => {
      const transition = await transaction.feedingTask.updateMany({
        where: { id: taskId, status: 'AVAILABLE' },
        data: {
          status: 'COMPLETED',
          completedById: userId,
          completedAt,
          notes: notes ?? null,
          lastModifiedById: userId,
        },
      });
      if (transition.count !== 1) return null;

      const current = await transaction.feedingTask.findUniqueOrThrow({
        where: { id: taskId },
        select: { feedingPlanId: true },
      });
      await createSuccessor(
        this.scheduledTaskCreationOperations(transaction),
        current.feedingPlanId,
      );
      return transaction.feedingTask.findUniqueOrThrow({
        where: { id: taskId },
        include: feedingTaskRelations,
      });
    });
  }

  updateCompletion(
    taskId: string,
    userId: string,
    completedAt: Date | undefined,
    notes: string | undefined,
  ): Promise<FeedingTaskRecord> {
    return this.prisma.feedingTask.update({
      where: { id: taskId },
      data: {
        ...(completedAt ? { completedAt } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
        lastModifiedById: userId,
      },
      include: feedingTaskRelations,
    });
  }

  undoCompletion(
    taskId: string,
    userId: string,
  ): Promise<UndoCompletionResult> {
    return this.prisma.$transaction(
      async (transaction): Promise<UndoCompletionResult> => {
        const task = await transaction.feedingTask.findUnique({
          where: { id: taskId },
          include: feedingTaskRelations,
        });
        if (!task) return { kind: 'not-found' };
        if (task.status !== 'COMPLETED') return { kind: 'not-completed' };

        const laterCompletion = await transaction.feedingTask.findFirst({
          where: {
            feedingPlanId: task.feedingPlanId,
            status: 'COMPLETED',
            scheduledDueAt: { gt: task.scheduledDueAt },
          },
          select: { id: true },
        });
        if (laterCompletion) return { kind: 'later-completion' };

        const successor = await transaction.feedingTask.findFirst({
          where: {
            feedingPlanId: task.feedingPlanId,
            status: 'AVAILABLE',
          },
          select: { id: true },
        });
        if (!successor) return { kind: 'missing-successor' };

        await transaction.feedingTask.delete({ where: { id: successor.id } });
        const restored = await transaction.feedingTask.update({
          where: { id: taskId },
          data: {
            status: 'AVAILABLE',
            completedById: null,
            completedAt: null,
            notes: null,
            lastModifiedById: userId,
          },
          include: feedingTaskRelations,
        });
        return { kind: 'success', task: restored };
      },
      { isolationLevel: 'Serializable' },
    );
  }
}
