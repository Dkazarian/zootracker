import type { FeedingPeriod, FeedingPlan } from './feeding-plan-api';
import {
  formatTimestampDateForUi,
  getZonedHour,
} from '../../shared/date/date-format';

const FEEDING_PERIOD_BY_HOUR: Record<number, FeedingPeriod> = {
  6: 'morning',
  12: 'afternoon',
  18: 'evening',
};

export function formatFeedingPeriod(period: FeedingPeriod): string {
  return `${period.charAt(0).toUpperCase()}${period.slice(1)}`;
}

export function formatRecurrence(days: number): string {
  return days === 1 ? 'Every day' : `Every ${days} days`;
}

export function formatFeedingDate(dueAt: Date): string {
  return formatTimestampDateForUi(dueAt);
}

export function formatFeedingTimeHint(dueAt: Date): string {
  const hour = getZonedHour(dueAt);
  const period = hour === null ? null : FEEDING_PERIOD_BY_HOUR[hour];
  if (period) return formatFeedingPeriod(period);
  if (hour === null) return 'Scheduled';
  return `${String(hour).padStart(2, '0')}:00`;
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
