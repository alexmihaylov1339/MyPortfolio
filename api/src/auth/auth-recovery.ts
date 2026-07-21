import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES } from './auth-errors';
import { normalizeEmail } from './auth.helpers';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function forgotPassword(
  prisma: PrismaService,
  emailService: EmailService,
  input: ForgotPasswordInput,
) {
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: AUTH_ERROR_MESSAGES.forgotPasswordMessage };
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    },
  });

  const resetLink = `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
  let sent = false;
  try {
    sent = await emailService.sendPasswordReset(user.email, resetLink);
  } catch {
    sent = false;
  }

  if (process.env.NODE_ENV !== 'production' && !sent) {
    return {
      message: AUTH_ERROR_MESSAGES.forgotPasswordMessage,
      resetToken: token,
    };
  }

  return { message: AUTH_ERROR_MESSAGES.forgotPasswordMessage };
}

export async function resetPassword(
  prisma: PrismaService,
  input: ResetPasswordInput,
) {
  if (!input.token?.trim()) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.tokenRequired);
  }
  if (!input.password || input.password.length < 6) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordMinLength);
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: input.token.trim() },
  });
  if (
    !user ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt < new Date()
  ) {
    throw new UnauthorizedException(
      AUTH_ERROR_MESSAGES.invalidOrExpiredResetLink,
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return { message: 'Password has been reset. You can now sign in.' };
}
