import mongoose from 'mongoose';
import { env } from './config/env.js';
import { buildApp } from './app.js';
import { logger } from './lib/logger.js';
import { startNotificationCron } from './services/notification-cron.service.js';
import { seedBootstrap } from './scripts/seed.js';
async function main() {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
    await seedBootstrap();
    const app = await buildApp();
    startNotificationCron();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info({ port: env.PORT }, 'Server listening');
}
main().catch((err) => {
    logger.error(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map