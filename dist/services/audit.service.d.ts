import type { Types } from 'mongoose';
export declare function auditLog(params: {
    actorId?: Types.ObjectId | string | null;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
}): Promise<void>;
//# sourceMappingURL=audit.service.d.ts.map