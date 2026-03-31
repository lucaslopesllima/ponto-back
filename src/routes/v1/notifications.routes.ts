import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/auth.plugin.js';
import { NotificationModel } from '../../models/notification.model.js';
import { Types } from 'mongoose';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/notifications',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const list = await NotificationModel.find({
        userId: new Types.ObjectId(request.userId!),
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return reply.send(list);
    }
  );

  app.patch(
    '/notifications/:id/read',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await NotificationModel.updateOne(
        { _id: id, userId: new Types.ObjectId(request.userId!) },
        { read: true }
      );
      return reply.send({ ok: true });
    }
  );
}
