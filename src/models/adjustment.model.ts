import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const AdjustmentKind = {
  AJUSTE: 'AJUSTE',
  FALTA: 'FALTA',
  ATRASO: 'ATRASO',
} as const;
export type AdjustmentKindValue = (typeof AdjustmentKind)[keyof typeof AdjustmentKind];

export const AdjustmentStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO',
} as const;
export type AdjustmentStatusValue = (typeof AdjustmentStatus)[keyof typeof AdjustmentStatus];

export interface IAdjustment extends Document {
  userId: Types.ObjectId;
  date: Date; // dia alvo UTC midnight
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

const adjustmentSchema = new Schema<IAdjustment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    kind: {
      type: String,
      enum: Object.values(AdjustmentKind),
      required: true,
    },
    reason: { type: String, required: true, maxlength: 4000 },
    status: {
      type: String,
      enum: Object.values(AdjustmentStatus),
      default: AdjustmentStatus.PENDENTE,
    },
    proposedChanges: {
      entrada1: Date,
      saida1: Date,
      entrada2: Date,
      saida2: Date,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: true }
);

adjustmentSchema.index({ userId: 1, date: 1 });
adjustmentSchema.index({ status: 1 });

export const AdjustmentModel = mongoose.model<IAdjustment>('Adjustment', adjustmentSchema);
