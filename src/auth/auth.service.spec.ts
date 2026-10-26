import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('issues a usable token for valid credentials', () => {
    const auth = new AuthService();
    const { token } = auth.login('johndoe', 'susiairtest');

    expect(auth.isValid(token)).toBe(true);
    expect(auth.isValid('not-a-token')).toBe(false);
  });

  it('rejects invalid credentials', () => {
    const auth = new AuthService();

    expect(() => auth.login('johndoe', 'wrong')).toThrow(UnauthorizedException);
  });

  it('issues a unique token per login', () => {
    const auth = new AuthService();

    const first = auth.login('johndoe', 'susiairtest').token;
    const second = auth.login('johndoe', 'susiairtest').token;

    expect(first).not.toBe(second);
  });
});
