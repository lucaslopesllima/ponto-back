import mongoose, { Schema } from 'mongoose';
const auditLogSchema = new Schema({
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    idGraf: { type: String, default: null, maxlength: 256 },
}, { timestamps: { createdAt: true, updatedAt: false } });
auditLogSchema.index({ createdAt: -1 });
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
//# sourceMappingURL=audit-log.model.js.map