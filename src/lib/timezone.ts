import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

/** Início e fim do dia civil no fuso `timeZone`, em instantes UTC. */
export function getDayRangeUtc(timeZone: string, instant: Date): { start: Date; end: Date } {
  const zoned = toZonedTime(instant, timeZone);
  const start = fromZonedTime(startOfDay(zoned), timeZone);
  const end = fromZonedTime(endOfDay(zoned), timeZone);
  return { start, end };
}

/** Primeiro e último instante UTC do mês civil no fuso `timeZone`. */
export function getMonthRangeUtc(
  timeZone: string,
  year: number,
  month: number
): { start: Date; end: Date } {
  const ref = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
  const z = toZonedTime(ref, timeZone);
  const ms = startOfMonth(z);
  const me = endOfMonth(z);
  return {
    start: fromZonedTime(startOfDay(ms), timeZone),
    end: fromZonedTime(endOfDay(me), timeZone),
  };
}

export function formatDateInTz(date: Date, timeZone: string, pattern: string): string {
  return formatInTimeZone(date, timeZone, pattern);
}
