import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateFeedingPlanData,
  FeedingPlanCreationOperations,
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

  create(data: CreateFeedingPlanData): Promise<FeedingPlanRecord> {
    return this.prisma.feedingPlan.create({
      data,
      include: feedingPlanRelations,
    });
  }

  withCreationTransaction<T>(
    operation: (
      operations: FeedingPlanCreationOperations,
      transaction: Prisma.TransactionClient,
    ) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((transaction) =>
      operation(this.creationOperations(transaction), transaction),
    );
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

  private creationOperations(
    transaction: Prisma.TransactionClient,
  ): FeedingPlanCreationOperations {
    return {
      create: (data) =>
        transaction.feedingPlan.create({
          data,
          select: { id: true },
        }),
      findById: (id) =>
        transaction.feedingPlan.findUniqueOrThrow({
          where: { id },
          include: feedingPlanRelations,
        }),
    };
  }
}
