import { z } from 'zod';
import { login, loginWithHash, logout, refreshTokens, registerUser, setAuthCookies, } from '../../services/auth.service.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { findById } from '../../services/user.service.js';
import { ContractType, UserModel, UserRole } from '../../models/user.model.js';
const registerSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(320),
    password: z.string().min(8).max(128),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(128),
});
const loginHashSchema = z.object({
    email: z.string().email(),
    /** Segredo de integração (comparado com o hash armazenado em `hashLogin`) */
    hash: z.string().min(1).max(2048),
});
export async function authRoutes(app) {
    app.post('/auth/register', async (request, reply) => {
        const body = registerSchema.parse(request.body);
        const count = await UserModel.countDocuments();
        const role = count === 0 ? UserRole.ADMIN : UserRole.USER;
        const user = await registerUser({
            ...body,
            role,
        });
        setAuthCookies(reply, user.id, user.role);
        return reply.status(201).send(user);
    });
    app.post('/auth/login', async (request, reply) => {
        const body = loginSchema.parse(request.body);
        const user = await login(body, request, reply);
        return reply.send(user);
    });
    app.post('/auth/login-hash', async (request, reply) => {
        const body = loginHashSchema.parse(request.body);
        const user = await loginWithHash(body, request, reply);
        return reply.send(user);
    });
    app.post('/auth/refresh', async (request, reply) => {
        await refreshTokens(request, reply);
        return reply.send({ ok: true });
    });
    app.post('/auth/logout', async (request, reply) => {
        logout(request, reply);
        return reply.send({ ok: true });
    });
    app.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
        const user = await findById(request.userId);
        if (!user) {
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        }
        return reply.send({
            id: String(user._id),
            name: user.name,
            email: user.email,
            idGraf: user.idGraf ?? null,
            role: user.role,
            isAdmin: Boolean(user.isAdmin ?? user.role === UserRole.ADMIN),
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
}
//# sourceMappingURL=auth.routes.js.map