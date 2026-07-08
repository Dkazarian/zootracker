import type {
  FeedingPeriod,
  FeedingTaskStatus,
  Prisma,
} from '../generated/prisma/client';

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
  period: FeedingPeriod;
  repeatEveryDays: number;
  currentTask: {
    id: string;
    scheduledDueDate: string;
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
  period: FeedingPeriod;
  repeatEveryDays: number;
  initialDueDate: string;
}

export interface CreateFeedingPlanData {
  animalId: string;
  name: string;
  instructions: string;
  period: FeedingPeriod;
  repeatEveryDays: number;
  createdById: string;
  lastModifiedById: string;
}

export const feedingPlanRelations = {
  createdBy: { select: { id: true, name: true } },
  lastModifiedBy: { select: { id: true, name: true } },
  feedingTasks: {
    where: { status: 'AVAILABLE' },
    orderBy: { scheduledDueDate: 'asc' },
    take: 1,
    select: {
      id: true,
      scheduledDueDate: true,
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

export interface AnimalStateRecord {
  archivedAt: Date | null;
}
