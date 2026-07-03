import type { FeedingPeriod } from '../generated/prisma/client';
import {
  getFeedingPlanTiming,
  type FeedingPlanTiming,
} from '../feeding-plans/feeding-plan-schedule';

export function getNextScheduledDueDate(
  scheduledDueDate: Date,
  repeatEveryDays: number,
  period: FeedingPeriod,
  completedAt: Date,
  timeZone: string,
): Date {
  let nextDate = addCalendarDays(scheduledDueDate, repeatEveryDays);

  while (isDue(nextDate, period, completedAt, timeZone)) {
    nextDate = addCalendarDays(nextDate, repeatEveryDays);
  }

  return nextDate;
}

function isDue(
  date: Date,
  period: FeedingPeriod,
  completedAt: Date,
  timeZone: string,
): boolean {
  const timing: FeedingPlanTiming = getFeedingPlanTiming(
    date,
    period,
    completedAt,
    timeZone,
  );
  return timing.status === 'due';
}

function addCalendarDays(value: Date, days: number): Date {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
