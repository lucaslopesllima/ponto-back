import mongoose, { Schema, type Document, type Types } from 'mongoose';

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

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
