import type { FeedingPeriod } from '../generated/prisma/client';

export type FeedingPlanStatus = 'upcoming' | 'due';

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
  status: FeedingPlanStatus;
  minutesPastDue: number | null;
}
