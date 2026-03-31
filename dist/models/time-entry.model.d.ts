import mongoose, { type Document, type Types } from 'mongoose';
/** Tipos atuais: alternância ilimitada entrada/saída no dia */
export declare const PunchKind: {
    readonly ENTRADA: "ENTRADA";
    readonly SAIDA: "SAIDA";
};
export type PunchKindValue = (typeof PunchKind)[keyof typeof PunchKind];
/** Valores legados (migração / leitura) */
export declare const LegacyPunchType: {
    readonly ENTRADA_1: "ENTRADA_1";
    readonly SAIDA_1: "SAIDA_1";
    readonly ENTRADA_2: "ENTRADA_2";
    readonly SAIDA_2: "SAIDA_2";
};
export declare const PunchType: {
    readonly ENTRADA_1: "ENTRADA_1";
    readonly SAIDA_1: "SAIDA_1";
    readonly ENTRADA_2: "ENTRADA_2";
    readonly SAIDA_2: "SAIDA_2";
    readonly ENTRADA: "ENTRADA";
    readonly SAIDA: "SAIDA";
};
export type PunchTypeValue = (typeof PunchType)[keyof typeof PunchType];
export interface ITimeEntry extends Document {
    userId: Types.ObjectId;
    type: PunchTypeValue;
    timestamp: Date;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
}
export declare const TimeEntryModel: mongoose.Model<ITimeEntry, {}, {}, {}, mongoose.Document<unknown, {}, ITimeEntry, {}, {}> & ITimeEntry & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=time-entry.model.d.ts.map