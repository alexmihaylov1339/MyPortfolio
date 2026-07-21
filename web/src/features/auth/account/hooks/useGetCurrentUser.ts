'use client';

import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../../services';
import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';

export function useGetCurrentUser() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

  return useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const { user } = await getCurrentUser(token);
      return user;
    },
    enabled: typeof window !== 'undefined' && !!token,
  });
}
