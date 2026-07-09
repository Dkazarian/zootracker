const UI_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DEFAULT_ZOO_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export const ZOO_TIME_ZONE =
  import.meta.env.VITE_ZOO_TIME_ZONE ?? DEFAULT_ZOO_TIME_ZONE;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}

function isValidDate(year: number, month: number, day: number): boolean {
  const candidate = new Date(0);
  candidate.setUTCHours(0, 0, 0, 0);
  candidate.setUTCFullYear(year, month - 1, day);
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function formatDateForUi(date: Date | null): string {
  if (!date) return 'Not recorded';
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${String(
    date.getUTCFullYear(),
  ).padStart(4, '0')}`;
}

export function formatDateOnlyForUi(dateOnly: string): string {
  const match = ISO_DATE_PATTERN.exec(dateOnly);
  if (!match) return dateOnly;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatTimestampDateForUi(
  value: Date | string,
  timeZone = ZOO_TIME_ZONE,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}/${part('month')}/${part('year')}`;
}

export function formatDateForInput(date: Date | null): string {
  return date ? formatDateForUi(date) : '';
}

export function parseUiDate(value: string): string | null {
  const match = UI_DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  return isValidDate(year, month, day) ? toIsoDate(year, month, day) : null;
}

export function zonedDateTimeToIsoTimestamp(
  dateOnly: string,
  hour: number,
  timeZone = ZOO_TIME_ZONE,
): string {
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

  return result.toISOString();
}

export function getZonedHour(
  value: Date | string,
  timeZone = ZOO_TIME_ZONE,
): number | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return getZonedParts(date, timeZone).hour;
}

export function getTodayDateOnly(now = new Date()): string {
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function getTomorrowUiDate(now = new Date()): string {
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return `${pad(tomorrow.getDate())}/${pad(
    tomorrow.getMonth() + 1,
  )}/${String(tomorrow.getFullYear()).padStart(4, '0')}`;
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
