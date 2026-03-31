import type { Types } from 'mongoose';
import { AuditLogModel } from '../models/audit-log.model.js';
import { logger } from '../lib/logger.js';

export async function auditLog(params: {
  actorId?: Types.ObjectId | string | null;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await AuditLogModel.create({
      actorId: params.actorId ?? null,
      action: params.action,
      resource: params.resource,
      metadata: params.metadata,
      ip: params.ip,
      userAgent: params.userAgent,
    });
  } catch (e) {
    logger.error({ err: e }, 'auditLog failed');
  }
}
