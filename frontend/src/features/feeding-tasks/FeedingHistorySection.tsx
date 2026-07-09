import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  formatFeedingDate,
  formatFeedingTimeHint,
} from '../feeding-plans/feeding-plan-format';
import FeedingPlanCardSummary from '../feeding-plans/components/FeedingPlanCardSummary';
import {
  feedingTaskHistoryQueryKey,
  listCompletedFeedingTasks,
  undoFeedingTaskCompletion,
  updateFeedingTaskCompletion,
  type FeedingTask,
  type FeedingTaskCompletionInput,
} from './feeding-task-api';
import { formatFeedingTaskDateTime } from './feeding-task-format';
import FeedingTaskCompletionForm from './FeedingTaskCompletionForm';

interface Props {
  animalId: string;
  canUndoCompletions: boolean;
  plansQueryKey: readonly unknown[];
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : 'The feeding request failed.';

function FeedingHistorySection({
  animalId,
  canUndoCompletions,
  plansQueryKey,
}: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FeedingTask | null>(null);
  const [undoTarget, setUndoTarget] = useState<FeedingTask | null>(null);
  const query = useQuery({
    queryKey: feedingTaskHistoryQueryKey(animalId),
    queryFn: () => listCompletedFeedingTasks(animalId),
    enabled: open,
  });
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: feedingTaskHistoryQueryKey(animalId),
      }),
      queryClient.invalidateQueries({ queryKey: plansQueryKey }),
    ]);
  };
  const updateMutation = useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: FeedingTaskCompletionInput;
    }) => updateFeedingTaskCompletion(taskId, input),
    onSuccess: async () => {
      setEditTarget(null);
      await refresh();
    },
  });
  const undoMutation = useMutation({
    mutationFn: undoFeedingTaskCompletion,
    onSuccess: async () => {
      setUndoTarget(null);
      await refresh();
    },
  });

  return (
    <section
      className="feeding-history"
      aria-labelledby="feeding-history-title"
    >
      <div className="section-heading">
        <h2 id="feeding-history-title">Feeding history</h2>
        <button
          className="button-secondary"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide feeding history' : 'Show feeding history'}
        </button>
      </div>
      {open && query.isPending && (
        <p className="page-state">Loading history...</p>
      )}
      {open && query.isError && (
        <p className="page-state page-state--error" role="alert">
          {message(query.error)}
        </p>
      )}
      {open && query.isSuccess && query.data.length === 0 && (
        <p className="page-state">No completed feedings yet.</p>
      )}
      {open && query.isSuccess && query.data.length > 0 && (
        <ul className="feeding-plan-list">
          {query.data.map((task) => (
            <li className="feeding-plan-card" key={task.id}>
              <FeedingPlanCardSummary
                label={formatFeedingTimeHint(task.scheduledDueAt)}
                title={task.plan.name}
                status="Completed"
              />
              <p>{task.plan.instructions}</p>
              <dl className="feeding-plan-details">
                <div>
                  <dt>Scheduled</dt>
                  <dd>{formatFeedingDate(task.scheduledDueAt)}</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>
                    {task.completedAt
                      ? formatFeedingTaskDateTime(task.completedAt)
                      : 'Not recorded'}
                  </dd>
                </div>
              </dl>
              <p>{task.notes || 'No notes.'}</p>
              <p className="feeding-plan-accountability">
                Completed by {task.completedBy?.name ?? 'Unknown'} · Last
                changed by {task.lastModifiedBy.name}
              </p>
              {editTarget?.id === task.id ? (
                <FeedingTaskCompletionForm
                  initialCompletedAt={task.completedAt ?? new Date()}
                  initialNotes={task.notes}
                  submitting={updateMutation.isPending}
                  submitLabel="Save correction"
                  serverError={
                    updateMutation.isError
                      ? message(updateMutation.error)
                      : undefined
                  }
                  onCancel={() => setEditTarget(null)}
                  onSave={(input) =>
                    updateMutation.mutate({ taskId: task.id, input })
                  }
                />
              ) : (
                <div className="profile-actions">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => setEditTarget(task)}
                  >
                    Correct feeding
                  </button>
                  {canUndoCompletions && (
                    <button
                      className="button-danger"
                      type="button"
                      onClick={() => setUndoTarget(task)}
                    >
                      Undo completion
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {undoTarget && (
        <section className="archive-confirmation" role="alertdialog">
          <div>
            <h3>Undo {undoTarget.plan.name}?</h3>
            <p>The scheduled feeding will become available again.</p>
          </div>
          <div className="profile-actions">
            <button
              className="button-danger"
              type="button"
              disabled={undoMutation.isPending}
              onClick={() => undoMutation.mutate(undoTarget.id)}
            >
              {undoMutation.isPending ? 'Undoing...' : 'Undo completion'}
            </button>
            <button
              className="button-secondary"
              type="button"
              disabled={undoMutation.isPending}
              onClick={() => setUndoTarget(null)}
            >
              Cancel
            </button>
          </div>
          {undoMutation.isError && (
            <p className="form-error" role="alert">
              {message(undoMutation.error)}
            </p>
          )}
        </section>
      )}
    </section>
  );
}

export default FeedingHistorySection;
