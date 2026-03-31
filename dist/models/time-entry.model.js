import mongoose, { Schema } from 'mongoose';
/** Tipos atuais: alternância ilimitada entrada/saída no dia */
export const PunchKind = {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
};
/** Valores legados (migração / leitura) */
export const LegacyPunchType = {
    ENTRADA_1: 'ENTRADA_1',
    SAIDA_1: 'SAIDA_1',
    ENTRADA_2: 'ENTRADA_2',
    SAIDA_2: 'SAIDA_2',
};
export const PunchType = {
    ...PunchKind,
    ...LegacyPunchType,
};
const timeEntrySchema = new Schema({
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
}, { timestamps: { createdAt: true, updatedAt: false } });
timeEntrySchema.index({ userId: 1, timestamp: -1 });
timeEntrySchema.index({ userId: 1, type: 1, timestamp: 1 });
export const TimeEntryModel = mongoose.model('TimeEntry', timeEntrySchema);
//# sourceMappingURL=time-entry.model.js.map