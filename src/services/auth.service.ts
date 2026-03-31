import {
  createUser,
  findByEmail,
  findByEmailWithHashLogin,
  findById,
  isLocked,
  recordFailedLogin,
  resetFailedLogin,
  verifyPassword,
} from './user.service.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.service.js';
import { auditLog } from './audit.service.js';
import { HttpError } from '../lib/http-error.js';
import { UserRole, type UserRoleType } from '../models/user.model.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

function cookieOptions(httpOnly: boolean, maxAgeMs: number) {
  const secure = env.NODE_ENV === 'production';
  return {
    path: '/',
    httpOnly,
    secure,
    sameSite: secure ? ('strict' as const) : ('lax' as const),
    maxAge: maxAgeMs,
  };
}

function parseMs(expires: string): number {
  const m = expires.match(/^(\d+)([smhd])$/);
  if (!m) return 15 * 60 * 1000;
  const n = Number(m[1]);
  const u = m[2];
  const mult = u === 's' ? 1000 : u === 'm' ? 60_000 : u === 'h' ? 3_600_000 : 86_400_000;
  return n * mult;
}

export function setAuthCookies(
  reply: FastifyReply,
  userId: string,
  role: UserRoleType
): void {
  const access = signAccessToken(userId, role);
  const refresh = signRefreshToken(userId);
  reply.setCookie(ACCESS_COOKIE, access, cookieOptions(true, parseMs(env.JWT_ACCESS_EXPIRES)));
  reply.setCookie(REFRESH_COOKIE, refresh, cookieOptions(true, parseMs(env.JWT_REFRESH_EXPIRES)));
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, { path: '/' });
  reply.clearCookie(REFRESH_COOKIE, { path: '/' });
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRoleType;
}): Promise<{
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  isAdmin: boolean;
}> {
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

export async function login(
  input: { email: string; password: string },
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  isAdmin: boolean;
}> {
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

export async function loginWithHash(
  input: { email: string; hash: string },
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  isAdmin: boolean;
}> {
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

export async function refreshTokens(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const raw = request.headers.cookie;
  const cookies = Object.fromEntries(
    (raw ?? '')
      .split(';')
      .map((p) => p.trim().split('='))
      .filter((x) => x.length >= 2)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );
  const refresh = cookies[REFRESH_COOKIE];
  if (!refresh) {
    throw new HttpError(401, 'Sessão expirada', 'NO_REFRESH');
  }
  let payload;
  try {
    payload = verifyRefreshToken(refresh);
  } catch {
    throw new HttpError(401, 'Sessão inválida', 'INVALID_REFRESH');
  }
  const user = await findById(payload.sub);
  if (!user) {
    throw new HttpError(401, 'Usuário não encontrado', 'USER_GONE');
  }
  setAuthCookies(reply, String(user._id), user.role);
}

export function logout(_request: FastifyRequest, reply: FastifyReply): void {
  clearAuthCookies(reply);
}
