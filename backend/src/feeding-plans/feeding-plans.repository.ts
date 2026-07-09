import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateFeedingPlanData,
  FeedingPlanListStatus,
  FeedingPlanMutationRecord,
  FeedingPlanRecord,
} from './feeding-plan.types';
import { feedingPlanRelations } from './feeding-plan.types';

@Injectable()
export class FeedingPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    animalId: string,
    status: FeedingPlanListStatus,
  ): Promise<FeedingPlanRecord[]> {
    return this.prisma.feedingPlan.findMany({
      where: {
        animalId,
        archivedAt: status === 'archived' ? { not: null } : null,
      },
      include: feedingPlanRelations,
      orderBy:
        status === 'archived'
          ? [{ archivedAt: 'desc' }, { createdAt: 'desc' }]
          : [{ name: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findPlanById(planId: string): Promise<FeedingPlanMutationRecord | null> {
    return this.prisma.feedingPlan.findUnique({
      where: { id: planId },
      select: {
        archivedAt: true,
        animal: { select: { archivedAt: true } },
      },
    });
  }

  create(
    data: CreateFeedingPlanData,
    initialDueAt: Date,
    userId: string,
  ): Promise<FeedingPlanRecord> {
    return this.prisma.feedingPlan.create({
      data: {
        ...data,
        feedingTasks: {
          create: {
            scheduledDueAt: initialDueAt,
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
