import mongoose, { Schema } from 'mongoose';
const adjustmentLogSchema = new Schema({
    adjustmentId: { type: Schema.Types.ObjectId, ref: 'Adjustment', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    idGraf: { type: String, default: null, maxlength: 256 },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const AdjustmentLogModel = mongoose.model('AdjustmentLog', adjustmentLogSchema);
//# sourceMappingURL=adjustment-log.model.js.map