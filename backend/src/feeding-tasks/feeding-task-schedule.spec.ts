import { getNextScheduledDueAt } from './feeding-task-schedule';

describe('getNextScheduledDueAt', () => {
  it('advances one recurrence after an on-time feeding', () => {
    expect(
      getNextScheduledDueAt(
        new Date('2026-07-03T09:00:00.000Z'),
        1,
        new Date('2026-07-03T10:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-04T09:00:00.000Z'));
  });

  it('advances repeatedly when completion is late', () => {
    expect(
      getNextScheduledDueAt(
        new Date('2026-07-01T09:00:00.000Z'),
        1,
        new Date('2026-07-03T10:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-04T09:00:00.000Z'));
  });

  it('keeps a later feeding on the same local date when it is still upcoming', () => {
    expect(
      getNextScheduledDueAt(
        new Date('2026-07-01T21:00:00.000Z'),
        2,
        new Date('2026-07-03T12:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-03T21:00:00.000Z'));
  });

  it('preserves minutes and seconds from the original due instant', () => {
    expect(
      getNextScheduledDueAt(
        new Date('2026-07-01T09:15:30.000Z'),
        1,
        new Date('2026-07-01T10:00:00.000Z'),
        'America/Argentina/Buenos_Aires',
      ),
    ).toEqual(new Date('2026-07-02T09:15:30.000Z'));
  });
});
