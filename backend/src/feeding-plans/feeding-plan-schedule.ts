import type { FeedingPlanStatus } from './feeding-plan.types';

export const FEEDING_PERIOD_START_HOURS = {
  morning: 6,
  afternoon: 12,
  evening: 18,
} as const;

export type FeedingPeriod = keyof typeof FEEDING_PERIOD_START_HOURS;

export interface FeedingPlanTiming {
  status: FeedingPlanStatus;
  minutesPastDue: number | null;
}

export function getFeedingPlanTiming(
  dueAt: Date,
  now: Date,
): FeedingPlanTiming {
  if (now < dueAt) {
    return { status: 'upcoming', minutesPastDue: null };
  }

  return {
    status: 'due',
    minutesPastDue: Math.floor((now.getTime() - dueAt.getTime()) / 60_000),
  };
}

export function parseTimestamp(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid timestamp');
  }
  return date;
}

export function zonedDateTimeToUtc(
  dateOnly: string,
  hour: number,
  timeZone: string,
  minute = 0,
  second = 0,
): Date {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
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

export function getZonedParts(value: Date, timeZone: string) {
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
