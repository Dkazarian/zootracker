import type { ReactNode } from 'react';
import type { FeedingPlan } from '../feeding-plan-api';
import {
  formatFeedingDate,
  formatFeedingTimeHint,
  formatPlanStatus,
  formatRecurrence,
} from '../feeding-plan-format';
import FeedingPlanCardSummary from './FeedingPlanCardSummary';

interface FeedingPlanCardProps {
  plan: FeedingPlan;
  archived?: boolean;
  actions?: ReactNode;
}

function FeedingPlanCard({
  plan,
  archived = false,
  actions,
}: FeedingPlanCardProps) {
  return (
    <li className="feeding-plan-card" id={`feeding-plan-${plan.id}`}>
      <FeedingPlanCardSummary
        label={
          archived
            ? 'Archived'
            : plan.currentTask
              ? formatFeedingTimeHint(plan.currentTask.scheduledDueAt)
              : 'Scheduled'
        }
        title={plan.name}
        status={archived ? 'Archived' : formatPlanStatus(plan)}
        headingLevel={archived ? 4 : 3}
        statusClassName={
          archived
            ? 'feeding-status'
            : `feeding-status feeding-status--${plan.status}`
        }
      />
      <p className="feeding-plan-instructions">{plan.instructions}</p>
      <dl className="feeding-plan-details">
        <div>
          <dt>Schedule</dt>
          <dd>{formatRecurrence(plan.repeatEveryDays)}</dd>
        </div>
        {!archived && (
          <div>
            <dt>Next feeding</dt>
            <dd>
              {plan.currentTask
                ? `${formatFeedingDate(
                    plan.currentTask.scheduledDueAt,
                  )} · ${formatFeedingTimeHint(plan.currentTask.scheduledDueAt)}`
                : 'Not scheduled'}
            </dd>
          </div>
        )}
      </dl>
      <p className="feeding-plan-accountability">
        Created by {plan.createdBy.name} · Last changed by{' '}
        {plan.lastModifiedBy.name}
      </p>
      {actions}
    </li>
  );
}

export default FeedingPlanCard;
