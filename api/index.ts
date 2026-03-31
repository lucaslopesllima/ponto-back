/**
 * Entrada serverless na Vercel: encaminha todas as rotas para o Fastify.
 * Sem este arquivo, o deploy na Vercel não expõe o servidor Node como em `npm start`.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { buildApp } from '../src/app.js';

declare global {
  // eslint-disable-next-line no-var
  var __pontome_fastify: Promise<Awaited<ReturnType<typeof buildApp>>> | undefined;
}

async function getApp(): Promise<Awaited<ReturnType<typeof buildApp>>> {
  if (!globalThis.__pontome_fastify) {
    globalThis.__pontome_fastify = (async () => {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(env.MONGODB_URI);
      }
      const app = await buildApp();
      await app.ready();
      return app;
    })();
  }
  return globalThis.__pontome_fastify;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const app = await getApp();
  app.server.emit('request', req, res);
}
