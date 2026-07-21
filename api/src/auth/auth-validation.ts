import { BadRequestException } from '@nestjs/common';

import { hasTrimmedText, isUndefined } from '../common/utils';

import { AUTH_ERROR_MESSAGES } from './auth-errors';
import type { DevLoginDto } from './dto/dev-login.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { UpdateAccountDto } from './dto/update-account.dto';

export function validateRegisterInput(body: RegisterDto): RegisterDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordRequired);
  }

  return {
    email: body.email.trim(),
    password: body.password,
    name: body.name?.trim(),
  };
}

export function validateLoginInput(body: LoginDto): LoginDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordRequired);
  }

  return {
    email: body.email.trim(),
    password: body.password,
  };
}

export function validateDevLoginInput(body: DevLoginDto): DevLoginDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  return {
    email: body.email.trim(),
    name: body.name?.trim(),
  };
}

export function validateForgotPasswordInput(
  body: ForgotPasswordDto,
): ForgotPasswordDto {
  if (!body || !hasTrimmedText(body.email)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  return {
    email: body.email.trim(),
  };
}

export function validateResetPasswordInput(
  body: ResetPasswordDto,
): ResetPasswordDto {
  if (!body || !hasTrimmedText(body.token)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.tokenRequired);
  }

  if (!hasTrimmedText(body.password)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.passwordRequired);
  }

  return {
    token: body.token.trim(),
    password: body.password,
  };
}

export function validateUpdateAccountInput(
  body: UpdateAccountDto,
): UpdateAccountDto {
  if (!body || (isUndefined(body.name) && isUndefined(body.email))) {
    throw new BadRequestException(
      AUTH_ERROR_MESSAGES.updateAccountRequiresField,
    );
  }

  if (!isUndefined(body.email) && !hasTrimmedText(body.email)) {
    throw new BadRequestException(AUTH_ERROR_MESSAGES.emailRequired);
  }

  return {
    email: body.email?.trim(),
    name: body.name?.trim(),
  };
}
