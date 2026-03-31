import mongoose, { Schema } from 'mongoose';
export const AdjustmentKind = {
    AJUSTE: 'AJUSTE',
    FALTA: 'FALTA',
    ATRASO: 'ATRASO',
};
export const AdjustmentStatus = {
    PENDENTE: 'PENDENTE',
    APROVADO: 'APROVADO',
    REJEITADO: 'REJEITADO',
};
const adjustmentSchema = new Schema({
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
}, { timestamps: true });
adjustmentSchema.index({ userId: 1, date: 1 });
adjustmentSchema.index({ status: 1 });
export const AdjustmentModel = mongoose.model('Adjustment', adjustmentSchema);
//# sourceMappingURL=adjustment.model.js.map