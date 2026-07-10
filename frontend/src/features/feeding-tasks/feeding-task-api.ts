import { z } from 'zod';
import { apiRequest } from '../../shared/api/http';

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const feedingTaskSchema = z.object({
  id: z.string().min(1),
  feedingPlanId: z.string().min(1),
  scheduledDueAt: z.coerce.date(),
  status: z.enum(['AVAILABLE', 'COMPLETED']),
  claimedBy: personSchema.nullable(),
  claimedAt: z.coerce.date().nullable(),
  completedBy: personSchema.nullable(),
  completedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  lastModifiedBy: personSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  plan: z.object({
    id: z.string().min(1),
    animalId: z.string().min(1),
    animalName: z.string().min(1),
    name: z.string().min(1),
    instructions: z.string().min(1),
    repeatEveryDays: z.number().int().positive(),
    archivedAt: z.coerce.date().nullable(),
  }),
});

export type FeedingTask = z.infer<typeof feedingTaskSchema>;

export type FeedingTaskQueueAvailability = 'all' | 'unclaimed' | 'claimed';
export type FeedingTaskQueueDue = 'all' | 'due' | 'upcoming';

export interface FeedingTaskQueueFilters {
  availability?: FeedingTaskQueueAvailability;
  due?: FeedingTaskQueueDue;
  limit?: number;
}

export interface FeedingTaskCompletionInput {
  completedAt: string;
  notes?: string;
}

export const feedingTaskHistoryQueryKey = (animalId: string) =>
  ['animals', animalId, 'feeding-tasks', 'completed'] as const;
export const feedingTaskQueueQueryKey = (filters: FeedingTaskQueueFilters) =>
  ['feeding-tasks', 'queue', filters] as const;

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

export async function listOpenFeedingTasks(
  filters: FeedingTaskQueueFilters,
): Promise<FeedingTask[]> {
  const searchParams = new URLSearchParams();

  if (filters.availability) {
    searchParams.set('availability', filters.availability);
  }

  if (filters.due) {
    searchParams.set('due', filters.due);
  }

  if (filters.limit) {
    searchParams.set('limit', String(filters.limit));
  }

  const query = searchParams.toString();
  return z
    .array(feedingTaskSchema)
    .parse(
      await apiRequest<unknown>(
        `/feeding-tasks/queue${query ? `?${query}` : ''}`,
      ),
    );
}

export async function claimFeedingTask(taskId: string): Promise<FeedingTask> {
  return feedingTaskSchema.parse(
    await apiRequest<unknown>(`/feeding-tasks/${taskId}/claim`, {
      method: 'POST',
    }),
  );
}

export async function releaseFeedingTaskClaim(
  taskId: string,
): Promise<FeedingTask> {
  return feedingTaskSchema.parse(
    await apiRequest<unknown>(`/feeding-tasks/${taskId}/claim`, {
      method: 'DELETE',
    }),
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
