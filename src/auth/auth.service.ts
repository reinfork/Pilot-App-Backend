import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_PASSWORD, AUTH_USERNAME } from '../app.constants.js';

const TTL_MS = 24 * 60 * 60 * 1000;

function secret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production')) {
    throw new Error('AUTH_SECRET is not set');
  }
  return secret ?? 'dev-secret';
}

@Injectable()
export class AuthService {
  login(username: string, password: string): { token: string } {
    if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const body = `${Buffer.from(username).toString('base64url')}.${Date.now()}.${randomBytes(8).toString('hex')}`;
    const signature = createHmac('sha256', secret()).update(body).digest('hex');
    return { token: `${body}.${signature}` };
  }

  isValid(token: string): boolean {
    const [user, issued, nonce, signature] = token.split('.');
    if (!user || !issued || !nonce || !signature) return false;
    if (Buffer.from(user, 'base64url').toString() !== AUTH_USERNAME) return false;
    const at = Number(issued);
    if (!Number.isFinite(at) || Date.now() - at > TTL_MS || at - Date.now() > 60_000) return false;
    const expected = createHmac('sha256', secret()).update(`${user}.${issued}.${nonce}`).digest('hex');
    return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}
