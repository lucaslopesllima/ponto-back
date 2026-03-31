import mongoose, { type Document, type Types } from 'mongoose';
import type { PunchKindValue } from './time-entry.model.js';
export declare const ManualPunchRequestStatus: {
    readonly PENDENTE: "PENDENTE";
    readonly APROVADO: "APROVADO";
    readonly REJEITADO: "REJEITADO";
};
export type ManualPunchRequestStatusValue = (typeof ManualPunchRequestStatus)[keyof typeof ManualPunchRequestStatus];
export interface IManualPunchRequest extends Document {
    userId: Types.ObjectId;
    /** Horário retroativo solicitado (entrada/saída conforme sequência do dia até esse instante). */
    timestamp: Date;
    type: PunchKindValue;
    reason: string;
    status: ManualPunchRequestStatusValue;
    approvedBy?: Types.ObjectId | null;
    decidedAt?: Date | null;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ManualPunchRequestModel: mongoose.Model<IManualPunchRequest, {}, {}, {}, mongoose.Document<unknown, {}, IManualPunchRequest, {}, {}> & IManualPunchRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=manual-punch-request.model.d.ts.map