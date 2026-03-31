import { authenticate } from '../../plugins/auth.plugin.js';
import { getNextBrazilHoliday } from '../../services/holidays.service.js';
import { findById } from '../../services/user.service.js';
export async function holidaysRoutes(app) {
    app.get('/holidays/next', { preHandler: [authenticate] }, async (request, reply) => {
        const user = await findById(request.userId);
        if (!user)
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        const tz = user.timezone ?? 'America/Sao_Paulo';
        const next = await getNextBrazilHoliday(tz);
        return reply.send({ next });
    });
}
//# sourceMappingURL=holidays.routes.js.map