/**
 * Próximo feriado nacional (BrasilAPI) a partir de hoje no fuso do usuário.
 * Comparação por `yyyy-MM-dd` para incluir o feriado de hoje, se for o caso.
 */
export declare function getNextBrazilHoliday(timeZone: string): Promise<{
    date: string;
    name: string;
} | null>;
/** Datas (yyyy-MM-dd) de feriados nacionais no ano (BrasilAPI), com cache em memória. */
export declare function getBrazilHolidayDatesForYear(year: number): Promise<Set<string>>;
//# sourceMappingURL=holidays.service.d.ts.map