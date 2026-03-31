import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/auth.plugin.js';
import { getNextBrazilHoliday } from '../../services/holidays.service.js';
import { findById } from '../../services/user.service.js';

export async function holidaysRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/holidays/next',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = await findById(request.userId!);
      if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });
      const tz = user.timezone ?? 'America/Sao_Paulo';
      const next = await getNextBrazilHoliday(tz);
      return reply.send({ next });
    }
  );
}
