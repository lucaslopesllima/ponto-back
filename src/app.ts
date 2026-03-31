import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { authRoutes } from './routes/v1/auth.routes.js';
import { timeEntryRoutes } from './routes/v1/time-entry.routes.js';
import { mirrorRoutes } from './routes/v1/mirror.routes.js';
import { reportsRoutes } from './routes/v1/reports.routes.js';
import { adjustmentRoutes } from './routes/v1/adjustment.routes.js';
import { usersRoutes } from './routes/v1/users.routes.js';
import { geofenceRoutes } from './routes/v1/geofence.routes.js';
import { notificationsRoutes } from './routes/v1/notifications.routes.js';
import { holidaysRoutes } from './routes/v1/holidays.routes.js';
import { manualPunchRequestRoutes } from './routes/v1/manual-punch-request.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  });

  registerErrorHandler(app);

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  await app.register(
    async (v1) => {
      await v1.register(authRoutes);
      await v1.register(timeEntryRoutes);
      await v1.register(mirrorRoutes);
      await v1.register(reportsRoutes);
      await v1.register(adjustmentRoutes);
      await v1.register(usersRoutes);
      await v1.register(geofenceRoutes);
      await v1.register(notificationsRoutes);
      await v1.register(holidaysRoutes);
      await v1.register(manualPunchRequestRoutes);
    },
    { prefix: env.API_PREFIX }
  );

  return app;
}
