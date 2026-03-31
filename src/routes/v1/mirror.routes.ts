import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../plugins/auth.plugin.js';
import { getMirrorDateRange, getMirrorMonth } from '../../services/time-entry.service.js';
import { findById } from '../../services/user.service.js';

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const querySchema = z
  .object({
    from: ymd.optional(),
    to: ymd.optional(),
    year: z.coerce.number().min(2000).max(2100).optional(),
    month: z.coerce.number().min(1).max(12).optional(),
  })
  .refine(
    (q) =>
      (q.from != null && q.to != null) || (q.year != null && q.month != null),
    { message: 'Informe from e to, ou year e month' }
  )
  .refine((q) => !(q.from && q.to) || q.from <= q.to, {
    message: 'Data início deve ser anterior ou igual à data fim',
  });

export async function mirrorRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/mirror',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const q = querySchema.parse(request.query);
      const user = await findById(request.userId!);
      if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });

      if (q.from != null && q.to != null) {
        const days = await getMirrorDateRange(user, q.from, q.to);
        return reply.send({ from: q.from, to: q.to, days });
      }

      const days = await getMirrorMonth(user, q.year!, q.month!);
      return reply.send({ year: q.year, month: q.month, days });
    }
  );
}
