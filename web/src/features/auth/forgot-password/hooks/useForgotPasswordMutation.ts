'use client';

import { useMutation } from '@tanstack/react-query';

import { forgotPassword } from '../../services';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}
