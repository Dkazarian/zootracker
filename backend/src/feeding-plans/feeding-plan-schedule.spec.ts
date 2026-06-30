import {
  formatDateOnly,
  getFeedingPlanTiming,
  parseDateOnly,
} from './feeding-plan-schedule';

describe('feeding plan schedule', () => {
  const timeZone = 'America/Argentina/Buenos_Aires';
  const date = new Date('2026-07-01T00:00:00.000Z');

  it('keeps a morning plan upcoming until 06:00 zoo time', () => {
    expect(
      getFeedingPlanTiming(
        date,
        'morning',
        new Date('2026-07-01T08:59:59.000Z'),
        timeZone,
      ),
    ).toEqual({ status: 'upcoming', minutesPastDue: null });
  });

  it('makes a plan due at its period boundary and keeps it due', () => {
    expect(
      getFeedingPlanTiming(
        date,
        'morning',
        new Date('2026-07-01T09:00:00.000Z'),
        timeZone,
      ),
    ).toEqual({ status: 'due', minutesPastDue: 0 });
    expect(
      getFeedingPlanTiming(
        date,
        'morning',
        new Date('2026-07-02T09:30:00.000Z'),
        timeZone,
      ),
    ).toEqual({ status: 'due', minutesPastDue: 1470 });
  });

  it('uses the configured afternoon and evening boundaries', () => {
    expect(
      getFeedingPlanTiming(
        date,
        'afternoon',
        new Date('2026-07-01T15:00:00.000Z'),
        timeZone,
      ).status,
    ).toBe('due');
    expect(
      getFeedingPlanTiming(
        date,
        'evening',
        new Date('2026-07-01T20:59:59.000Z'),
        timeZone,
      ).status,
    ).toBe('upcoming');
  });

  it('parses and formats valid calendar dates without timezone drift', () => {
    expect(formatDateOnly(parseDateOnly('2028-02-29'))).toBe('2028-02-29');
    expect(() => parseDateOnly('2026-02-30')).toThrow('Invalid calendar date');
  });
});
