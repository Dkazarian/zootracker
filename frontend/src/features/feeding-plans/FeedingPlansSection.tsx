import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ApplicationRole } from '../../shared/auth/application-role';
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
import {
  formatDueDate,
  formatFeedingPeriod,
  formatPlanStatus,
  formatRecurrence,
} from './feeding-plan-format';
import FeedingPlanForm from './FeedingPlanForm';

interface FeedingPlansSectionProps {
  animalId: string;
  animalArchived: boolean;
  currentUserRole: ApplicationRole;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The feeding plan request could not be completed.';
}

function FeedingPlansSection({
  animalId,
  animalArchived,
  currentUserRole,
}: FeedingPlansSectionProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<FeedingPlan | null>(null);
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
  const canManage =
    (currentUserRole === 'keeper' || currentUserRole === 'admin') &&
    !animalArchived;

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
        <section className="feeding-plan-form-card">
          <h3>New feeding plan</h3>
          <FeedingPlanForm
            submitting={createMutation.isPending}
            serverError={
              createMutation.isError
                ? getErrorMessage(createMutation.error)
                : ''
            }
            onCancel={() => {
              createMutation.reset();
              setFormOpen(false);
            }}
            onSave={savePlan}
          />
        </section>
      )}

      {archiveTarget && (
        <section
          className="archive-confirmation"
          role="alertdialog"
          aria-labelledby="plan-archive-title"
          aria-describedby="plan-archive-description"
        >
          <div>
            <h3 id="plan-archive-title">Archive {archiveTarget.name}?</h3>
            <p id="plan-archive-description">
              It will stop appearing as active feeding work.
            </p>
          </div>
          <div className="profile-actions">
            <button
              className="button-danger"
              type="button"
              disabled={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate(archiveTarget.id)}
            >
              {archiveMutation.isPending ? 'Archiving...' : 'Archive plan'}
            </button>
            <button
              className="button-secondary"
              type="button"
              disabled={archiveMutation.isPending}
              onClick={() => {
                archiveMutation.reset();
                setArchiveTarget(null);
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {archiveMutation.isError && (
        <p className="form-error" role="alert">
          {getErrorMessage(archiveMutation.error)}
        </p>
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
        <ul className="feeding-plan-list">
          {plansQuery.data.map((plan) => (
            <li
              className="feeding-plan-card"
              id={`feeding-plan-${plan.id}`}
              key={plan.id}
            >
              <div className="feeding-plan-summary">
                <div>
                  <p className="card-label">
                    {formatFeedingPeriod(plan.period)}
                  </p>
                  <h3>{plan.name}</h3>
                </div>
                <span
                  className={`feeding-status feeding-status--${plan.status}`}
                >
                  {formatPlanStatus(plan)}
                </span>
              </div>
              <p className="feeding-plan-instructions">{plan.instructions}</p>
              <dl className="feeding-plan-details">
                <div>
                  <dt>Schedule</dt>
                  <dd>{formatRecurrence(plan.repeatEveryDays)}</dd>
                </div>
                <div>
                  <dt>Next due</dt>
                  <dd>
                    {formatDueDate(plan.nextDueDate)} ·{' '}
                    {formatFeedingPeriod(plan.period)}
                  </dd>
                </div>
              </dl>
              <p className="feeding-plan-accountability">
                Created by {plan.createdBy.name} · Last changed by{' '}
                {plan.lastModifiedBy.name}
              </p>
              {canManage && (
                <div className="profile-actions">
                  <button
                    className="button-danger"
                    type="button"
                    onClick={() => setArchiveTarget(plan)}
                  >
                    Archive {plan.name}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
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
        <div id="feeding-plan-history">
          {historyQuery.isPending && (
            <p className="page-state" aria-live="polite">
              Loading archived plans...
            </p>
          )}
          {historyQuery.isError && (
            <div className="page-state page-state--error" role="alert">
              <p>{getErrorMessage(historyQuery.error)}</p>
              <button type="button" onClick={() => void historyQuery.refetch()}>
                Try loading archived plans again
              </button>
            </div>
          )}
          {historyQuery.isSuccess && historyQuery.data.length === 0 && (
            <p className="page-state">No archived feeding plans.</p>
          )}
          {historyQuery.isSuccess && historyQuery.data.length > 0 && (
            <section aria-labelledby="feeding-plan-history-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Preserved versions</p>
                  <h3 id="feeding-plan-history-title">Plan history</h3>
                </div>
              </div>
              <ul className="feeding-plan-list">
                {historyQuery.data.map((plan) => (
                  <li
                    className="feeding-plan-card"
                    id={`feeding-plan-${plan.id}`}
                    key={plan.id}
                  >
                    <div className="feeding-plan-summary">
                      <div>
                        <p className="card-label">
                          {formatFeedingPeriod(plan.period)}
                        </p>
                        <h4>{plan.name}</h4>
                      </div>
                      <span className="feeding-status">Archived</span>
                    </div>
                    <p className="feeding-plan-instructions">
                      {plan.instructions}
                    </p>
                    <dl className="feeding-plan-details">
                      <div>
                        <dt>Schedule</dt>
                        <dd>{formatRecurrence(plan.repeatEveryDays)}</dd>
                      </div>
                      <div>
                        <dt>Last scheduled due</dt>
                        <dd>
                          {formatDueDate(plan.nextDueDate)} ·{' '}
                          {formatFeedingPeriod(plan.period)}
                        </dd>
                      </div>
                    </dl>
                    <p className="feeding-plan-accountability">
                      Created by {plan.createdBy.name} · Last changed by{' '}
                      {plan.lastModifiedBy.name}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

export default FeedingPlansSection;
