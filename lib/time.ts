import { DateTime } from 'luxon';

// Returns YYYY-MM-DD in user local day, taking into account day_start_hour (default 0)
export async function computeLocalDate(_userId: number, timezone = 'UTC', dayStartHour = 0): Promise<string> {
  const now = DateTime.now().setZone(timezone);
  const shifted = now.hour < dayStartHour ? now.minus({ days: 1 }) : now;
  return shifted.toISODate();
}
