import mongoose, { Schema, type Document, type Types } from 'mongoose';

/** Tipos atuais: alternância ilimitada entrada/saída no dia */
export const PunchKind = {
  ENTRADA: 'ENTRADA',
  SAIDA: 'SAIDA',
} as const;
export type PunchKindValue = (typeof PunchKind)[keyof typeof PunchKind];

/** Valores legados (migração / leitura) */
export const LegacyPunchType = {
  ENTRADA_1: 'ENTRADA_1',
  SAIDA_1: 'SAIDA_1',
  ENTRADA_2: 'ENTRADA_2',
  SAIDA_2: 'SAIDA_2',
} as const;

export const PunchType = {
  ...PunchKind,
  ...LegacyPunchType,
} as const;
export type PunchTypeValue = (typeof PunchType)[keyof typeof PunchType];

export interface ITimeEntry extends Document {
  userId: Types.ObjectId;
  type: PunchTypeValue;
  timestamp: Date;
  location: { lat: number; lng: number; address?: string };
  /** Identificador externo (integração / gráficos). */
  idGraf?: string | null;
  createdAt: Date;
}

const timeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(PunchType),
    },
    timestamp: { type: Date, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: false },
    },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

timeEntrySchema.index({ userId: 1, timestamp: -1 });
timeEntrySchema.index({ userId: 1, type: 1, timestamp: 1 });

export const TimeEntryModel = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);
