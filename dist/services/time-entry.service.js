import { Types } from 'mongoose';
import { TimeEntryModel, PunchKind, } from '../models/time-entry.model.js';
import { HttpError } from '../lib/http-error.js';
import { assertLocationAllowed } from './geofence.service.js';
import { reverseGeocode } from './geocoding.service.js';
import { env } from '../config/env.js';
import { getBrazilHolidayDatesForYear } from './holidays.service.js';
import { eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getDayRangeUtc, getMonthRangeUtc, formatDateInTz, } from '../lib/timezone.js';
/** Normaliza tipos legados (ENTRADA_1…) para ENTRADA/SAIDA */
export function normalizePunchKind(raw) {
    if (raw === 'ENTRADA' || raw.startsWith('ENTRADA'))
        return PunchKind.ENTRADA;
    if (raw === 'SAIDA' || raw.startsWith('SAIDA'))
        return PunchKind.SAIDA;
    return PunchKind.ENTRADA;
}
export async function getTodayEntries(userId, timeZone) {
    return getDayEntries(userId, timeZone, new Date());
}
/** Batidas do dia civil de `instant` no fuso do usuário. */
export async function getDayEntries(userId, timeZone, instant) {
    const { start, end } = getDayRangeUtc(timeZone, instant);
    const list = await TimeEntryModel.find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: start, $lte: end },
    })
        .sort({ timestamp: 1 })
        .lean();
    return list.map((e) => ({
        kind: normalizePunchKind(String(e.type)),
        timestamp: e.timestamp,
    }));
}
/** Próxima batida: par (0,2,4…) = entrada; ímpar = saída. Sem limite por dia. */
export function nextExpectedKind(entries) {
    return entries.length % 2 === 0 ? PunchKind.ENTRADA : PunchKind.SAIDA;
}
export async function createPunch(userId, timeZone, input) {
    await assertLocationAllowed(input.lat, input.lng);
    const today = await getTodayEntries(userId, timeZone);
    const kind = nextExpectedKind(today);
    const ua = env.GEOCODING_USER_AGENT ?? 'Pontome/1.0 (ponto eletrônico)';
    const address = await reverseGeocode(input.lat, input.lng, ua);
    const doc = await TimeEntryModel.create({
        userId: new Types.ObjectId(userId),
        type: kind,
        timestamp: new Date(),
        location: {
            lat: input.lat,
            lng: input.lng,
            ...(address ? { address } : {}),
        },
    });
    return { id: String(doc._id), timestamp: doc.timestamp, address };
}
function parseHm(s) {
    if (!s)
        return null;
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m)
        return null;
    return { h: Number(m[1]), m: Number(m[2]) };
}
function minutesOfDay(d, tz) {
    const z = toZonedTime(d, tz);
    return z.getHours() * 60 + z.getMinutes();
}
function buildDayRow(dateStr, entries, user) {
    const tz = user.timezone;
    const sorted = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const fmt = (d) => formatDateInTz(d, tz, 'HH:mm');
    const times = sorted.map((e) => fmt(e.timestamp));
    const addresses = sorted.map((e) => e.address ?? null);
    let totalMinutes = 0;
    for (let i = 0; i + 1 < sorted.length; i += 2) {
        const a = sorted[i].timestamp;
        const b = sorted[i + 1].timestamp;
        if (b > a)
            totalMinutes += (b.getTime() - a.getTime()) / 60000;
    }
    const ws = user.workSchedule ?? {};
    const tol = ws.toleranceLateMinutes ?? 15;
    const expE1 = parseHm(ws.expectedEntrada1);
    const n = sorted.length;
    const dayOpen = n % 2 === 1;
    const [yy, mm, dd] = dateStr.split('-').map(Number);
    const midDay = new Date(Date.UTC(yy, mm - 1, dd, 15, 0, 0));
    const dayEnd = getDayRangeUtc(tz, midDay).end;
    const pastDay = Date.now() > dayEnd.getTime();
    let status = 'NORMAL';
    if (n >= 4) {
        status = 'CONCLUIDA';
    }
    else if (n === 0) {
        status = pastDay ? 'FALTA' : 'NORMAL';
    }
    else if (expE1 && sorted[0]) {
        const expectedMin = expE1.h * 60 + expE1.m;
        const actualMin = minutesOfDay(sorted[0].timestamp, tz);
        if (actualMin > expectedMin + tol)
            status = 'ATRASO';
    }
    return {
        date: dateStr,
        times,
        addresses,
        totalMinutes: Math.round(totalMinutes),
        status,
        dayOpen,
    };
}
function isWeekendInUserTz(dateStr, tz) {
    const [yy, mm, dd] = dateStr.split('-').map(Number);
    const midDay = new Date(Date.UTC(yy, mm - 1, dd, 15, 0, 0));
    const z = toZonedTime(midDay, tz);
    const dow = z.getDay();
    return dow === 0 || dow === 6;
}
/** Remove fins de semana / feriados sem batidas conforme preferências do usuário. */
async function applyMirrorVisibilityFilters(rows, user, holidayYear) {
    const ws = user.workSchedule ?? {};
    const hideWeekends = ws.worksWeekends === false;
    const hideHolidays = ws.worksHolidays === false;
    if (!hideWeekends && !hideHolidays)
        return rows;
    const tz = user.timezone;
    const holidaySet = hideHolidays
        ? await getBrazilHolidayDatesForYear(holidayYear)
        : null;
    return rows.filter((row) => {
        if (row.times.length > 0)
            return true;
        if (hideWeekends && isWeekendInUserTz(row.date, tz))
            return false;
        if (hideHolidays && holidaySet?.has(row.date))
            return false;
        return true;
    });
}
export async function getMirrorMonth(user, year, month // 1-12
) {
    const tz = user.timezone;
    const { start: rangeStart, end: rangeEnd } = getMonthRangeUtc(tz, year, month);
    const entries = await TimeEntryModel.find({
        userId: user._id,
        timestamp: { $gte: rangeStart, $lte: rangeEnd },
    })
        .sort({ timestamp: 1 })
        .lean();
    const byDay = new Map();
    for (const e of entries) {
        const d = formatDateInTz(e.timestamp, tz, 'yyyy-MM-dd');
        if (!byDay.has(d))
            byDay.set(d, []);
        byDay.get(d).push({
            type: String(e.type),
            timestamp: e.timestamp,
            address: e.location?.address ?? null,
        });
    }
    const ref = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
    const z = toZonedTime(ref, tz);
    const ms = startOfMonth(z);
    const me = endOfMonth(z);
    const days = eachDayOfInterval({ start: ms, end: me });
    const rows = [];
    for (const d of days) {
        const key = formatDateInTz(d, tz, 'yyyy-MM-dd');
        const dayEntries = byDay.get(key) ?? [];
        rows.push(buildDayRow(key, dayEntries, user));
    }
    return applyMirrorVisibilityFilters(rows, user, year);
}
const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
function parseYmd(s) {
    const m = YMD_RE.exec(s);
    if (!m)
        return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31)
        return null;
    return { y, m: mo, d };
}
/** Espelho entre duas datas (YYYY-MM-DD) inclusivas, no calendário do usuário. */
export async function getMirrorDateRange(user, fromYmd, toYmd) {
    if (!parseYmd(fromYmd) || !parseYmd(toYmd)) {
        throw new HttpError(400, 'Datas inválidas', 'INVALID_DATES');
    }
    if (fromYmd.localeCompare(toYmd) > 0) {
        throw new HttpError(400, 'Data início deve ser anterior ou igual à data fim', 'INVALID_RANGE');
    }
    const MAX_DAYS = 400;
    const from = parseYmd(fromYmd);
    const to = parseYmd(toYmd);
    const start = new Date(from.y, from.m - 1, from.d);
    const end = new Date(to.y, to.m - 1, to.d);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000) + 1;
    if (diffDays > MAX_DAYS) {
        throw new HttpError(400, 'Intervalo máximo de 400 dias', 'RANGE_TOO_LARGE');
    }
    const rows = [];
    let cursorY = from.y;
    let cursorM = from.m;
    const endY = to.y;
    const endM = to.m;
    while (cursorY < endY || (cursorY === endY && cursorM <= endM)) {
        const monthRows = await getMirrorMonth(user, cursorY, cursorM);
        for (const row of monthRows) {
            if (row.date >= fromYmd && row.date <= toYmd) {
                rows.push(row);
            }
        }
        cursorM += 1;
        if (cursorM > 12) {
            cursorM = 1;
            cursorY += 1;
        }
    }
    return rows;
}
export async function listEntriesRaw(userId, from, to) {
    return TimeEntryModel.find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: from, $lte: to },
    })
        .sort({ timestamp: 1 })
        .lean();
}
//# sourceMappingURL=time-entry.service.js.map