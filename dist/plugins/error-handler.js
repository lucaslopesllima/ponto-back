import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';
import { env } from '../config/env.js';
export function registerErrorHandler(app) {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof ZodError) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: 'Dados inválidos',
                details: error.flatten(),
            });
        }
        if (error instanceof HttpError) {
            return reply.status(error.statusCode).send({
                error: error.code ?? 'HttpError',
                message: error.message,
            });
        }
        if (error.validation) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: error.message,
            });
        }
        request.log.error({ err: error }, 'unhandled error');
        const message = env.NODE_ENV === 'production' ? 'Erro interno do servidor' : error.message;
        return reply.status(error.statusCode ?? 500).send({
            error: 'InternalError',
            message,
        });
    });
}
//# sourceMappingURL=error-handler.js.map