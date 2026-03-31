import { formatInTimeZone } from 'date-fns-tz';
/**
 * Próximo feriado nacional (BrasilAPI) a partir de hoje no fuso do usuário.
 * Comparação por `yyyy-MM-dd` para incluir o feriado de hoje, se for o caso.
 */
export async function getNextBrazilHoliday(timeZone) {
    const now = new Date();
    const todayStr = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
    const year = Number(formatInTimeZone(now, timeZone, 'yyyy'));
    for (const y of [year, year + 1]) {
        const list = await fetchBrasilHolidays(y);
        if (!list.length)
            continue;
        const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
        const hit = sorted.find((h) => h.date >= todayStr);
        if (hit)
            return { date: hit.date, name: hit.name };
    }
    return null;
}
const holidayYearCache = new Map();
/** Datas (yyyy-MM-dd) de feriados nacionais no ano (BrasilAPI), com cache em memória. */
export async function getBrazilHolidayDatesForYear(year) {
    const cached = holidayYearCache.get(year);
    if (cached && cached.size > 0)
        return cached;
    const list = await fetchBrasilHolidaysWithRetry(year);
    const s = new Set();
    for (const h of list)
        s.add(h.date);
    if (s.size > 0) {
        holidayYearCache.set(year, s);
    }
    return s;
}
/** Evita cachear lista vazia (falha de rede/timeout na 1ª tentativa). */
async function fetchBrasilHolidaysWithRetry(year) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const list = await fetchBrasilHolidays(year);
        if (list.length > 0)
            return list;
        if (attempt < 2)
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
    return [];
}
async function fetchBrasilHolidays(year) {
    const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(12_000),
            headers: { Accept: 'application/json' },
        });
        if (!res.ok)
            return [];
        const data = (await res.json());
        if (!Array.isArray(data))
            return [];
        return data
            .filter((row) => row != null &&
            typeof row === 'object' &&
            'date' in row &&
            'name' in row &&
            typeof row.date === 'string' &&
            typeof row.name === 'string')
            .map((h) => ({ date: h.date, name: h.name }));
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=holidays.service.js.map