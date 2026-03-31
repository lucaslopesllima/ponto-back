import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken } from './jwt.service.js';
import { UserRole } from '../models/user.model.js';

describe('jwt.service', () => {
  it('signs and verifies access token', () => {
    const token = signAccessToken('user-id-1', UserRole.USER);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-id-1');
    expect(payload.role).toBe(UserRole.USER);
  });
});
