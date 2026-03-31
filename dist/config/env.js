import { config } from 'dotenv';
import { z } from 'zod';
config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3333),
    MONGODB_URI: z.string().min(1),
    /** Vírgula. Inclua o front em produção (ex.: Vercel). */
    CORS_ORIGIN: z
        .string()
        .default('http://localhost:3000,http://127.0.0.1:3000,https://ponto-front.vercel.app'),
    API_PREFIX: z.string().default('/api/v1'),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional(),
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().optional(),
    /** Identificação do app para Nominatim (política de uso); padrão: Pontome/1.0 */
    GEOCODING_USER_AGENT: z.string().min(1).optional(),
});
function loadEnv() {
    const raw = { ...process.env };
    for (const k of [
        'BOOTSTRAP_ADMIN_EMAIL',
        'BOOTSTRAP_ADMIN_PASSWORD',
        'GEOCODING_USER_AGENT',
    ]) {
        if (raw[k] === '')
            delete raw[k];
    }
    const parsed = envSchema.safeParse(raw);
    if (!parsed.success) {
        console.error('Invalid environment variables:', parsed.error.flatten());
        throw new Error('Invalid environment configuration');
    }
    return parsed.data;
}
export const env = loadEnv();
//# sourceMappingURL=env.js.map