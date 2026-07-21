import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AUTH_ERROR_MESSAGES } from './auth-errors';

function createExecutionContext(
  headers: Record<string, string>,
): ExecutionContext {
  const request = { headers } as unknown;
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('accepts valid token payload with sub', async () => {
    const verifyAsync = jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
    });
    const guard = new AuthGuard({ verifyAsync } as never);
    const context = createExecutionContext({
      authorization: 'Bearer token-1',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('accepts legacy payload with id fallback', async () => {
    const verifyAsync = jest.fn().mockResolvedValue({
      id: 'legacy-user-1',
      email: 'legacy@example.com',
    });
    const guard = new AuthGuard({ verifyAsync } as never);
    const context = createExecutionContext({
      authorization: 'Bearer token-legacy',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('throws invalid token when payload has no usable subject', async () => {
    const verifyAsync = jest.fn().mockResolvedValue({
      email: 'user@example.com',
    });
    const guard = new AuthGuard({ verifyAsync } as never);
    const context = createExecutionContext({
      authorization: 'Bearer token-no-subject',
    });

    await expect(guard.canActivate(context)).rejects.toEqual(
      new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidToken),
    );
  });
});
