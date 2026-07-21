import { ManageService, HTTP_METHODS } from '@shared/services';
import { API_V1_URL } from '@/services/config';

import { AUTH_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export type RegisterCredentials = {
  email: string;
  password: string;
  name?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  user: { id: string; email: string; name?: string };
};

export function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.REGISTER, HTTP_METHODS.POST)
    .setBody({
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password,
      name: credentials.name?.trim() || undefined,
    })
    .execRequest<AuthResponse>();
}

export function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.LOGIN, HTTP_METHODS.POST)
    .setBody({
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password,
    })
    .execRequest<AuthResponse>();
}

export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.FORGOT_PASSWORD, HTTP_METHODS.POST)
    .setBody({ email: email?.trim().toLowerCase() })
    .execRequest<ForgotPasswordResponse>();
}

export function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.RESET_PASSWORD, HTTP_METHODS.POST)
    .setBody({
      token: input.token.trim(),
      password: input.password,
    })
    .execRequest<{ message: string }>();
}

export type User = { id: string; email: string; name?: string };

export function getCurrentUser(accessToken: string): Promise<{ user: User }> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.ME, HTTP_METHODS.GET)
    .setHeaders({ Authorization: `Bearer ${accessToken}` })
    .execRequest<{ user: User }>();
}

export type UpdateAccountInput = { name?: string; email?: string };

export function updateAccount(
  accessToken: string,
  input: UpdateAccountInput,
): Promise<{ user: User }> {
  return api
    .prepareRequest(AUTH_ENDPOINTS.ME, HTTP_METHODS.PATCH)
    .setHeaders({ Authorization: `Bearer ${accessToken}` })
    .setBody({
      name: input.name?.trim() || undefined,
      email: input.email?.trim().toLowerCase() || undefined,
    })
    .execRequest<{ user: User }>();
}
