import type { UserRoleType } from '../models/user.model.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    userRole?: UserRoleType;
  }
}
