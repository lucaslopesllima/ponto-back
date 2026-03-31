import mongoose, { Schema } from 'mongoose';
export const NotificationType = {
    PUNCH_REMINDER: 'PUNCH_REMINDER',
    LATE_ALERT: 'LATE_ALERT',
    ADJUSTMENT_APPROVED: 'ADJUSTMENT_APPROVED',
    ADJUSTMENT_REJECTED: 'ADJUSTMENT_REJECTED',
    MANUAL_PUNCH_APPROVED: 'MANUAL_PUNCH_APPROVED',
    MANUAL_PUNCH_REJECTED: 'MANUAL_PUNCH_REJECTED',
};
const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: Object.values(NotificationType) },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    idGraf: { type: String, default: null, maxlength: 256 },
}, { timestamps: { createdAt: true, updatedAt: false } });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
export const NotificationModel = mongoose.model('Notification', notificationSchema);
//# sourceMappingURL=notification.model.js.map