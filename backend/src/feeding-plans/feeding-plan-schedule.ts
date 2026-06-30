import type { FeedingPeriod } from '../generated/prisma/client';
import type { FeedingPlanStatus } from './feeding-plan.types';

export const FEEDING_PERIOD_START_HOURS: Record<FeedingPeriod, number> = {
  morning: 6,
  afternoon: 12,
  evening: 18,
};

export interface FeedingPlanTiming {
  status: FeedingPlanStatus;
  minutesPastDue: number | null;
}

export function getFeedingPlanTiming(
  nextDueDate: Date,
  period: FeedingPeriod,
  now: Date,
  timeZone: string,
): FeedingPlanTiming {
  const dueAt = zonedDateTimeToUtc(
    formatDateOnly(nextDueDate),
    FEEDING_PERIOD_START_HOURS[period],
    timeZone,
  );

  if (now < dueAt) {
    return { status: 'upcoming', minutesPastDue: null };
  }

  return {
    status: 'due',
    minutesPastDue: Math.floor((now.getTime() - dueAt.getTime()) / 60_000),
  };
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || formatDateOnly(date) !== value) {
    throw new Error('Invalid calendar date');
  }
  return date;
}

function zonedDateTimeToUtc(
  dateOnly: string,
  hour: number,
  timeZone: string,
): Date {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour);
  let result = new Date(utcGuess);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = getZonedParts(result, timeZone);
    const representedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    result = new Date(result.getTime() + (utcGuess - representedAsUtc));
  }

  return result;
}

function getZonedParts(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value);
  const numberPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: numberPart('year'),
    month: numberPart('month'),
    day: numberPart('day'),
    hour: numberPart('hour'),
    minute: numberPart('minute'),
    second: numberPart('second'),
  };
}
