import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    MONGODB_URI: z.ZodString;
    /** Vírgula: inclua `http://127.0.0.1:3000` se o front for aberto por IP (origem diferente de `localhost`). */
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    API_PREFIX: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES: z.ZodDefault<z.ZodString>;
    BOOTSTRAP_ADMIN_EMAIL: z.ZodOptional<z.ZodString>;
    BOOTSTRAP_ADMIN_PASSWORD: z.ZodOptional<z.ZodString>;
    VAPID_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
    VAPID_PRIVATE_KEY: z.ZodOptional<z.ZodString>;
    VAPID_SUBJECT: z.ZodOptional<z.ZodString>;
    /** Identificação do app para Nominatim (política de uso); padrão: Pontome/1.0 */
    GEOCODING_USER_AGENT: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGODB_URI: string;
    CORS_ORIGIN: string;
    API_PREFIX: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES: string;
    BOOTSTRAP_ADMIN_EMAIL?: string | undefined;
    BOOTSTRAP_ADMIN_PASSWORD?: string | undefined;
    VAPID_PUBLIC_KEY?: string | undefined;
    VAPID_PRIVATE_KEY?: string | undefined;
    VAPID_SUBJECT?: string | undefined;
    GEOCODING_USER_AGENT?: string | undefined;
}, {
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    CORS_ORIGIN?: string | undefined;
    API_PREFIX?: string | undefined;
    JWT_ACCESS_EXPIRES?: string | undefined;
    JWT_REFRESH_EXPIRES?: string | undefined;
    BOOTSTRAP_ADMIN_EMAIL?: string | undefined;
    BOOTSTRAP_ADMIN_PASSWORD?: string | undefined;
    VAPID_PUBLIC_KEY?: string | undefined;
    VAPID_PRIVATE_KEY?: string | undefined;
    VAPID_SUBJECT?: string | undefined;
    GEOCODING_USER_AGENT?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    MONGODB_URI: string;
    CORS_ORIGIN: string;
    API_PREFIX: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES: string;
    BOOTSTRAP_ADMIN_EMAIL?: string | undefined;
    BOOTSTRAP_ADMIN_PASSWORD?: string | undefined;
    VAPID_PUBLIC_KEY?: string | undefined;
    VAPID_PRIVATE_KEY?: string | undefined;
    VAPID_SUBJECT?: string | undefined;
    GEOCODING_USER_AGENT?: string | undefined;
};
export {};
//# sourceMappingURL=env.d.ts.map