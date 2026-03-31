import { z } from 'zod';
import { authenticate, requireAdmin } from '../../plugins/auth.plugin.js';
import { createAdjustmentRequest, listMyAdjustments, listPendingAdjustments, decideAdjustment, } from '../../services/adjustment.service.js';
import { AdjustmentKind } from '../../models/adjustment.model.js';
import { auditLog } from '../../services/audit.service.js';
const pendingListQuerySchema = z.object({
    page: z.preprocess((v) => (v === undefined || v === '' ? 1 : v), z.coerce.number().int().min(1)),
    limit: z.preprocess((v) => (v === undefined || v === '' ? 10 : v), z.coerce.number().int().refine((n) => [0, 5, 10, 20, 50, 100].includes(n), 'limit deve ser 0, 5, 10, 20, 50 ou 100')),
});
const createSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    kind: z.nativeEnum(AdjustmentKind),
    reason: z.string().min(1).max(4000),
    proposedChanges: z
        .object({
        entrada1: z.string().nullable().optional(),
        saida1: z.string().nullable().optional(),
        entrada2: z.string().nullable().optional(),
        saida2: z.string().nullable().optional(),
    })
        .optional(),
});
export async function adjustmentRoutes(app) {
    app.post('/adjustments', { preHandler: [authenticate] }, async (request, reply) => {
        const body = createSchema.parse(request.body);
        const doc = await createAdjustmentRequest(request.userId, body);
        await auditLog({
            actorId: request.userId,
            action: 'ADJUSTMENT_CREATED',
            resource: 'adjustment',
            metadata: { id: String(doc._id) },
            ip: request.ip,
        });
        return reply.status(201).send({ id: String(doc._id) });
    });
    app.get('/adjustments/mine', { preHandler: [authenticate] }, async (request, reply) => {
        const list = await listMyAdjustments(request.userId);
        return reply.send(list);
    });
    app.get('/adjustments/pending', { preHandler: [requireAdmin] }, async (request, reply) => {
        const q = pendingListQuerySchema.parse(request.query ?? {});
        const list = await listPendingAdjustments(request.userId, {
            page: q.page,
            limit: q.limit,
        });
        return reply.send(list);
    });
    app.post('/adjustments/:id/decide', { preHandler: [requireAdmin] }, async (request, reply) => {
        const { id } = request.params;
        const body = z.object({ approve: z.boolean() }).parse(request.body);
        const adj = await decideAdjustment(request.userId, id, body.approve);
        await auditLog({
            actorId: request.userId,
            action: body.approve ? 'ADJUSTMENT_APPROVED' : 'ADJUSTMENT_REJECTED',
            resource: 'adjustment',
            metadata: { id },
            ip: request.ip,
        });
        return reply.send({ id: String(adj._id), status: adj.status });
    });
}
//# sourceMappingURL=adjustment.routes.js.map