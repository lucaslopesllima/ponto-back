import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
/** Início e fim do dia civil no fuso `timeZone`, em instantes UTC. */
export function getDayRangeUtc(timeZone, instant) {
    const zoned = toZonedTime(instant, timeZone);
    const start = fromZonedTime(startOfDay(zoned), timeZone);
    const end = fromZonedTime(endOfDay(zoned), timeZone);
    return { start, end };
}
/** Primeiro e último instante UTC do mês civil no fuso `timeZone`. */
export function getMonthRangeUtc(timeZone, year, month) {
    const ref = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
    const z = toZonedTime(ref, timeZone);
    const ms = startOfMonth(z);
    const me = endOfMonth(z);
    return {
        start: fromZonedTime(startOfDay(ms), timeZone),
        end: fromZonedTime(endOfDay(me), timeZone),
    };
}
export function formatDateInTz(date, timeZone, pattern) {
    return formatInTimeZone(date, timeZone, pattern);
}
//# sourceMappingURL=timezone.js.map