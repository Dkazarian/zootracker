const UI_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

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
