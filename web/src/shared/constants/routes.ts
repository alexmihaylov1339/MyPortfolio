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
  positions: '/positions',
  newPosition: '/positions/new',
  positionEdit: (id: string) => `/positions/${id}/edit`,
  models: '/models',
  newModel: '/models/new',
  modelEdit: (id: string) => `/models/${id}/edit`,
} as const;
