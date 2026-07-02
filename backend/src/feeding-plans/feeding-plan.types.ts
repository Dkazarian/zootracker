import type { FeedingPeriod, Prisma } from '../generated/prisma/client';

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
  nextDueDate: string;
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
  nextDueDate: string;
}

export interface CreateFeedingPlanData {
  animalId: string;
  name: string;
  instructions: string;
  period: FeedingPeriod;
  repeatEveryDays: number;
  nextDueDate: Date;
  createdById: string;
  lastModifiedById: string;
}

export const feedingPlanPeople = {
  createdBy: { select: { id: true, name: true } },
  lastModifiedBy: { select: { id: true, name: true } },
} satisfies Prisma.FeedingPlanInclude;

export type FeedingPlanRecord = Prisma.FeedingPlanGetPayload<{
  include: typeof feedingPlanPeople;
}>;

export interface FeedingPlanMutationRecord {
  archivedAt: Date | null;
  animal: { archivedAt: Date | null };
}

export interface AnimalStateRecord {
  archivedAt: Date | null;
}
