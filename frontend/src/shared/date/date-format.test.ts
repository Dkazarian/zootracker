import { describe, expect, it } from 'vitest';
import {
  formatDateForInput,
  formatDateForUi,
  formatDateOnlyForUi,
  getTodayDateOnly,
  getTomorrowUiDate,
  parseUiDate,
} from './date-format';

describe('date format helpers', () => {
  it('formats API dates as dd/mm/yyyy', () => {
    expect(formatDateForUi(new Date('2004-05-12T00:00:00.000Z'))).toBe(
      '12/05/2004',
    );
    expect(formatDateOnlyForUi('2030-07-01')).toBe('01/07/2030');
    expect(formatDateForInput(null)).toBe('');
  });

  it('parses strict valid dates to ISO date-only values', () => {
    expect(parseUiDate('02/07/2030')).toBe('2030-07-02');
    expect(parseUiDate('29/02/2028')).toBe('2028-02-29');
  });

  it('rejects malformed and impossible dates', () => {
    expect(parseUiDate('2030-07-02')).toBeNull();
    expect(parseUiDate('31/02/2030')).toBeNull();
    expect(parseUiDate('29/02/2027')).toBeNull();
  });

  it('derives today and tomorrow from the local calendar', () => {
    const now = new Date(2026, 6, 1, 23, 59);
    expect(getTodayDateOnly(now)).toBe('2026-07-01');
    expect(getTomorrowUiDate(now)).toBe('02/07/2026');
  });
});
