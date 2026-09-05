// Helpers for schedule day-of-week bitmask: 0=Sun .. 6=Sat
export const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;

export function toMask(days: number[]): number {
  return days.reduce((m, d) => m | (1 << (d % 7)), 0);
}
export function fromMask(mask: number): number[] {
  const out: number[] = [];
  for (let d = 0; d < 7; d++) if (mask & (1 << d)) out.push(d);
  return out;
}
