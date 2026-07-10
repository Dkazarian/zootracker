import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { CurrentUser } from '../../shared/api/current-user';
import FormError from '../../shared/components/form/FormError';
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
import FeedingTasksQueueItem from './components/FeedingTasksQueueItem';

interface FeedingTasksQueueProps {
  currentUser: CurrentUser;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The feeding task request could not be completed.';
}

function shouldWarnBeforeCompletion(
  task: FeedingTask,
  currentUser: CurrentUser,
): boolean {
  return Boolean(task.claimedBy && task.claimedBy.id !== currentUser.id);
}

function FeedingTasksQueue({ currentUser }: FeedingTasksQueueProps) {
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
          <FormError>{getErrorMessage(queueQuery.error)}</FormError>
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
            <FeedingTasksQueueItem
              key={task.id}
              task={task}
              currentUser={currentUser}
              isClaimPending={claimMutation.isPending}
              isReleasePending={releaseMutation.isPending}
              onClaim={claimMutation.mutate}
              onRelease={releaseMutation.mutate}
              onRecordFeeding={openCompletion}
            />
          ))}
        </ul>
      )}

      {(claimMutation.isError ||
        releaseMutation.isError ||
        completeMutation.isError) && (
        <FormError>
          {getErrorMessage(
            claimMutation.error ??
              releaseMutation.error ??
              completeMutation.error,
          )}
        </FormError>
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

export default FeedingTasksQueue;
