import type { FeedingPeriod, FeedingPlan } from './feeding-plan-api';
import { formatDateOnlyForUi } from '../../shared/date/date-format';

export function formatFeedingPeriod(period: FeedingPeriod): string {
  return `${period.charAt(0).toUpperCase()}${period.slice(1)}`;
}

export function formatRecurrence(days: number): string {
  return days === 1 ? 'Every day' : `Every ${days} days`;
}

export function formatFeedingDate(dateOnly: string): string {
  return formatDateOnlyForUi(dateOnly);
}

export function formatPlanStatus(
  plan: Pick<FeedingPlan, 'status' | 'minutesPastDue'>,
): string {
  if (plan.status === 'upcoming') {
    return 'Upcoming';
  }

  const minutes = plan.minutesPastDue ?? 0;
  if (minutes < 1) {
    return 'Due now';
  }
  if (minutes < 60) {
    return `Due for ${minutes} min`;
  }
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `Due for ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  const days = Math.floor(minutes / 1440);
  return `Due for ${days} ${days === 1 ? 'day' : 'days'}`;
}
