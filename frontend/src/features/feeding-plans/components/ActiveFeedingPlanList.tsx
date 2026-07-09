import type { FeedingPlan } from '../feeding-plan-api';
import FeedingPlanCard from './FeedingPlanCard';

interface ActiveFeedingPlanListProps {
  plans: FeedingPlan[];
  canManage: boolean;
  onRecordFeeding(plan: FeedingPlan): void;
  onArchive(plan: FeedingPlan): void;
}

function ActiveFeedingPlanList({
  plans,
  canManage,
  onRecordFeeding,
  onArchive,
}: ActiveFeedingPlanListProps) {
  return (
    <ul className="feeding-plan-list">
      {plans.map((plan) => (
        <FeedingPlanCard
          key={plan.id}
          plan={plan}
          actions={
            canManage ? (
              <div className="profile-actions">
                {plan.currentTask && (
                  <button type="button" onClick={() => onRecordFeeding(plan)}>
                    Record feeding
                  </button>
                )}
                <button
                  className="button-danger"
                  type="button"
                  onClick={() => onArchive(plan)}
                >
                  Archive {plan.name}
                </button>
              </div>
            ) : null
          }
        />
      ))}
    </ul>
  );
}

export default ActiveFeedingPlanList;
