import type { ReactNode } from 'react';

interface FeedingPlanCardSummaryProps {
  label: ReactNode;
  title: ReactNode;
  status: ReactNode;
  archived?: boolean;
  statusClassName?: string;
}

function FeedingPlanCardSummary({
  label,
  title,
  status,
  archived = false,
  statusClassName = 'feeding-status',
}: FeedingPlanCardSummaryProps) {
  return (
    <div
      className={`feeding-plan-card-summary${
        archived ? ' feeding-plan-card-summary--archived' : ''
      }`}
    >
      <div>
        <p className="card-label">{label}</p>
        <h3 className="feeding-plan-card-summary__title">{title}</h3>
      </div>
      <span className={`feeding-plan-card-summary__status ${statusClassName}`}>
        {status}
      </span>
    </div>
  );
}

export default FeedingPlanCardSummary;
