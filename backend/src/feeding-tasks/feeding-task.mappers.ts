import { formatDateOnly } from '../feeding-plans/feeding-plan-schedule';
import type {
  FeedingTaskRecord,
  FeedingTaskResponse,
} from './feeding-task.types';

export function toFeedingTaskResponse(
  task: FeedingTaskRecord,
): FeedingTaskResponse {
  return {
    id: task.id,
    feedingPlanId: task.feedingPlanId,
    scheduledDueDate: formatDateOnly(task.scheduledDueDate),
    status: task.status,
    completedBy: task.completedBy,
    completedAt: task.completedAt,
    notes: task.notes,
    lastModifiedBy: task.lastModifiedBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    plan: {
      id: task.feedingPlan.id,
      animalId: task.feedingPlan.animalId,
      name: task.feedingPlan.name,
      instructions: task.feedingPlan.instructions,
      period: task.feedingPlan.period,
      repeatEveryDays: task.feedingPlan.repeatEveryDays,
      archivedAt: task.feedingPlan.archivedAt,
    },
  };
}
