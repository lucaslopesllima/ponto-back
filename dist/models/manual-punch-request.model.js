import mongoose, { Schema } from 'mongoose';
import { PunchKind } from './time-entry.model.js';
export const ManualPunchRequestStatus = {
    PENDENTE: 'PENDENTE',
    APROVADO: 'APROVADO',
    REJEITADO: 'REJEITADO',
};
const manualPunchRequestSchema = new Schema({
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
}, { timestamps: true });
manualPunchRequestSchema.index({ userId: 1, timestamp: 1 });
manualPunchRequestSchema.index({ status: 1 });
export const ManualPunchRequestModel = mongoose.model('ManualPunchRequest', manualPunchRequestSchema);
//# sourceMappingURL=manual-punch-request.model.js.map