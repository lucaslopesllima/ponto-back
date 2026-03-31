import { Types } from 'mongoose';
import { type PunchKindValue } from '../models/time-entry.model.js';
import type { IUser } from '../models/user.model.js';
/** Normaliza tipos legados (ENTRADA_1…) para ENTRADA/SAIDA */
export declare function normalizePunchKind(raw: string): PunchKindValue;
export declare function getTodayEntries(userId: string, timeZone: string): Promise<{
    kind: PunchKindValue;
    timestamp: Date;
}[]>;
/** Batidas do dia civil de `instant` no fuso do usuário. */
export declare function getDayEntries(userId: string, timeZone: string, instant: Date): Promise<{
    kind: PunchKindValue;
    timestamp: Date;
}[]>;
/** Próxima batida: par (0,2,4…) = entrada; ímpar = saída. Sem limite por dia. */
export declare function nextExpectedKind(entries: {
    kind: PunchKindValue;
}[]): PunchKindValue;
export declare function createPunch(userId: string, timeZone: string, input: {
    lat: number;
    lng: number;
}): Promise<{
    id: string;
    timestamp: Date;
    address: string | null;
}>;
export type DayMirrorStatus = 'NORMAL' | 'ATRASO' | 'FALTA' | 'CONCLUIDA';
export interface DayMirrorRow {
    date: string;
    /** Horários HH:mm na ordem do dia (todas as batidas) */
    times: string[];
    totalMinutes: number;
    status: DayMirrorStatus;
    /** true = número ímpar de batidas (jornada em aberto) */
    dayOpen: boolean;
}
export declare function getMirrorMonth(user: IUser, year: number, month: number): Promise<DayMirrorRow[]>;
/** Espelho entre duas datas (YYYY-MM-DD) inclusivas, no calendário do usuário. */
export declare function getMirrorDateRange(user: IUser, fromYmd: string, toYmd: string): Promise<DayMirrorRow[]>;
export declare function listEntriesRaw(userId: string, from: Date, to: Date): Promise<(import("mongoose").FlattenMaps<import("../models/time-entry.model.js").ITimeEntry> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=time-entry.service.d.ts.map