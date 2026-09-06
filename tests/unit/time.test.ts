import { computeLocalDate } from '@/lib/time';

describe('computeLocalDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses today when the current hour is after the default day start (0)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T03:00:00Z'));

    const date = await computeLocalDate(1, 'UTC');
    expect(date).toBe('2024-01-15');
  });

  it('rolls back to the previous day when the hour is before dayStartHour', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T03:00:00Z'));

    const date = await computeLocalDate(1, 'UTC', 5);
    expect(date).toBe('2024-01-14');
  });

  it('does not roll back when the hour is at or after dayStartHour', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T06:00:00Z'));

    const date = await computeLocalDate(1, 'UTC', 5);
    expect(date).toBe('2024-01-15');
  });

  it('converts to the requested timezone before applying the day boundary', async () => {
    vi.useFakeTimers();
    // 23:30 UTC on Jan 15 is 18:30 in America/New_York (UTC-5 in January)
    vi.setSystemTime(new Date('2024-01-15T23:30:00Z'));

    const date = await computeLocalDate(1, 'America/New_York');
    expect(date).toBe('2024-01-15');
  });

  it('can roll the local date forward across midnight for timezones ahead of UTC', async () => {
    vi.useFakeTimers();
    // 20:00 UTC on Jan 15 is 05:00 on Jan 16 in Asia/Tokyo (UTC+9)
    vi.setSystemTime(new Date('2024-01-15T20:00:00Z'));

    const date = await computeLocalDate(1, 'Asia/Tokyo');
    expect(date).toBe('2024-01-16');
  });

  it('combines timezone conversion with a non-zero dayStartHour', async () => {
    vi.useFakeTimers();
    // 20:00 UTC on Jan 15 is 05:00 on Jan 16 in Asia/Tokyo; with dayStartHour 6 this
    // is still "yesterday" from the user's perspective.
    vi.setSystemTime(new Date('2024-01-15T20:00:00Z'));

    const date = await computeLocalDate(1, 'Asia/Tokyo', 6);
    expect(date).toBe('2024-01-15');
  });

  it('returns a well-formed YYYY-MM-DD string', async () => {
    const date = await computeLocalDate(1, 'UTC');
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
