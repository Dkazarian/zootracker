import { getNextScheduledDueDate } from './feeding-task-schedule';

describe('getNextScheduledDueDate', () => {
  it('advances one recurrence after an on-time feeding', () => {
    expect(
      getNextScheduledDueDate(
        new Date('2026-07-03T00:00:00.000Z'),
        1,
        'morning',
        new Date('2026-07-03T10:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-04T00:00:00.000Z'));
  });

  it('advances repeatedly when completion is late', () => {
    expect(
      getNextScheduledDueDate(
        new Date('2026-07-01T00:00:00.000Z'),
        1,
        'morning',
        new Date('2026-07-03T10:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-04T00:00:00.000Z'));
  });

  it('keeps a later feeding on the same date when its period has not begun', () => {
    expect(
      getNextScheduledDueDate(
        new Date('2026-07-01T00:00:00.000Z'),
        2,
        'evening',
        new Date('2026-07-03T12:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-03T00:00:00.000Z'));
  });
});
