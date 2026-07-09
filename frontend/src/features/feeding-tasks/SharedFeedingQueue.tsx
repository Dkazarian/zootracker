import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { CurrentUser } from '../../shared/api/current-user';
import { formatFeedingDate } from '../feeding-plans/feeding-plan-format';
import FeedingTaskCompletionForm from './FeedingTaskCompletionForm';
import {
  claimFeedingTask,
  completeFeedingTask,
  feedingTaskQueueQueryKey,
  listOpenFeedingTasks,
  releaseFeedingTaskClaim,
  type FeedingTask,
  type FeedingTaskCompletionInput,
  type FeedingTaskQueueAvailability,
  type FeedingTaskQueueDue,
  type FeedingTaskQueueFilters,
} from './feeding-task-api';
import { formatFeedingTaskDateTime } from './feeding-task-format';

interface SharedFeedingQueueProps {
  currentUser: CurrentUser;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The feeding task request could not be completed.';
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

function shouldWarnBeforeCompletion(
  task: FeedingTask,
  currentUser: CurrentUser,
): boolean {
  return Boolean(task.claimedBy && task.claimedBy.id !== currentUser.id);
}

function taskTiming(task: FeedingTask): 'due' | 'upcoming' {
  return task.scheduledDueAt <= new Date() ? 'due' : 'upcoming';
}

function SharedFeedingQueue({ currentUser }: SharedFeedingQueueProps) {
  const queryClient = useQueryClient();
  const [availability, setAvailability] =
    useState<FeedingTaskQueueAvailability>('all');
  const [due, setDue] = useState<FeedingTaskQueueDue>('all');
  const [completionTarget, setCompletionTarget] = useState<FeedingTask | null>(
    null,
  );

  const filters = useMemo<FeedingTaskQueueFilters>(
    () => ({ availability, due, limit: 3 }),
    [availability, due],
  );
  const queueQueryKey = feedingTaskQueueQueryKey(filters);
  const queueQuery = useQuery({
    queryKey: queueQueryKey,
    queryFn: () => listOpenFeedingTasks(filters),
  });

  const refreshQueue = async () => {
    await queryClient.invalidateQueries({ queryKey: ['feeding-tasks'] });
  };

  const claimMutation = useMutation({
    mutationFn: (taskId: string) => claimFeedingTask(taskId),
    onSuccess: refreshQueue,
  });
  const releaseMutation = useMutation({
    mutationFn: (taskId: string) => releaseFeedingTaskClaim(taskId),
    onSuccess: refreshQueue,
  });
  const completeMutation = useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: FeedingTaskCompletionInput;
    }) => completeFeedingTask(taskId, input),
    onSuccess: async () => {
      setCompletionTarget(null);
      await refreshQueue();
    },
  });

  const openCompletion = (task: FeedingTask) => {
    if (
      shouldWarnBeforeCompletion(task, currentUser) &&
      !window.confirm(
        `${task.claimedBy!.name} already claimed this feeding. Record it anyway?`,
      )
    ) {
      return;
    }

    setCompletionTarget(task);
  };

  return (
    <section className="feeding-queue" aria-labelledby="feeding-queue-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shared work queue</p>
          <h2 id="feeding-queue-title">Next feedings</h2>
        </div>
      </div>

      <div className="feeding-queue-filters">
        <div className="form-field">
          <label htmlFor="feeding-queue-availability">Availability</label>
          <select
            id="feeding-queue-availability"
            value={availability}
            onChange={(event) =>
              setAvailability(
                event.target.value as FeedingTaskQueueAvailability,
              )
            }
          >
            <option value="all">All open</option>
            <option value="unclaimed">Available only</option>
            <option value="claimed">Claimed only</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="feeding-queue-due">Timing</label>
          <select
            id="feeding-queue-due"
            value={due}
            onChange={(event) =>
              setDue(event.target.value as FeedingTaskQueueDue)
            }
          >
            <option value="all">All timing</option>
            <option value="due">Due now</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {queueQuery.isPending && (
        <p className="page-state" aria-live="polite">
          Loading feeding queue...
        </p>
      )}

      {queueQuery.isError && (
        <div className="page-state page-state--error" role="alert">
          <p>{getErrorMessage(queueQuery.error)}</p>
          <button type="button" onClick={() => void queueQuery.refetch()}>
            Try again
          </button>
        </div>
      )}

      {queueQuery.isSuccess && queueQuery.data.length === 0 && (
        <p className="page-state">No open feedings match these filters.</p>
      )}

      {queueQuery.isSuccess && queueQuery.data.length > 0 && (
        <ul className="feeding-queue-list">
          {queueQuery.data.map((task) => (
            <li className="feeding-plan-card" key={task.id}>
              <div className="feeding-plan-summary">
                <div>
                  <p className="card-label">{task.plan.animalName}</p>
                  <h3>{task.plan.name}</h3>
                </div>
                <span
                  className={`feeding-status feeding-status--${taskTiming(
                    task,
                  )}`}
                >
                  {taskTiming(task) === 'due' ? 'Due' : 'Upcoming'} ·{' '}
                  {formatFeedingDate(task.scheduledDueAt)}
                </span>
              </div>
              <p className="feeding-plan-instructions">
                {task.plan.instructions}
              </p>
              <p className="feeding-plan-accountability">
                {claimedLabel(task, currentUser)}
              </p>
              <div className="form-actions">
                {task.claimedBy?.id === currentUser.id ? (
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={releaseMutation.isPending}
                    onClick={() => releaseMutation.mutate(task.id)}
                  >
                    Release claim
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={
                      claimMutation.isPending || Boolean(task.claimedBy)
                    }
                    onClick={() => claimMutation.mutate(task.id)}
                  >
                    Claim
                  </button>
                )}
                <button type="button" onClick={() => openCompletion(task)}>
                  Record feeding
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(claimMutation.isError ||
        releaseMutation.isError ||
        completeMutation.isError) && (
        <p className="form-error" role="alert">
          {getErrorMessage(
            claimMutation.error ??
              releaseMutation.error ??
              completeMutation.error,
          )}
        </p>
      )}

      {completionTarget && (
        <section className="feeding-plan-form-card">
          <h3>Complete {completionTarget.plan.name}</h3>
          <p>{completionTarget.plan.instructions}</p>
          <FeedingTaskCompletionForm
            submitting={completeMutation.isPending}
            submitLabel="Record feeding"
            serverError={
              completeMutation.isError
                ? getErrorMessage(completeMutation.error)
                : undefined
            }
            onCancel={() => {
              completeMutation.reset();
              setCompletionTarget(null);
            }}
            onSave={(input) =>
              completeMutation.mutate({ taskId: completionTarget.id, input })
            }
          />
        </section>
      )}
    </section>
  );
}

export default SharedFeedingQueue;
