import argon2 from 'argon2';
import { Types } from 'mongoose';
import {
  UserModel,
  UserRole,
  type ContractTypeValue,
  type IUser,
  type UserRoleType,
} from '../models/user.model.js';
import { HttpError } from '../lib/http-error.js';
import type { WorkSchedule, NotificationPreferences } from '../models/user.model.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRoleType;
  locale?: string;
  timezone?: string;
  workSchedule?: WorkSchedule;
  /** Segredo de login por hash (integração); armazenado com argon2 */
  hashLogin?: string | null;
}): Promise<IUser> {
  const email = data.email.trim().toLowerCase();
  const exists = await UserModel.findOne({ email });
  if (exists) {
    throw new HttpError(409, 'Email já cadastrado', 'EMAIL_EXISTS');
  }
  const passwordHash = await hashPassword(data.password);
  const plainHash = data.hashLogin?.trim();
  const hashLoginStored =
    plainHash && plainHash.length > 0 ? await hashPassword(plainHash) : undefined;
  return UserModel.create({
    name: data.name.trim(),
    email,
    passwordHash,
    ...(hashLoginStored ? { hashLogin: hashLoginStored } : {}),
    role: data.role ?? UserRole.USER,
    locale: data.locale ?? 'pt-BR',
    timezone: data.timezone ?? 'America/Sao_Paulo',
    workSchedule: data.workSchedule ?? {},
  });
}

export async function findByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email: email.trim().toLowerCase() });
}

/** Inclui `hashLogin` (campo com select:false) para autenticação por integração */
export async function findByEmailWithHashLogin(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email: email.trim().toLowerCase() }).select('+hashLogin').exec();
}

export async function findById(id: string): Promise<IUser | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return UserModel.findById(id);
}

/**
 * Escopo de aprovações por `idGraf`: admin **sem** `idGraf` vê todas as solicitações;
 * admin **com** `idGraf` só vê pedidos de usuários com o mesmo `idGraf`.
 * Retorna `null` = sem filtro em `userId`; senão `userId` deve estar em `$in` (pode ser array vazio).
 */
export async function approvalScopeUserIds(
  adminIdGraf: string | null | undefined
): Promise<Types.ObjectId[] | null> {
  const g = adminIdGraf?.trim();
  if (!g) return null;
  const rows = await UserModel.find({ idGraf: g }).select('_id').lean();
  return rows.map((r) => r._id);
}

/** Admin sem `idGraf` pode aprovar qualquer um; com `idGraf`, só usuários com o mesmo valor. */
export function adminCanActOnUserByIdGraf(
  admin: IUser | null,
  targetUser: IUser | null
): boolean {
  if (!admin) return false;
  const ga = admin.idGraf?.trim();
  if (!ga) return true;
  return targetUser != null && targetUser.idGraf?.trim() === ga;
}

export async function recordFailedLogin(user: IUser): Promise<void> {
  const attempts = user.failedLoginAttempts + 1;
  const lockedUntil =
    attempts >= MAX_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : user.lockedUntil;
  await UserModel.updateOne(
    { _id: user._id },
    { failedLoginAttempts: attempts, lockedUntil }
  );
}

export async function resetFailedLogin(userId: Types.ObjectId): Promise<void> {
  await UserModel.updateOne(
    { _id: userId },
    { failedLoginAttempts: 0, lockedUntil: null }
  );
}

export function isLocked(user: IUser): boolean {
  if (!user.lockedUntil) return false;
  return user.lockedUntil > new Date();
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    locale?: string;
    timezone?: string;
    contractType?: ContractTypeValue;
    hourlyRateBrl?: number | null;
    workSchedule?: WorkSchedule;
    notificationPreferences?: NotificationPreferences;
  }
): Promise<IUser | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  const found = await UserModel.findById(userId).select('_id');
  if (!found) return null;

  const $set: Record<string, unknown> = {};
  if (data.name !== undefined) $set.name = data.name;
  if (data.locale !== undefined) $set.locale = data.locale;
  if (data.timezone !== undefined) $set.timezone = data.timezone;
  if (data.contractType !== undefined) $set.contractType = data.contractType;
  if (data.hourlyRateBrl !== undefined) $set.hourlyRateBrl = data.hourlyRateBrl;
  // Notação por campo: substituir o subdocumento inteiro faz o Mongoose reaplicar defaults
  // e pode voltar `true` em booleans que deveriam ser `false`.
  if (data.workSchedule !== undefined) {
    for (const [key, value] of Object.entries(data.workSchedule)) {
      if (value !== undefined) {
        $set[`workSchedule.${key}`] = value;
      }
    }
  }
  if (data.notificationPreferences !== undefined) {
    for (const [key, value] of Object.entries(data.notificationPreferences)) {
      if (value !== undefined) {
        $set[`notificationPreferences.${key}`] = value;
      }
    }
  }

  return UserModel.findByIdAndUpdate(userId, { $set }, { new: true }).exec();
}

export async function listUsersForAdmin(adminIdGraf?: string | null) {
  const g = adminIdGraf?.trim();
  const filter = g ? { idGraf: g } : {};
  return UserModel.find(filter)
    .select('-passwordHash -hashLogin')
    .sort({ name: 1 })
    .lean()
    .exec();
}

export async function setPushSubscription(userId: string, subscription: object | null): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { pushSubscription: subscription });
}
