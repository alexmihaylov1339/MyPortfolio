'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAccount, type UpdateAccountInput } from '../../services';
import { AUTH_TOKEN_KEY } from '@/shared/constants/auth';

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) throw new Error('Not authenticated');
      const { user } = await updateAccount(token, input);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
