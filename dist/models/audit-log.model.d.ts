import mongoose, { type Document, type Types } from 'mongoose';
export interface IAuditLog extends Document {
    actorId?: Types.ObjectId | null;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
}
export declare const AuditLogModel: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=audit-log.model.d.ts.map