import { createUser, findByEmail, findByEmailWithHashLogin, findById, isLocked, recordFailedLogin, resetFailedLogin, verifyPassword, } from './user.service.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.service.js';
import { auditLog } from './audit.service.js';
import { HttpError } from '../lib/http-error.js';
import { UserRole } from '../models/user.model.js';
import { env } from '../config/env.js';
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
function cookieOptions(httpOnly, maxAgeMs) {
    const secure = env.NODE_ENV === 'production';
    return {
        path: '/',
        httpOnly,
        secure,
        sameSite: secure ? 'strict' : 'lax',
        maxAge: maxAgeMs,
    };
}
function parseMs(expires) {
    const m = expires.match(/^(\d+)([smhd])$/);
    if (!m)
        return 15 * 60 * 1000;
    const n = Number(m[1]);
    const u = m[2];
    const mult = u === 's' ? 1000 : u === 'm' ? 60_000 : u === 'h' ? 3_600_000 : 86_400_000;
    return n * mult;
}
export function setAuthCookies(reply, userId, role) {
    const access = signAccessToken(userId, role);
    const refresh = signRefreshToken(userId);
    reply.setCookie(ACCESS_COOKIE, access, cookieOptions(true, parseMs(env.JWT_ACCESS_EXPIRES)));
    reply.setCookie(REFRESH_COOKIE, refresh, cookieOptions(true, parseMs(env.JWT_REFRESH_EXPIRES)));
}
export function clearAuthCookies(reply) {
    reply.clearCookie(ACCESS_COOKIE, { path: '/' });
    reply.clearCookie(REFRESH_COOKIE, { path: '/' });
}
export async function registerUser(input) {
    const user = await createUser({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
    });
    return {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: Boolean(user.isAdmin ?? user.role === UserRole.ADMIN),
    };
}
export async function login(input, request, reply) {
    const user = await findByEmail(input.email);
    const ip = request.ip;
    const ua = request.headers['user-agent'];
    if (!user) {
        await auditLog({
            action: 'LOGIN_FAILED',
            resource: 'auth',
            metadata: { email: input.email, reason: 'user_not_found' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }
    if (isLocked(user)) {
        await auditLog({
            actorId: user._id,
            action: 'LOGIN_BLOCKED',
            resource: 'auth',
            metadata: { reason: 'account_locked' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(423, 'Conta temporariamente bloqueada. Tente mais tarde.', 'LOCKED');
    }
    const ok = await verifyPassword(user.passwordHash, input.password);
    if (!ok) {
        await recordFailedLogin(user);
        await auditLog({
            actorId: user._id,
            action: 'LOGIN_FAILED',
            resource: 'auth',
            metadata: { reason: 'bad_password' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }
    await resetFailedLogin(user._id);
    setAuthCookies(reply, String(user._id), user.role);
    await auditLog({
        actorId: user._id,
        action: 'LOGIN_SUCCESS',
        resource: 'auth',
        ip,
        userAgent: ua,
    });
    const isAdmin = Boolean(user.isAdmin ?? user.role === UserRole.ADMIN);
    return {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin,
    };
}
export async function loginWithHash(input, request, reply) {
    const user = await findByEmailWithHashLogin(input.email);
    const ip = request.ip;
    const ua = request.headers['user-agent'];
    if (!user) {
        await auditLog({
            action: 'LOGIN_FAILED',
            resource: 'auth',
            metadata: { email: input.email, reason: 'user_not_found', method: 'hash' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }
    if (!user.hashLogin) {
        await auditLog({
            actorId: user._id,
            action: 'LOGIN_FAILED',
            resource: 'auth',
            metadata: { reason: 'hash_login_not_configured' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }
    if (isLocked(user)) {
        await auditLog({
            actorId: user._id,
            action: 'LOGIN_BLOCKED',
            resource: 'auth',
            metadata: { reason: 'account_locked', method: 'hash' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(423, 'Conta temporariamente bloqueada. Tente mais tarde.', 'LOCKED');
    }
    const ok = await verifyPassword(user.hashLogin, input.hash);
    if (!ok) {
        await recordFailedLogin(user);
        await auditLog({
            actorId: user._id,
            action: 'LOGIN_FAILED',
            resource: 'auth',
            metadata: { reason: 'bad_hash_login' },
            ip,
            userAgent: ua,
        });
        throw new HttpError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }
    await resetFailedLogin(user._id);
    setAuthCookies(reply, String(user._id), user.role);
    await auditLog({
        actorId: user._id,
        action: 'LOGIN_SUCCESS',
        resource: 'auth',
        metadata: { method: 'hash' },
        ip,
        userAgent: ua,
    });
    const isAdmin = Boolean(user.isAdmin ?? user.role === UserRole.ADMIN);
    return {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin,
    };
}
export async function refreshTokens(request, reply) {
    const raw = request.headers.cookie;
    const cookies = Object.fromEntries((raw ?? '')
        .split(';')
        .map((p) => p.trim().split('='))
        .filter((x) => x.length >= 2)
        .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
    const refresh = cookies[REFRESH_COOKIE];
    if (!refresh) {
        throw new HttpError(401, 'Sessão expirada', 'NO_REFRESH');
    }
    let payload;
    try {
        payload = verifyRefreshToken(refresh);
    }
    catch {
        throw new HttpError(401, 'Sessão inválida', 'INVALID_REFRESH');
    }
    const user = await findById(payload.sub);
    if (!user) {
        throw new HttpError(401, 'Usuário não encontrado', 'USER_GONE');
    }
    setAuthCookies(reply, String(user._id), user.role);
}
export function logout(_request, reply) {
    clearAuthCookies(reply);
}
//# sourceMappingURL=auth.service.js.map