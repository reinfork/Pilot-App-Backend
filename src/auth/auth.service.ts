import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AUTH_PASSWORD, AUTH_USERNAME } from '../app.constants.js';

@Injectable()
export class AuthService {
  // ponytail: in-memory tokens, no expiry/eviction; JWT or TTL store if real auth.
  private readonly tokens = new Set<string>();

  login(username: string, password: string): { token: string } {
    if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = randomUUID();
    this.tokens.add(token);
    return { token };
  }

  isValid(token: string): boolean {
    return this.tokens.has(token);
  }
}
