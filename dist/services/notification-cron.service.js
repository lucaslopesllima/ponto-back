import cron from 'node-cron';
import { UserModel } from '../models/user.model.js';
import { NotificationModel, NotificationType, } from '../models/notification.model.js';
import { logger } from '../lib/logger.js';
import { formatInTimeZone } from 'date-fns-tz';
let started = false;
export function startNotificationCron() {
    if (started)
        return;
    started = true;
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const minute = formatInTimeZone(now, 'UTC', 'HH:mm');
        try {
            const users = await UserModel.find({
                'notificationPreferences.punchReminderEnabled': true,
            }).lean();
            for (const u of users) {
                const tz = u.timezone ?? 'America/Sao_Paulo';
                const localHm = formatInTimeZone(now, tz, 'HH:mm');
                const times = u.notificationPreferences?.punchReminderTimes ?? [];
                if (times.includes(localHm)) {
                    await NotificationModel.create({
                        userId: u._id,
                        type: NotificationType.PUNCH_REMINDER,
                        title: 'Lembrete de ponto',
                        body: 'Não esqueça de registrar seu ponto.',
                    });
                }
            }
            if (minute === '09:00') {
                const usersLate = await UserModel.find({
                    'notificationPreferences.lateAlertEnabled': true,
                }).lean();
                for (const u of usersLate) {
                    await NotificationModel.create({
                        userId: u._id,
                        type: NotificationType.LATE_ALERT,
                        title: 'Possível atraso',
                        body: 'Verifique seus registros de ponto de hoje.',
                    });
                }
            }
        }
        catch (e) {
            logger.error({ err: e }, 'notification cron');
        }
    }, { timezone: 'UTC' });
    logger.info('Notification cron started');
}
//# sourceMappingURL=notification-cron.service.js.map