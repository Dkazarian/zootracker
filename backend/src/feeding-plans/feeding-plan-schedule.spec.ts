import { getFeedingPlanTiming, parseTimestamp } from './feeding-plan-schedule';

describe('feeding plan schedule', () => {
  const dueAt = new Date('2026-07-01T09:00:00.000Z');

  it('keeps a plan upcoming until its due instant', () => {
    expect(
      getFeedingPlanTiming(dueAt, new Date('2026-07-01T08:59:59.000Z')),
    ).toEqual({ status: 'upcoming', minutesPastDue: null });
  });

  it('makes a plan due at its due instant and keeps it due', () => {
    expect(
      getFeedingPlanTiming(dueAt, new Date('2026-07-01T09:00:00.000Z')),
    ).toEqual({ status: 'due', minutesPastDue: 0 });
    expect(
      getFeedingPlanTiming(dueAt, new Date('2026-07-02T09:30:00.000Z')),
    ).toEqual({ status: 'due', minutesPastDue: 1470 });
  });

  it('parses valid timestamps', () => {
    expect(parseTimestamp('2026-07-01T09:00:00.000Z')).toEqual(dueAt);
    expect(() => parseTimestamp('not-a-timestamp')).toThrow(
      'Invalid timestamp',
    );
  });
});
