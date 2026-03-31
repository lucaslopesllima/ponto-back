import { AuditLogModel } from '../models/audit-log.model.js';
import { logger } from '../lib/logger.js';
export async function auditLog(params) {
    try {
        await AuditLogModel.create({
            actorId: params.actorId ?? null,
            action: params.action,
            resource: params.resource,
            metadata: params.metadata,
            ip: params.ip,
            userAgent: params.userAgent,
        });
    }
    catch (e) {
        logger.error({ err: e }, 'auditLog failed');
    }
}
//# sourceMappingURL=audit.service.js.map