import mongoose, { type Document, type Types } from 'mongoose';
export interface IAdjustmentLog extends Document {
    adjustmentId: Types.ObjectId;
    actorId: Types.ObjectId;
    action: string;
    payload: Record<string, unknown>;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
}
export declare const AdjustmentLogModel: mongoose.Model<IAdjustmentLog, {}, {}, {}, mongoose.Document<unknown, {}, IAdjustmentLog, {}, {}> & IAdjustmentLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=adjustment-log.model.d.ts.map