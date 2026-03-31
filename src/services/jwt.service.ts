import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserRoleType } from '../models/user.model.js';

export interface AccessPayload {
  sub: string;
  role: UserRoleType;
  type: 'access';
}

export interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

export function signAccessToken(userId: string, role: UserRoleType): string {
  const payload: AccessPayload = { sub: userId, role, type: 'access' };
  const opts: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function signRefreshToken(userId: string): string {
  const payload: RefreshPayload = { sub: userId, type: 'refresh' };
  const opts: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as AccessPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}
