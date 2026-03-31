import type { UserRoleType } from '../models/user.model.js';
export interface AccessPayload {
    sub: string;
    role: UserRoleType;
    type: 'access';
}
export interface RefreshPayload {
    sub: string;
    type: 'refresh';
}
export declare function signAccessToken(userId: string, role: UserRoleType): string;
export declare function signRefreshToken(userId: string): string;
export declare function verifyAccessToken(token: string): AccessPayload;
export declare function verifyRefreshToken(token: string): RefreshPayload;
//# sourceMappingURL=jwt.service.d.ts.map