import { toMask, fromMask } from '@/lib/schedule';
import { computeLocalDate } from '@/lib/time';

describe('schedule helpers', () => {
  it('roundtrips mask', () => {
    const days = [1,3,5];
    const mask = toMask(days);
    expect(fromMask(mask)).toEqual(days);
  });
});

describe('local date', () => {
  it('applies day_start_hour', async () => {
    const d = await computeLocalDate(1, 'UTC', 5);
    expect(d).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
