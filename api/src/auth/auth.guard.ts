import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { hasTrimmedText } from '../common/utils/type-guards';
import { AUTH_ERROR_MESSAGES } from './auth-errors';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

type AuthTokenPayload = {
  sub?: unknown;
  id?: unknown;
  email?: unknown;
};

function resolveUserId(payload: AuthTokenPayload): string | null {
  if (hasTrimmedText(payload.sub)) {
    return payload.sub;
  }

  if (hasTrimmedText(payload.id)) {
    return payload.id;
  }

  return null;
}

function resolveUserEmail(payload: AuthTokenPayload): string {
  if (hasTrimmedText(payload.email)) {
    return payload.email;
  }

  return '';
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.missingBearerToken);
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const payload = await this.jwt.verifyAsync<AuthTokenPayload>(token);
      const userId = resolveUserId(payload);

      if (!userId) {
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidToken);
      }

      req.user = { id: userId, email: resolveUserEmail(payload) };
      return true;
    } catch {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidToken);
    }
  }
}
