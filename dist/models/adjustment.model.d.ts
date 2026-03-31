import mongoose, { type Document, type Types } from 'mongoose';
export declare const AdjustmentKind: {
    readonly AJUSTE: "AJUSTE";
    readonly FALTA: "FALTA";
    readonly ATRASO: "ATRASO";
};
export type AdjustmentKindValue = (typeof AdjustmentKind)[keyof typeof AdjustmentKind];
export declare const AdjustmentStatus: {
    readonly PENDENTE: "PENDENTE";
    readonly APROVADO: "APROVADO";
    readonly REJEITADO: "REJEITADO";
};
export type AdjustmentStatusValue = (typeof AdjustmentStatus)[keyof typeof AdjustmentStatus];
export interface IAdjustment extends Document {
    userId: Types.ObjectId;
    date: Date;
    kind: AdjustmentKindValue;
    reason: string;
    status: AdjustmentStatusValue;
    proposedChanges?: {
        entrada1?: Date | null;
        saida1?: Date | null;
        entrada2?: Date | null;
        saida2?: Date | null;
    };
    approvedBy?: Types.ObjectId | null;
    decidedAt?: Date | null;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AdjustmentModel: mongoose.Model<IAdjustment, {}, {}, {}, mongoose.Document<unknown, {}, IAdjustment, {}, {}> & IAdjustment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=adjustment.model.d.ts.map