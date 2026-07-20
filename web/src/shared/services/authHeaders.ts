import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';
import { isBrowserEnvironment } from '@shared/utils';

/** Bearer headers for ManageService when the user is logged in (browser only). */
export function getAuthHeaders(): Record<string, string> {
  if (!isBrowserEnvironment()) return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
