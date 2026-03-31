import { Types } from 'mongoose';
import { type ContractTypeValue, type IUser, type UserRoleType } from '../models/user.model.js';
import type { WorkSchedule, NotificationPreferences } from '../models/user.model.js';
export declare function hashPassword(plain: string): Promise<string>;
export declare function verifyPassword(hash: string, plain: string): Promise<boolean>;
export declare function createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRoleType;
    locale?: string;
    timezone?: string;
    workSchedule?: WorkSchedule;
    /** Segredo de login por hash (integração); armazenado com argon2 */
    hashLogin?: string | null;
}): Promise<IUser>;
export declare function findByEmail(email: string): Promise<IUser | null>;
/** Inclui `hashLogin` (campo com select:false) para autenticação por integração */
export declare function findByEmailWithHashLogin(email: string): Promise<IUser | null>;
export declare function findById(id: string): Promise<IUser | null>;
/**
 * Escopo de aprovações por `idGraf`: admin **sem** `idGraf` vê todas as solicitações;
 * admin **com** `idGraf` só vê pedidos de usuários com o mesmo `idGraf`.
 * Retorna `null` = sem filtro em `userId`; senão `userId` deve estar em `$in` (pode ser array vazio).
 */
export declare function approvalScopeUserIds(adminIdGraf: string | null | undefined): Promise<Types.ObjectId[] | null>;
/** Admin sem `idGraf` pode aprovar qualquer um; com `idGraf`, só usuários com o mesmo valor. */
export declare function adminCanActOnUserByIdGraf(admin: IUser | null, targetUser: IUser | null): boolean;
export declare function recordFailedLogin(user: IUser): Promise<void>;
export declare function resetFailedLogin(userId: Types.ObjectId): Promise<void>;
export declare function isLocked(user: IUser): boolean;
export declare function updateProfile(userId: string, data: {
    name?: string;
    locale?: string;
    timezone?: string;
    contractType?: ContractTypeValue;
    hourlyRateBrl?: number | null;
    workSchedule?: WorkSchedule;
    notificationPreferences?: NotificationPreferences;
}): Promise<IUser | null>;
export declare function listUsersForAdmin(adminIdGraf?: string | null): Promise<(import("mongoose").FlattenMaps<IUser> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function setPushSubscription(userId: string, subscription: object | null): Promise<void>;
//# sourceMappingURL=user.service.d.ts.map