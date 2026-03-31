import { verifyAccessToken } from '../services/jwt.service.js';
import { UserRole } from '../models/user.model.js';
import { HttpError } from '../lib/http-error.js';
const ACCESS_COOKIE = 'access_token';
export function parseCookies(header) {
    const out = {};
    if (!header)
        return out;
    for (const part of header.split(';')) {
        const [k, ...rest] = part.trim().split('=');
        if (k && rest.length)
            out[k] = decodeURIComponent(rest.join('='));
    }
    return out;
}
function getTokenFromRequest(request) {
    const raw = request.headers.cookie;
    const cookies = parseCookies(raw);
    return cookies[ACCESS_COOKIE];
}
export async function authenticate(request, _reply) {
    const token = getTokenFromRequest(request);
    if (!token) {
        throw new HttpError(401, 'Não autenticado', 'UNAUTHORIZED');
    }
    try {
        const payload = verifyAccessToken(token);
        request.userId = payload.sub;
        request.userRole = payload.role;
    }
    catch {
        throw new HttpError(401, 'Token inválido ou expirado', 'UNAUTHORIZED');
    }
}
export function requireRole(roles) {
    return async function requireRoleHandler(request, _reply) {
        await authenticate(request, _reply);
        if (!request.userRole || !roles.includes(request.userRole)) {
            throw new HttpError(403, 'Sem permissão', 'FORBIDDEN');
        }
    };
}
export const requireAdmin = requireRole([UserRole.ADMIN]);
export function registerAuthHelpers(app) {
    app.decorateRequest('userId', undefined);
    app.decorateRequest('userRole', undefined);
}
//# sourceMappingURL=auth.plugin.js.map