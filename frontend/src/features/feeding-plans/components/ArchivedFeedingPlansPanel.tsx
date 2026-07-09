import type { FeedingPlan } from '../feeding-plan-api';
import FeedingPlanCard from './FeedingPlanCard';

interface ArchivedFeedingPlansPanelProps {
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  plans: FeedingPlan[] | undefined;
  onRetry(): void;
}

function ArchivedFeedingPlansPanel({
  isPending,
  isError,
  errorMessage,
  plans,
  onRetry,
}: ArchivedFeedingPlansPanelProps) {
  const hasPlans = plans && plans.length > 0;

  return (
    <section
      id="feeding-plan-history"
      aria-labelledby="feeding-plan-history-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Preserved versions</p>
          <h3 id="feeding-plan-history-title">Plan history</h3>
        </div>
      </div>
      {isPending && (
        <p className="page-state" aria-live="polite">
          Loading archived plans...
        </p>
      )}
      {isError && (
        <div className="page-state page-state--error" role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={onRetry}>
            Try loading archived plans again
          </button>
        </div>
      )}
      {plans && plans.length === 0 && (
        <p className="page-state">No archived feeding plans.</p>
      )}
      {hasPlans && (
        <ul className="feeding-plan-list">
          {plans.map((plan) => (
            <FeedingPlanCard key={plan.id} plan={plan} archived />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ArchivedFeedingPlansPanel;
