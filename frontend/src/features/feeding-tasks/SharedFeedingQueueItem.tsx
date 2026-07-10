import type { CurrentUser } from '../../shared/api/current-user';
import { formatFeedingDate } from '../feeding-plans/feeding-plan-format';
import FeedingPlanCardSummary from '../feeding-plans/components/FeedingPlanCardSummary';
import type { FeedingTask } from './feeding-task-api';
import { formatFeedingTaskDateTime } from './feeding-task-format';

interface SharedFeedingQueueItemProps {
  task: FeedingTask;
  currentUser: CurrentUser;
  isClaimPending: boolean;
  isReleasePending: boolean;
  onClaim: (taskId: string) => void;
  onRelease: (taskId: string) => void;
  onRecordFeeding: (task: FeedingTask) => void;
}

function claimedLabel(task: FeedingTask, currentUser: CurrentUser): string {
  if (!task.claimedBy) return 'Available';

  const name =
    task.claimedBy.id === currentUser.id ? 'You' : task.claimedBy.name;
  const time = task.claimedAt
    ? ` at ${formatFeedingTaskDateTime(task.claimedAt)}`
    : '';

  return `${name} claimed this${time}`;
}

function taskTiming(task: FeedingTask): 'due' | 'upcoming' {
  return task.scheduledDueAt <= new Date() ? 'due' : 'upcoming';
}

function SharedFeedingQueueItem({
  task,
  currentUser,
  isClaimPending,
  isReleasePending,
  onClaim,
  onRelease,
  onRecordFeeding,
}: SharedFeedingQueueItemProps) {
  return (
    <li className="feeding-plan-card" key={task.id}>
      <FeedingPlanCardSummary
        label={task.plan.animalName}
        title={task.plan.name}
        status={`${taskTiming(task) === 'due' ? 'Due' : 'Upcoming'} · ${formatFeedingDate(task.scheduledDueAt)}`}
        statusClassName={`feeding-status feeding-status--${taskTiming(task)}`}
      />
      <p className="feeding-plan-instructions">{task.plan.instructions}</p>
      <p className="feeding-plan-accountability">
        {claimedLabel(task, currentUser)}
      </p>
      <div className="form-actions">
        {task.claimedBy?.id === currentUser.id ? (
          <button
            className="button-secondary"
            type="button"
            disabled={isReleasePending}
            onClick={() => onRelease(task.id)}
          >
            Release claim
          </button>
        ) : (
          <button
            type="button"
            disabled={isClaimPending || Boolean(task.claimedBy)}
            onClick={() => onClaim(task.id)}
          >
            Claim
          </button>
        )}
        <button type="button" onClick={() => onRecordFeeding(task)}>
          Record feeding
        </button>
      </div>
    </li>
  );
}

export default SharedFeedingQueueItem;
