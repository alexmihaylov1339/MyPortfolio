const AUTH_BASE = '/auth';

export const AUTH_ENDPOINTS = {
  REGISTER: `${AUTH_BASE}/register`,
  LOGIN: `${AUTH_BASE}/login`,
  FORGOT_PASSWORD: `${AUTH_BASE}/forgot-password`,
  RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
  ME: '/me',
} as const;
