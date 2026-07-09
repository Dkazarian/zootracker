import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import FeedingHistorySection from '../feeding-tasks/FeedingHistorySection';
import {
  completeFeedingTask,
  feedingTaskHistoryQueryKey,
  type FeedingTaskCompletionInput,
} from '../feeding-tasks/feeding-task-api';
import {
  archiveFeedingPlan,
  createFeedingPlan,
  feedingPlanHistoryQueryKey,
  feedingPlanQueryKey,
  listFeedingPlanHistory,
  listFeedingPlans,
  type FeedingPlan,
  type FeedingPlanInput,
} from './feeding-plan-api';
import ActiveFeedingPlanList from './components/ActiveFeedingPlanList';
import ArchivedFeedingPlansPanel from './components/ArchivedFeedingPlansPanel';
import FeedingPlanArchiveConfirmation from './components/FeedingPlanArchiveConfirmation';
import FeedingTaskCompletionPanel from './components/FeedingTaskCompletionPanel';
import NewFeedingPlanPanel from './components/NewFeedingPlanPanel';

interface FeedingPlansSectionProps {
  animalId: string;
  canManage: boolean;
  canUndoCompletions: boolean;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The feeding plan request could not be completed.';
}

function FeedingPlansSection({
  animalId,
  canManage,
  canUndoCompletions,
}: FeedingPlansSectionProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<FeedingPlan | null>(null);
  const [completionTarget, setCompletionTarget] = useState<FeedingPlan | null>(
    null,
  );
  const plansQuery = useQuery({
    queryKey: feedingPlanQueryKey(animalId),
    queryFn: () => listFeedingPlans(animalId),
  });
  const historyQuery = useQuery({
    queryKey: feedingPlanHistoryQueryKey(animalId),
    queryFn: () => listFeedingPlanHistory(animalId),
    enabled: showHistory,
  });
  const refreshPlans = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: feedingPlanQueryKey(animalId),
      }),
      queryClient.invalidateQueries({
        queryKey: feedingPlanHistoryQueryKey(animalId),
      }),
      queryClient.invalidateQueries({
        queryKey: feedingTaskHistoryQueryKey(animalId),
      }),
    ]);
  };
  const createMutation = useMutation({
    mutationFn: (input: FeedingPlanInput) => createFeedingPlan(animalId, input),
    onSuccess: async () => {
      setFormOpen(false);
      await refreshPlans();
    },
  });
  const archiveMutation = useMutation({
    mutationFn: (planId: string) => archiveFeedingPlan(animalId, planId),
    onSuccess: async () => {
      setArchiveTarget(null);
      await refreshPlans();
    },
  });
  const completionMutation = useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: FeedingTaskCompletionInput;
    }) => completeFeedingTask(taskId, input),
    onSuccess: async () => {
      setCompletionTarget(null);
      await refreshPlans();
    },
  });
  const savePlan = (input: FeedingPlanInput) => {
    createMutation.mutate(input);
  };

  return (
    <section className="feeding-plans" aria-labelledby="feeding-plans-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Routine care</p>
          <h2 id="feeding-plans-title">Feeding plans</h2>
        </div>
        {canManage && !formOpen && (
          <button type="button" onClick={() => setFormOpen(true)}>
            Add feeding plan
          </button>
        )}
      </div>

      {formOpen && (
        <NewFeedingPlanPanel
          submitting={createMutation.isPending}
          serverError={
            createMutation.isError ? getErrorMessage(createMutation.error) : ''
          }
          onCancel={() => {
            createMutation.reset();
            setFormOpen(false);
          }}
          onSave={savePlan}
        />
      )}

      {archiveTarget && (
        <FeedingPlanArchiveConfirmation
          planName={archiveTarget.name}
          submitting={archiveMutation.isPending}
          onConfirm={() => archiveMutation.mutate(archiveTarget.id)}
          onCancel={() => {
            archiveMutation.reset();
            setArchiveTarget(null);
          }}
        />
      )}

      {archiveMutation.isError && (
        <p className="form-error" role="alert">
          {getErrorMessage(archiveMutation.error)}
        </p>
      )}

      {completionTarget?.currentTask && (
        <FeedingTaskCompletionPanel
          planName={completionTarget.name}
          instructions={completionTarget.instructions}
          submitting={completionMutation.isPending}
          serverError={
            completionMutation.isError
              ? getErrorMessage(completionMutation.error)
              : undefined
          }
          onCancel={() => {
            completionMutation.reset();
            setCompletionTarget(null);
          }}
          onSave={(input) =>
            completionMutation.mutate({
              taskId: completionTarget.currentTask!.id,
              input,
            })
          }
        />
      )}

      {plansQuery.isPending && (
        <p className="page-state" aria-live="polite">
          Loading feeding plans...
        </p>
      )}

      {plansQuery.isError && (
        <div className="page-state page-state--error" role="alert">
          <p>{getErrorMessage(plansQuery.error)}</p>
          <button type="button" onClick={() => void plansQuery.refetch()}>
            Try again
          </button>
        </div>
      )}

      {plansQuery.isSuccess && plansQuery.data.length === 0 && (
        <p className="page-state">No active feeding plans yet.</p>
      )}

      {plansQuery.isSuccess && plansQuery.data.length > 0 && (
        <ActiveFeedingPlanList
          plans={plansQuery.data}
          canManage={canManage}
          onRecordFeeding={setCompletionTarget}
          onArchive={setArchiveTarget}
        />
      )}

      {plansQuery.isSuccess && (
        <button
          className="button-secondary"
          type="button"
          aria-expanded={showHistory}
          aria-controls="feeding-plan-history"
          onClick={() => setShowHistory((visible) => !visible)}
        >
          {showHistory ? 'Hide archived plans' : 'Show archived plans'}
        </button>
      )}

      {showHistory && (
        <ArchivedFeedingPlansPanel
          isPending={historyQuery.isPending}
          isError={historyQuery.isError}
          errorMessage={
            historyQuery.isError ? getErrorMessage(historyQuery.error) : ''
          }
          plans={historyQuery.data}
          onRetry={() => void historyQuery.refetch()}
        />
      )}

      <FeedingHistorySection
        animalId={animalId}
        canUndoCompletions={canUndoCompletions}
        plansQueryKey={feedingPlanQueryKey(animalId)}
      />
    </section>
  );
}

export default FeedingPlansSection;
