import type { ReactNode } from 'react';

interface FeedingPlanCardSummaryProps {
  label: ReactNode;
  title: ReactNode;
  status: ReactNode;
  headingLevel?: 3 | 4;
  statusClassName?: string;
}

function FeedingPlanCardSummary({
  label,
  title,
  status,
  headingLevel = 3,
  statusClassName = 'feeding-status',
}: FeedingPlanCardSummaryProps) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';

  return (
    <div className="feeding-plan-summary">
      <div>
        <p className="card-label">{label}</p>
        <Heading>{title}</Heading>
      </div>
      <span className={statusClassName}>{status}</span>
    </div>
  );
}

export default FeedingPlanCardSummary;
