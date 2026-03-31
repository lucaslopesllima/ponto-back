import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const NotificationType = {
  PUNCH_REMINDER: 'PUNCH_REMINDER',
  LATE_ALERT: 'LATE_ALERT',
  ADJUSTMENT_APPROVED: 'ADJUSTMENT_APPROVED',
  ADJUSTMENT_REJECTED: 'ADJUSTMENT_REJECTED',
  MANUAL_PUNCH_APPROVED: 'MANUAL_PUNCH_APPROVED',
  MANUAL_PUNCH_REJECTED: 'MANUAL_PUNCH_REJECTED',
} as const;
export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationTypeValue;
  title: string;
  body: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  /** Identificador externo (integração / gráficos). */
  idGraf?: string | null;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: Object.values(NotificationType) },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
