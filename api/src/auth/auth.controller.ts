import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import type { DevLoginDto } from './dto/dev-login.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { UpdateAccountDto } from './dto/update-account.dto';
import {
  validateDevLoginInput,
  validateForgotPasswordInput,
  validateLoginInput,
  validateRegisterInput,
  validateResetPasswordInput,
  validateUpdateAccountInput,
} from './auth-validation';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(validateRegisterInput(body));
  }

  @Post('auth/login')
  login(@Body() body: LoginDto) {
    return this.auth.login(validateLoginInput(body));
  }

  @Post('auth/dev-login')
  devLogin(@Body() body: DevLoginDto) {
    return this.auth.devLogin(validateDevLoginInput(body));
  }

  @Post('auth/forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(validateForgotPasswordInput(body));
  }

  @Post('auth/reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(validateResetPasswordInput(body));
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const me = await this.auth.getMe(user.id);
    return { user: me };
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateAccount(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateAccountDto,
  ) {
    const updated = await this.auth.updateAccount(
      user.id,
      validateUpdateAccountInput(body),
    );
    return { user: updated };
  }
}
