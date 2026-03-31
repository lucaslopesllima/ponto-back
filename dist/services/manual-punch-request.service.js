import { Types } from 'mongoose';
import { ManualPunchRequestModel, ManualPunchRequestStatus, } from '../models/manual-punch-request.model.js';
import { TimeEntryModel } from '../models/time-entry.model.js';
import { HttpError } from '../lib/http-error.js';
import { adminCanActOnUserByIdGraf, approvalScopeUserIds, findById, } from './user.service.js';
import { getDayEntries, nextExpectedKind, normalizePunchKind, } from './time-entry.service.js';
import { NotificationModel, NotificationType, } from '../models/notification.model.js';
import * as webpush from 'web-push';
import { env } from '../config/env.js';
/** Margem para considerar o instante como retroativo (relógio do cliente). */
const SKEW_MS = 60_000;
export async function createManualPunchRequest(userId, timeZone, input) {
    const requested = new Date(input.timestamp);
    if (Number.isNaN(requested.getTime())) {
        throw new HttpError(400, 'Data/hora inválida', 'INVALID_TIMESTAMP');
    }
    const now = Date.now();
    if (requested.getTime() >= now - SKEW_MS) {
        throw new HttpError(400, 'Só é permitido solicitar horário retroativo (anterior ao momento atual).', 'NOT_RETROACTIVE');
    }
    const dayEntries = await getDayEntries(userId, timeZone, requested);
    const before = dayEntries.filter((e) => e.timestamp.getTime() < requested.getTime());
    const kind = nextExpectedKind(before);
    const dup = await TimeEntryModel.findOne({
        userId: new Types.ObjectId(userId),
        timestamp: requested,
    }).lean();
    if (dup) {
        throw new HttpError(400, 'Já existe um registro neste horário.', 'DUPLICATE_ENTRY');
    }
    const pendingDup = await ManualPunchRequestModel.findOne({
        userId: new Types.ObjectId(userId),
        timestamp: requested,
        status: ManualPunchRequestStatus.PENDENTE,
    }).lean();
    if (pendingDup) {
        throw new HttpError(400, 'Já existe uma solicitação pendente para este horário.', 'DUPLICATE_PENDING');
    }
    const doc = await ManualPunchRequestModel.create({
        userId: new Types.ObjectId(userId),
        timestamp: requested,
        type: kind,
        reason: input.reason.trim(),
        status: ManualPunchRequestStatus.PENDENTE,
    });
    return {
        id: String(doc._id),
        timestamp: doc.timestamp,
        type: doc.type,
        status: doc.status,
    };
}
export async function listMyManualPunchRequests(userId) {
    return ManualPunchRequestModel.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .lean();
}
/** `limit` 0 = sem paginação (retorna todos). */
export async function listPendingManualPunchRequests(adminId, opts) {
    const admin = await findById(adminId);
    if (!admin)
        throw new HttpError(401, 'Não autorizado');
    const scope = await approvalScopeUserIds(admin.idGraf);
    const filter = {
        status: ManualPunchRequestStatus.PENDENTE,
    };
    if (scope !== null) {
        filter.userId = { $in: scope };
    }
    const page = Math.max(1, opts.page);
    const limit = opts.limit;
    const total = await ManualPunchRequestModel.countDocuments(filter);
    let q = ManualPunchRequestModel.find(filter)
        .populate('userId', 'name email idGraf')
        .sort({ createdAt: 1 });
    if (limit > 0) {
        q = q.skip((page - 1) * limit).limit(limit);
    }
    const items = await q.lean();
    const totalPages = limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
    return { items, total, page, limit, totalPages };
}
export async function decideManualPunchRequest(adminId, requestId, approve) {
    const req = await ManualPunchRequestModel.findById(requestId);
    if (!req)
        throw new HttpError(404, 'Solicitação não encontrada');
    if (req.status !== ManualPunchRequestStatus.PENDENTE) {
        throw new HttpError(400, 'Solicitação já processada');
    }
    const admin = await findById(adminId);
    const targetUser = await findById(String(req.userId));
    if (!adminCanActOnUserByIdGraf(admin, targetUser)) {
        throw new HttpError(403, 'Sem permissão para esta solicitação', 'FORBIDDEN');
    }
    req.status = approve
        ? ManualPunchRequestStatus.APROVADO
        : ManualPunchRequestStatus.REJEITADO;
    req.approvedBy = new Types.ObjectId(adminId);
    req.decidedAt = new Date();
    if (approve) {
        const dup = await TimeEntryModel.findOne({
            userId: req.userId,
            timestamp: req.timestamp,
        }).lean();
        if (dup) {
            throw new HttpError(400, 'Já existe um registro neste horário.', 'DUPLICATE_ENTRY');
        }
        await TimeEntryModel.create({
            userId: req.userId,
            type: normalizePunchKind(String(req.type)),
            timestamp: req.timestamp,
            location: {
                lat: 0,
                lng: 0,
                address: 'Ponto manual (aprovado)',
            },
        });
    }
    await req.save();
    if (targetUser) {
        await NotificationModel.create({
            userId: req.userId,
            type: approve
                ? NotificationType.MANUAL_PUNCH_APPROVED
                : NotificationType.MANUAL_PUNCH_REJECTED,
            title: approve ? 'Ponto manual aprovado' : 'Ponto manual rejeitado',
            body: approve
                ? 'Sua solicitação de ponto manual foi aprovada e o registro foi incluído.'
                : 'Sua solicitação de ponto manual foi rejeitada.',
            metadata: { manualPunchRequestId: String(req._id) },
        });
        if (targetUser.pushSubscription &&
            env.VAPID_PUBLIC_KEY &&
            env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(env.VAPID_SUBJECT ?? 'mailto:support@example.com', env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
            try {
                await webpush.sendNotification(targetUser.pushSubscription, JSON.stringify({
                    title: approve ? 'Ponto manual aprovado' : 'Ponto manual rejeitado',
                }));
            }
            catch {
                /* ignore */
            }
        }
    }
    return req;
}
//# sourceMappingURL=manual-punch-request.service.js.map