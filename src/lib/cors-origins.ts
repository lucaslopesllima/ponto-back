import { env } from '../config/env.js';

/** Sempre permitidos em produção (evita CORS quebrado se CORS_ORIGIN na Vercel estiver incompleto). */
const DEFAULT_VERCEL_ORIGINS = [
  'https://ponto-front.vercel.app',
  'https://ponto-back.vercel.app',
] as const;

export function buildAllowedCorsOrigins(): string[] {
  const fromEnv = env.CORS_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...fromEnv, ...DEFAULT_VERCEL_ORIGINS])];
}

/**
 * Aceita origem exata da lista ou previews da Vercel (`ponto-front-*.vercel.app`).
 * Também ignora espaços extras no header Origin.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const o = origin.trim();
  if (!o) return true;
  if (buildAllowedCorsOrigins().includes(o)) return true;
  return /^https:\/\/ponto-front[^.]*\.vercel\.app$/i.test(o);
}
