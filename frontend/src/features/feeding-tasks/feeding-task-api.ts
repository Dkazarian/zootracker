import { z } from 'zod';
import { apiRequest } from '../../shared/api/http';
import { feedingPeriodSchema } from '../feeding-plans/feeding-plan-api';

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const feedingTaskSchema = z.object({
  id: z.string().min(1),
  feedingPlanId: z.string().min(1),
  scheduledDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['AVAILABLE', 'COMPLETED']),
  completedBy: personSchema.nullable(),
  completedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  lastModifiedBy: personSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  plan: z.object({
    id: z.string().min(1),
    animalId: z.string().min(1),
    name: z.string().min(1),
    instructions: z.string().min(1),
    period: feedingPeriodSchema,
    repeatEveryDays: z.number().int().positive(),
    archivedAt: z.coerce.date().nullable(),
  }),
});

export type FeedingTask = z.infer<typeof feedingTaskSchema>;

export interface FeedingTaskCompletionInput {
  completedAt: string;
  notes?: string;
}

export const feedingTaskHistoryQueryKey = (animalId: string) =>
  ['animals', animalId, 'feeding-tasks', 'completed'] as const;

export async function listCompletedFeedingTasks(
  animalId: string,
): Promise<FeedingTask[]> {
  return z
    .array(feedingTaskSchema)
    .parse(
      await apiRequest<unknown>(
        `/animals/${animalId}/feeding-tasks?status=completed`,
      ),
    );
}

export async function completeFeedingTask(
  taskId: string,
  input: FeedingTaskCompletionInput,
): Promise<FeedingTask> {
  return feedingTaskSchema.parse(
    await apiRequest<unknown>(`/feeding-tasks/${taskId}/completion`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}

export async function updateFeedingTaskCompletion(
  taskId: string,
  input: FeedingTaskCompletionInput,
): Promise<FeedingTask> {
  return feedingTaskSchema.parse(
    await apiRequest<unknown>(`/feeding-tasks/${taskId}/completion`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  );
}

export async function undoFeedingTaskCompletion(
  taskId: string,
): Promise<FeedingTask> {
  return feedingTaskSchema.parse(
    await apiRequest<unknown>(`/feeding-tasks/${taskId}/completion`, {
      method: 'DELETE',
    }),
  );
}
