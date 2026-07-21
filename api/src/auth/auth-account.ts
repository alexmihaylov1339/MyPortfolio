import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES } from './auth-errors';
import { normalizeEmail, publicUser } from './auth.helpers';

interface UpdateAccountInput {
  name?: string;
  email?: string;
}

export async function getMe(prisma: PrismaService, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.userNotFound);
  }

  return publicUser(user);
}

export async function updateAccount(
  prisma: PrismaService,
  userId: string,
  input: UpdateAccountInput,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.userNotFound);
  }

  const data: { name?: string | null; email?: string } = {};

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.userAlreadyExists);
    }
    data.email = email;
  }

  if (input.name !== undefined) {
    data.name = input.name?.trim() || null;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return publicUser(updated);
}
