import { z } from 'zod';
import { apiRequest } from '../../shared/api/http';

export const feedingPeriodSchema = z.enum(['morning', 'afternoon', 'evening']);
export type FeedingPeriod = z.infer<typeof feedingPeriodSchema>;

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const feedingPlanSchema = z.object({
  id: z.string().min(1),
  animalId: z.string().min(1),
  name: z.string().min(1),
  instructions: z.string().min(1),
  period: feedingPeriodSchema,
  repeatEveryDays: z.number().int().positive(),
  currentTask: z
    .object({
      id: z.string().min(1),
      scheduledDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(['AVAILABLE', 'COMPLETED']),
    })
    .nullable(),
  createdBy: personSchema,
  lastModifiedBy: personSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  archivedAt: z.coerce.date().nullable(),
  status: z.enum(['upcoming', 'due']).nullable(),
  minutesPastDue: z.number().int().nonnegative().nullable(),
});

const feedingPlanListSchema = z.array(feedingPlanSchema);

export type FeedingPlan = z.infer<typeof feedingPlanSchema>;

export interface FeedingPlanInput {
  name: string;
  instructions: string;
  period: FeedingPeriod;
  repeatEveryDays: number;
  initialDueDate: string;
}

export const feedingPlanQueryKey = (animalId: string) =>
  ['animals', animalId, 'feeding-plans'] as const;
export const feedingPlanHistoryQueryKey = (animalId: string) =>
  ['animals', animalId, 'feeding-plans', 'history'] as const;

export async function listFeedingPlans(
  animalId: string,
): Promise<FeedingPlan[]> {
  return feedingPlanListSchema.parse(
    await apiRequest<unknown>(`/animals/${animalId}/feeding-plans`),
  );
}

export async function listFeedingPlanHistory(
  animalId: string,
): Promise<FeedingPlan[]> {
  return feedingPlanListSchema.parse(
    await apiRequest<unknown>(
      `/animals/${animalId}/feeding-plans?status=archived`,
    ),
  );
}

export async function createFeedingPlan(
  animalId: string,
  input: FeedingPlanInput,
): Promise<FeedingPlan> {
  return feedingPlanSchema.parse(
    await apiRequest<unknown>(`/animals/${animalId}/feeding-plans`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}

export async function archiveFeedingPlan(
  animalId: string,
  planId: string,
): Promise<FeedingPlan> {
  return feedingPlanSchema.parse(
    await apiRequest<unknown>(
      `/animals/${animalId}/feeding-plans/${planId}/archive`,
      { method: 'POST' },
    ),
  );
}
