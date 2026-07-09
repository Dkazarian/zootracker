import type { FeedingTaskStatus, Prisma } from '../generated/prisma/client';

export type FeedingPlanStatus = 'upcoming' | 'due';
export type FeedingPlanListStatus = 'active' | 'archived';

export interface FeedingPlanPersonResponse {
  id: string;
  name: string;
}

export interface FeedingPlanResponse {
  id: string;
  animalId: string;
  name: string;
  instructions: string;
  repeatEveryDays: number;
  currentTask: {
    id: string;
    scheduledDueAt: Date;
    status: FeedingTaskStatus;
  } | null;
  createdBy: FeedingPlanPersonResponse;
  lastModifiedBy: FeedingPlanPersonResponse;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  status: FeedingPlanStatus | null;
  minutesPastDue: number | null;
}

export interface CreateFeedingPlanInput {
  name: string;
  instructions: string;
  repeatEveryDays: number;
  initialDueAt: string;
}

export interface CreateFeedingPlanData {
  animalId: string;
  name: string;
  instructions: string;
  repeatEveryDays: number;
  createdById: string;
  lastModifiedById: string;
}

export const feedingPlanRelations = {
  createdBy: { select: { id: true, name: true } },
  lastModifiedBy: { select: { id: true, name: true } },
  feedingTasks: {
    where: { status: 'AVAILABLE' },
    orderBy: { scheduledDueAt: 'asc' },
    take: 1,
    select: {
      id: true,
      scheduledDueAt: true,
      status: true,
    },
  },
} satisfies Prisma.FeedingPlanInclude;

export type FeedingPlanRecord = Prisma.FeedingPlanGetPayload<{
  include: typeof feedingPlanRelations;
}>;

export interface FeedingPlanMutationRecord {
  archivedAt: Date | null;
  animal: { archivedAt: Date | null };
}
