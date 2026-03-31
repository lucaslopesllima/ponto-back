/** Início e fim do dia civil no fuso `timeZone`, em instantes UTC. */
export declare function getDayRangeUtc(timeZone: string, instant: Date): {
    start: Date;
    end: Date;
};
/** Primeiro e último instante UTC do mês civil no fuso `timeZone`. */
export declare function getMonthRangeUtc(timeZone: string, year: number, month: number): {
    start: Date;
    end: Date;
};
export declare function formatDateInTz(date: Date, timeZone: string, pattern: string): string;
//# sourceMappingURL=timezone.d.ts.map