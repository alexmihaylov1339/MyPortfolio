'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { register, type RegisterCredentials } from '../../services';
import { useAuth } from '@/shared/components/AuthProvider';
import { APP_ROUTES, AUTH_TOKEN_KEY } from '@/shared/constants';

export function useRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthenticated } = useAuth();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
    onSuccess: ({ accessToken }) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      }
      queryClient.clear();
      setAuthenticated(true);
      router.replace(APP_ROUTES.home);
    },
  });
}
