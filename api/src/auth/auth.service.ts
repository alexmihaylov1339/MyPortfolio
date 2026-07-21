import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  devLogin as devLoginSession,
  login as loginSession,
  register as registerSession,
} from './auth-sessions';
import {
  forgotPassword as forgotPasswordRecovery,
  resetPassword as resetPasswordRecovery,
} from './auth-recovery';
import {
  getMe as getMeAccount,
  updateAccount as updateAccountAccount,
} from './auth-account';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
  ) {}

  register(input: { email: string; password: string; name?: string }) {
    return registerSession(this.prisma, this.jwt, input);
  }

  login(input: { email: string; password: string }) {
    return loginSession(this.prisma, this.jwt, input);
  }

  devLogin(input: { email: string; name?: string }) {
    return devLoginSession(this.prisma, this.jwt, input);
  }

  forgotPassword(input: { email: string }) {
    return forgotPasswordRecovery(this.prisma, this.emailService, input);
  }

  resetPassword(input: { token: string; password: string }) {
    return resetPasswordRecovery(this.prisma, input);
  }

  getMe(userId: string) {
    return getMeAccount(this.prisma, userId);
  }

  updateAccount(userId: string, input: { name?: string; email?: string }) {
    return updateAccountAccount(this.prisma, userId, input);
  }
}
