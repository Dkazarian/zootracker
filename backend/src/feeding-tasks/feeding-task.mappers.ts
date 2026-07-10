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
    scheduledDueAt: task.scheduledDueAt,
    status: task.status,
    claimedBy: task.claimedBy,
    claimedAt: task.claimedAt,
    completedBy: task.completedBy,
    completedAt: task.completedAt,
    notes: task.notes,
    lastModifiedBy: task.lastModifiedBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    plan: {
      id: task.feedingPlan.id,
      animalId: task.feedingPlan.animalId,
      animalName: task.feedingPlan.animal.name,
      name: task.feedingPlan.name,
      instructions: task.feedingPlan.instructions,
      repeatEveryDays: task.feedingPlan.repeatEveryDays,
      archivedAt: task.feedingPlan.archivedAt,
    },
  };
}
