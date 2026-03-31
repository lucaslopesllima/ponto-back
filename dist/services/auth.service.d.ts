import { type UserRoleType } from '../models/user.model.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
export declare function setAuthCookies(reply: FastifyReply, userId: string, role: UserRoleType): void;
export declare function clearAuthCookies(reply: FastifyReply): void;
export declare function registerUser(input: {
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
}>;
export declare function login(input: {
    email: string;
    password: string;
}, request: FastifyRequest, reply: FastifyReply): Promise<{
    id: string;
    email: string;
    name: string;
    role: UserRoleType;
    isAdmin: boolean;
}>;
export declare function loginWithHash(input: {
    email: string;
    hash: string;
}, request: FastifyRequest, reply: FastifyReply): Promise<{
    id: string;
    email: string;
    name: string;
    role: UserRoleType;
    isAdmin: boolean;
}>;
export declare function refreshTokens(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function logout(_request: FastifyRequest, reply: FastifyReply): void;
//# sourceMappingURL=auth.service.d.ts.map