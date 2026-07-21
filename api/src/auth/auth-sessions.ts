import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERROR_MESSAGES } from './auth-errors';
import { normalizeEmail, publicUser } from './auth.helpers';

const SALT_ROUNDS = 10;

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface DevLoginInput {
  email: string;
  name?: string;
}

export async function register(
  prisma: PrismaService,
  jwt: JwtService,
  input: RegisterInput,
) {
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }
  if (!input.password || input.password.length < 6) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordMinLength);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictException(AUTH_ERROR_MESSAGES.userAlreadyExists);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || undefined,
      passwordHash,
    },
  });

  const accessToken = await jwt.signAsync({ sub: user.id, email: user.email });
  return { accessToken, user: publicUser(user) };
}

export async function login(
  prisma: PrismaService,
  jwt: JwtService,
  input: LoginInput,
) {
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }
  if (!input.password) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordRequired);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidCredentials);
  }
  if (!user.passwordHash) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.passwordlessAccount);
  }
  if (!(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new UnauthorizedException(AUTH_ERROR_MESSAGES.invalidCredentials);
  }

  const accessToken = await jwt.signAsync({ sub: user.id, email: user.email });
  return { accessToken, user: publicUser(user) };
}

export async function devLogin(
  prisma: PrismaService,
  jwt: JwtService,
  input: DevLoginInput,
) {
  const email = normalizeEmail(input.email);
  if (!email) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || undefined,
      },
    });
  } else if (input.name && input.name !== user.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: input.name.trim() },
    });
  }

  const accessToken = await jwt.signAsync({ sub: user.id, email: user.email });
  return { accessToken, user: publicUser(user) };
}
