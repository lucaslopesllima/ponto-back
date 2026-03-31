import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { UserModel, UserRole } from '../models/user.model.js';
import { hashPassword } from '../services/user.service.js';
import { logger } from '../lib/logger.js';
export async function seedBootstrap() {
    if (!env.BOOTSTRAP_ADMIN_EMAIL || !env.BOOTSTRAP_ADMIN_PASSWORD) {
        return;
    }
    const exists = await UserModel.findOne({
        email: env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
    });
    if (exists)
        return;
    const passwordHash = await hashPassword(env.BOOTSTRAP_ADMIN_PASSWORD);
    await UserModel.create({
        name: 'Administrador',
        email: env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: UserRole.ADMIN,
    });
    logger.info({ email: env.BOOTSTRAP_ADMIN_EMAIL }, 'Bootstrap admin created');
}
/** CLI: npm run seed */
async function cli() {
    await mongoose.connect(env.MONGODB_URI);
    await seedBootstrap();
    await mongoose.disconnect();
}
if (process.argv[1]?.includes('seed')) {
    cli().catch(console.error);
}
//# sourceMappingURL=seed.js.map