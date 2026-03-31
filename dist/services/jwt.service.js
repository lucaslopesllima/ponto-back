import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function signAccessToken(userId, role) {
    const payload = { sub: userId, role, type: 'access' };
    const opts = {
        expiresIn: env.JWT_ACCESS_EXPIRES,
    };
    return jwt.sign(payload, env.JWT_SECRET, opts);
}
export function signRefreshToken(userId) {
    const payload = { sub: userId, type: 'refresh' };
    const opts = {
        expiresIn: env.JWT_REFRESH_EXPIRES,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
}
export function verifyAccessToken(token) {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.type !== 'access')
        throw new Error('Invalid token type');
    return decoded;
}
export function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh')
        throw new Error('Invalid token type');
    return decoded;
}
//# sourceMappingURL=jwt.service.js.map