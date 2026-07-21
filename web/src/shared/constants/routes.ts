export const APP_ROUTES = {
  home: '/dashboard',
  dashboard: '/dashboard',
  login: '/login',
  register: '/register',
  account: '/account',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  resetPasswordWithToken: (token: string) =>
    `/reset-password?token=${encodeURIComponent(token)}`,
} as const;
