'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { resetPassword } from '../../services';
import { APP_ROUTES } from '@/shared/constants';

export function useResetPasswordMutation(token: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: (password: string) =>
      resetPassword({ token, password }),
    onSuccess: () => {
      router.replace(APP_ROUTES.login);
    },
  });
}
