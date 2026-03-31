import { z } from 'zod';
import { requireAdmin, authenticate } from '../../plugins/auth.plugin.js';
import { getGeofenceConfig, upsertGeofence } from '../../services/geofence.service.js';
const upsertSchema = z.object({
    center: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
    }),
    radiusMeters: z.number().min(10).max(50000),
    enabled: z.boolean(),
});
export async function geofenceRoutes(app) {
    app.get('/geofence', { preHandler: [authenticate] }, async (_request, reply) => {
        const cfg = await getGeofenceConfig();
        return reply.send(cfg);
    });
    app.put('/geofence', { preHandler: [requireAdmin] }, async (request, reply) => {
        const body = upsertSchema.parse(request.body);
        await upsertGeofence(body);
        return reply.send({ ok: true });
    });
}
//# sourceMappingURL=geofence.routes.js.map