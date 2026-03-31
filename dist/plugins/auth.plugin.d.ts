import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { type UserRoleType } from '../models/user.model.js';
export declare function parseCookies(header?: string): Record<string, string>;
export declare function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
export declare function requireRole(roles: UserRoleType[]): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
export declare const requireAdmin: (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
export declare function registerAuthHelpers(app: FastifyInstance): void;
//# sourceMappingURL=auth.plugin.d.ts.map