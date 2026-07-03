import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  AnimalStateRecord,
  FeedingPlanListStatus,
  FeedingPlanMutationRecord,
  FeedingPlanRecord,
  CreateFeedingPlanData,
} from './feeding-plan.types';
import { feedingPlanRelations } from './feeding-plan.types';

@Injectable()
export class FeedingPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(
    animalId: string,
    status: FeedingPlanListStatus,
  ): Promise<FeedingPlanRecord[]> {
    if (status === 'archived') {
      return this.prisma.feedingPlan.findMany({
        where: { animalId, archivedAt: { not: null } },
        include: feedingPlanRelations,
        orderBy: [{ archivedAt: 'desc' }, { createdAt: 'desc' }],
      });
    }
    return this.prisma.feedingPlan.findMany({
      where: { animalId, archivedAt: null },
      include: feedingPlanRelations,
      orderBy: [{ period: 'asc' }, { name: 'asc' }],
    });
  }

  findVisibleAnimal(
    animalId: string,
    includeArchived: boolean,
  ): Promise<{ id: string } | null> {
    return this.prisma.animal.findFirst({
      where: {
        id: animalId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      select: { id: true },
    });
  }

  findAnimalState(animalId: string): Promise<AnimalStateRecord | null> {
    return this.prisma.animal.findUnique({
      where: { id: animalId },
      select: { archivedAt: true },
    });
  }

  findPlanForMutation(
    animalId: string,
    planId: string,
  ): Promise<FeedingPlanMutationRecord | null> {
    return this.prisma.feedingPlan.findFirst({
      where: { id: planId, animalId },
      select: {
        archivedAt: true,
        animal: { select: { archivedAt: true } },
      },
    });
  }

  create(
    data: CreateFeedingPlanData,
    initialDueDate: Date,
    userId: string,
  ): Promise<FeedingPlanRecord> {
    return this.prisma.feedingPlan.create({
      data: {
        ...data,
        feedingTasks: {
          create: {
            scheduledDueDate: initialDueDate,
            lastModifiedById: userId,
          },
        },
      },
      include: feedingPlanRelations,
    });
  }

  archive(planId: string, userId: string): Promise<FeedingPlanRecord> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.feedingTask.deleteMany({
        where: { feedingPlanId: planId, status: 'AVAILABLE' },
      });
      return transaction.feedingPlan.update({
        where: { id: planId },
        data: { archivedAt: new Date(), lastModifiedById: userId },
        include: feedingPlanRelations,
      });
    });
  }
}
