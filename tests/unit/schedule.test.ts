import { toMask, fromMask, DOW } from '@/lib/schedule';

describe('DOW constant', () => {
  it('has 7 entries starting at Sun and ending at Sat', () => {
    expect(DOW).toHaveLength(7);
    expect(DOW[0]).toBe('Sun');
    expect(DOW[6]).toBe('Sat');
  });
});

describe('toMask', () => {
  it('returns 0 for an empty schedule', () => {
    expect(toMask([])).toBe(0);
  });

  it('sets a single bit for a single day', () => {
    expect(toMask([0])).toBe(1); // Sun -> bit 0
    expect(toMask([1])).toBe(2); // Mon -> bit 1
    expect(toMask([6])).toBe(64); // Sat -> bit 6
  });

  it('sets all 7 bits when every day is scheduled', () => {
    expect(toMask([0, 1, 2, 3, 4, 5, 6])).toBe(127);
  });

  it('is order independent', () => {
    expect(toMask([5, 1, 3])).toBe(toMask([1, 3, 5]));
  });

  it('deduplicates repeated days', () => {
    expect(toMask([1, 1, 3])).toBe(toMask([1, 3]));
  });

  it('wraps day values greater than 6 using modulo 7', () => {
    expect(toMask([7])).toBe(toMask([0])); // 7 % 7 === 0
    expect(toMask([13])).toBe(toMask([6])); // 13 % 7 === 6
  });
});

describe('fromMask', () => {
  it('returns an empty array for mask 0', () => {
    expect(fromMask(0)).toEqual([]);
  });

  it('returns all days for a full mask', () => {
    expect(fromMask(127)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('returns days in ascending order regardless of how the mask was built', () => {
    const mask = toMask([5, 1, 3]);
    expect(fromMask(mask)).toEqual([1, 3, 5]);
  });

  it('decodes single-bit masks back to the correct day', () => {
    expect(fromMask(1)).toEqual([0]);
    expect(fromMask(64)).toEqual([6]);
  });

  it('roundtrips arbitrary day sets', () => {
    const days = [0, 2, 4, 6];
    expect(fromMask(toMask(days))).toEqual(days);
  });
});
