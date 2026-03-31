import { Types } from 'mongoose';
import {
  AdjustmentModel,
  AdjustmentStatus,
  AdjustmentKind,
  type AdjustmentKindValue,
} from '../models/adjustment.model.js';
import { AdjustmentLogModel } from '../models/adjustment-log.model.js';
import { HttpError } from '../lib/http-error.js';
import { UserRole } from '../models/user.model.js';
import {
  adminCanActOnUserByIdGraf,
  approvalScopeUserIds,
  findById,
} from './user.service.js';
import {
  NotificationModel,
  NotificationType,
} from '../models/notification.model.js';
import * as webpush from 'web-push';
import { env } from '../config/env.js';

export async function createAdjustmentRequest(
  userId: string,
  input: {
    date: string; // YYYY-MM-DD
    kind: AdjustmentKindValue;
    reason: string;
    proposedChanges?: {
      entrada1?: string | null;
      saida1?: string | null;
      entrada2?: string | null;
      saida2?: string | null;
    };
  }
) {
  const date = new Date(`${input.date}T12:00:00.000Z`);
  const doc = await AdjustmentModel.create({
    userId: new Types.ObjectId(userId),
    date,
    kind: input.kind,
    reason: input.reason.trim(),
    status: AdjustmentStatus.PENDENTE,
  });
  await AdjustmentLogModel.create({
    adjustmentId: doc._id,
    actorId: new Types.ObjectId(userId),
    action: 'CREATED',
    payload: { kind: input.kind },
  });
  return doc;
}

export async function listMyAdjustments(userId: string) {
  return AdjustmentModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean();
}

/** `limit` 0 = sem paginação (retorna todos). */
export async function listPendingAdjustments(
  adminId: string,
  opts: { page: number; limit: number }
) {
  const admin = await findById(adminId);
  if (!admin) throw new HttpError(401, 'Não autorizado');
  const scope = await approvalScopeUserIds(admin.idGraf);
  const filter: Record<string, unknown> = { status: AdjustmentStatus.PENDENTE };
  if (scope !== null) {
    filter.userId = { $in: scope };
  }
  const page = Math.max(1, opts.page);
  const limit = opts.limit;
  const total = await AdjustmentModel.countDocuments(filter);
  let q = AdjustmentModel.find(filter)
    .populate('userId', 'name email idGraf')
    .sort({ createdAt: 1 });
  if (limit > 0) {
    q = q.skip((page - 1) * limit).limit(limit);
  }
  const items = await q.lean();
  const totalPages = limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
  return { items, total, page, limit, totalPages };
}

export async function decideAdjustment(
  adminId: string,
  adjustmentId: string,
  approve: boolean
) {
  const adj = await AdjustmentModel.findById(adjustmentId);
  if (!adj) throw new HttpError(404, 'Solicitação não encontrada');
  if (adj.status !== AdjustmentStatus.PENDENTE) {
    throw new HttpError(400, 'Solicitação já processada');
  }
  const admin = await findById(adminId);
  const targetUser = await findById(String(adj.userId));
  if (!adminCanActOnUserByIdGraf(admin, targetUser)) {
    throw new HttpError(403, 'Sem permissão para esta solicitação', 'FORBIDDEN');
  }
  adj.status = approve ? AdjustmentStatus.APROVADO : AdjustmentStatus.REJEITADO;
  adj.approvedBy = new Types.ObjectId(adminId);
  adj.decidedAt = new Date();
  await adj.save();

  await AdjustmentLogModel.create({
    adjustmentId: adj._id,
    actorId: new Types.ObjectId(adminId),
    action: approve ? 'APPROVED' : 'REJECTED',
    payload: {},
  });

  if (targetUser) {
    await NotificationModel.create({
      userId: adj.userId,
      type: approve
        ? NotificationType.ADJUSTMENT_APPROVED
        : NotificationType.ADJUSTMENT_REJECTED,
      title: approve ? 'Ajuste aprovado' : 'Ajuste rejeitado',
      body: approve
        ? 'Sua solicitação de ajuste foi aprovada.'
        : 'Sua solicitação de ajuste foi rejeitada.',
      metadata: { adjustmentId: String(adj._id) },
    });

    if (
      targetUser.pushSubscription &&
      env.VAPID_PUBLIC_KEY &&
      env.VAPID_PRIVATE_KEY
    ) {
      webpush.setVapidDetails(
        env.VAPID_SUBJECT ?? 'mailto:support@example.com',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );
      try {
        await webpush.sendNotification(
          targetUser.pushSubscription as webpush.PushSubscription,
          JSON.stringify({
            title: approve ? 'Ajuste aprovado' : 'Ajuste rejeitado',
          })
        );
      } catch {
        /* ignore push errors */
      }
    }
  }

  return adj;
}

export async function assertAdmin(userId: string): Promise<void> {
  const u = await findById(userId);
  if (!u || u.role !== UserRole.ADMIN) {
    throw new HttpError(403, 'Apenas administradores', 'FORBIDDEN');
  }
}
