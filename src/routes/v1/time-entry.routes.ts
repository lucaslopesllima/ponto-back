import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../plugins/auth.plugin.js';
import {
  createPunch,
  getTodayEntries,
  nextExpectedKind,
} from '../../services/time-entry.service.js';
import { findById } from '../../services/user.service.js';
import { auditLog } from '../../services/audit.service.js';

const punchSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function timeEntryRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/time-entries/next',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = await findById(request.userId!);
      if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });
      const today = await getTodayEntries(request.userId!, user.timezone);
      const next = nextExpectedKind(today);
      return reply.send({ nextExpected: next, todayCount: today.length });
    }
  );

  app.post(
    '/time-entries',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = punchSchema.parse(request.body);
      const user = await findById(request.userId!);
      if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });
      const result = await createPunch(request.userId!, user.timezone, body);
      await auditLog({
        actorId: user._id,
        action: 'PUNCH',
        resource: 'time_entry',
        metadata: { id: result.id },
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
      return reply.status(201).send(result);
    }
  );
}
