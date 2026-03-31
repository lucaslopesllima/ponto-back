import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAdjustmentLog extends Document {
  adjustmentId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: string;
  payload: Record<string, unknown>;
  /** Identificador externo (integração / gráficos). */
  idGraf?: string | null;
  createdAt: Date;
}

const adjustmentLogSchema = new Schema<IAdjustmentLog>(
  {
    adjustmentId: { type: Schema.Types.ObjectId, ref: 'Adjustment', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdjustmentLogModel = mongoose.model<IAdjustmentLog>(
  'AdjustmentLog',
  adjustmentLogSchema
);
