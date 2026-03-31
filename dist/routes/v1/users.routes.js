import { z } from 'zod';
import { authenticate, requireAdmin } from '../../plugins/auth.plugin.js';
import { createUser, findById, updateProfile, listUsersForAdmin, setPushSubscription, } from '../../services/user.service.js';
import { ContractType, UserRole } from '../../models/user.model.js';
const adminCreateSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
    /** Segredo para `POST /auth/login-hash` (armazenado com hash argon2) */
    hashLogin: z.string().min(8).max(2048).optional(),
    locale: z.string().min(2).max(32).optional(),
    timezone: z.string().optional(),
});
const profileSchema = z.object({
    name: z.string().min(1).max(120).optional(),
    locale: z.string().min(2).max(32).optional(),
    timezone: z.string().optional(),
    contractType: z.nativeEnum(ContractType).optional(),
    hourlyRateBrl: z.number().min(0).max(5000).nullable().optional(),
    workSchedule: z
        .object({
        expectedEntrada1: z.string().optional(),
        expectedSaida1: z.string().optional(),
        expectedEntrada2: z.string().optional(),
        expectedSaida2: z.string().optional(),
        dailyMinutes: z.number().optional(),
        toleranceLateMinutes: z.number().optional(),
        worksWeekends: z.boolean().optional(),
        worksHolidays: z.boolean().optional(),
    })
        .optional(),
    notificationPreferences: z
        .object({
        punchReminderEnabled: z.boolean().optional(),
        punchReminderTimes: z.array(z.string()).optional(),
        lateAlertEnabled: z.boolean().optional(),
        adjustmentApprovalEnabled: z.boolean().optional(),
    })
        .optional(),
});
const pushSchema = z.object({
    subscription: z.object({ endpoint: z.string(), keys: z.any() }).nullable(),
});
export async function usersRoutes(app) {
    app.patch('/users/me', { preHandler: [authenticate] }, async (request, reply) => {
        const body = profileSchema.parse(request.body);
        const patch = { ...body };
        if (body.contractType === ContractType.CLT) {
            patch.hourlyRateBrl = null;
        }
        const user = await updateProfile(request.userId, patch);
        if (!user)
            return reply.status(404).send({ error: 'NOT_FOUND' });
        return reply.send({
            id: String(user._id),
            name: user.name,
            locale: user.locale ?? 'pt-BR',
            timezone: user.timezone,
            contractType: user.contractType ?? ContractType.CLT,
            hourlyRateBrl: user.hourlyRateBrl === undefined || user.hourlyRateBrl === null
                ? null
                : user.hourlyRateBrl,
            workSchedule: user.workSchedule,
            notificationPreferences: user.notificationPreferences,
        });
    });
    app.post('/users/me/push', { preHandler: [authenticate] }, async (request, reply) => {
        const body = pushSchema.parse(request.body);
        await setPushSubscription(request.userId, body.subscription);
        return reply.send({ ok: true });
    });
    app.get('/users', { preHandler: [requireAdmin] }, async (request, reply) => {
        const admin = await findById(request.userId);
        if (!admin)
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        const users = await listUsersForAdmin(admin.idGraf);
        return reply.send(users);
    });
    app.post('/users', { preHandler: [requireAdmin] }, async (request, reply) => {
        const body = adminCreateSchema.parse(request.body);
        const { hashLogin, ...rest } = body;
        const user = await createUser({ ...rest, hashLogin });
        return reply.status(201).send({
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
            isAdmin: Boolean(user.isAdmin ?? user.role === UserRole.ADMIN),
        });
    });
}
//# sourceMappingURL=users.routes.js.map