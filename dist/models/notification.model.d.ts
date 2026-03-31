import mongoose, { type Document, type Types } from 'mongoose';
export declare const NotificationType: {
    readonly PUNCH_REMINDER: "PUNCH_REMINDER";
    readonly LATE_ALERT: "LATE_ALERT";
    readonly ADJUSTMENT_APPROVED: "ADJUSTMENT_APPROVED";
    readonly ADJUSTMENT_REJECTED: "ADJUSTMENT_REJECTED";
    readonly MANUAL_PUNCH_APPROVED: "MANUAL_PUNCH_APPROVED";
    readonly MANUAL_PUNCH_REJECTED: "MANUAL_PUNCH_REJECTED";
};
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
export declare const NotificationModel: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=notification.model.d.ts.map