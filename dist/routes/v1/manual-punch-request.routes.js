import { z } from 'zod';
import { authenticate, requireAdmin } from '../../plugins/auth.plugin.js';
import { createManualPunchRequest, listMyManualPunchRequests, listPendingManualPunchRequests, decideManualPunchRequest, } from '../../services/manual-punch-request.service.js';
import { findById } from '../../services/user.service.js';
import { auditLog } from '../../services/audit.service.js';
const pendingListQuerySchema = z.object({
    page: z.preprocess((v) => (v === undefined || v === '' ? 1 : v), z.coerce.number().int().min(1)),
    limit: z.preprocess((v) => (v === undefined || v === '' ? 10 : v), z.coerce.number().int().refine((n) => [0, 5, 10, 20, 50, 100].includes(n), 'limit deve ser 0, 5, 10, 20, 50 ou 100')),
});
const createSchema = z.object({
    timestamp: z.string().min(1),
    reason: z.string().min(1).max(4000),
});
export async function manualPunchRequestRoutes(app) {
    app.post('/manual-punch-requests', { preHandler: [authenticate] }, async (request, reply) => {
        const body = createSchema.parse(request.body);
        const user = await findById(request.userId);
        if (!user)
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        const result = await createManualPunchRequest(request.userId, user.timezone, {
            timestamp: body.timestamp,
            reason: body.reason,
        });
        await auditLog({
            actorId: request.userId,
            action: 'MANUAL_PUNCH_REQUEST_CREATED',
            resource: 'manual_punch_request',
            metadata: { id: result.id },
            ip: request.ip,
            userAgent: request.headers['user-agent'],
        });
        return reply.status(201).send(result);
    });
    app.get('/manual-punch-requests/mine', { preHandler: [authenticate] }, async (request, reply) => {
        const list = await listMyManualPunchRequests(request.userId);
        return reply.send(list);
    });
    app.get('/manual-punch-requests/pending', { preHandler: [requireAdmin] }, async (request, reply) => {
        const q = pendingListQuerySchema.parse(request.query ?? {});
        const list = await listPendingManualPunchRequests(request.userId, {
            page: q.page,
            limit: q.limit,
        });
        return reply.send(list);
    });
    app.post('/manual-punch-requests/:id/decide', { preHandler: [requireAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({ approve: z.boolean() }).parse(request.body);
        const doc = await decideManualPunchRequest(request.userId, id, body.approve);
        await auditLog({
            actorId: request.userId,
            action: body.approve ? 'MANUAL_PUNCH_APPROVED' : 'MANUAL_PUNCH_REJECTED',
            resource: 'manual_punch_request',
            metadata: { id },
            ip: request.ip,
        });
        return reply.send({
            id: String(doc._id),
            status: doc.status,
        });
    });
}
//# sourceMappingURL=manual-punch-request.routes.js.map