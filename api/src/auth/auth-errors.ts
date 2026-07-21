export const AUTH_ERROR_MESSAGES = {
  emailRequired: 'Email is required',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 6 characters',
  tokenRequired: 'Token is required',
  updateAccountRequiresField: 'at least one field is required',
  userAlreadyExists: 'User with this email already exists',
  invalidCredentials: 'Invalid email or password',
  passwordlessAccount:
    'Account was created without password. Please use the forgot password flow.',
  forgotPasswordMessage:
    'If an account exists with this email, you will receive a reset link.',
  invalidOrExpiredResetLink:
    'Invalid or expired reset link. Please request a new one.',
  userNotFound: 'User not found',
  missingBearerToken: 'Missing Bearer token',
  invalidToken: 'Invalid token',
} as const;
