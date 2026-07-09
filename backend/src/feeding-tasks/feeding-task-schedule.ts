import {
  getZonedParts,
  zonedDateTimeToUtc,
} from '../feeding-plans/feeding-plan-schedule';

export function getNextScheduledDueAt(
  scheduledDueAt: Date,
  repeatEveryDays: number,
  completedAt: Date,
  timeZone: string,
): Date {
  let nextDueAt = addCalendarDaysInTimeZone(
    scheduledDueAt,
    repeatEveryDays,
    timeZone,
  );

  while (nextDueAt <= completedAt) {
    nextDueAt = addCalendarDaysInTimeZone(nextDueAt, repeatEveryDays, timeZone);
  }

  return nextDueAt;
}

function addCalendarDaysInTimeZone(
  value: Date,
  days: number,
  timeZone: string,
): Date {
  const parts = getZonedParts(value, timeZone);
  const nextLocalDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days),
  );
  const dateOnly = `${String(nextLocalDate.getUTCFullYear()).padStart(
    4,
    '0',
  )}-${String(nextLocalDate.getUTCMonth() + 1).padStart(2, '0')}-${String(
    nextLocalDate.getUTCDate(),
  ).padStart(2, '0')}`;

  return zonedDateTimeToUtc(
    dateOnly,
    parts.hour,
    timeZone,
    parts.minute,
    parts.second,
  );
}
