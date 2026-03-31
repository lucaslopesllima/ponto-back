import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { PunchKindValue } from './time-entry.model.js';
import { PunchKind } from './time-entry.model.js';

export const ManualPunchRequestStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO',
} as const;
export type ManualPunchRequestStatusValue =
  (typeof ManualPunchRequestStatus)[keyof typeof ManualPunchRequestStatus];

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

const manualPunchRequestSchema = new Schema<IManualPunchRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(PunchKind),
    },
    reason: { type: String, required: true, maxlength: 4000 },
    status: {
      type: String,
      enum: Object.values(ManualPunchRequestStatus),
      default: ManualPunchRequestStatus.PENDENTE,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: true }
);

manualPunchRequestSchema.index({ userId: 1, timestamp: 1 });
manualPunchRequestSchema.index({ status: 1 });

export const ManualPunchRequestModel = mongoose.model<IManualPunchRequest>(
  'ManualPunchRequest',
  manualPunchRequestSchema
);
