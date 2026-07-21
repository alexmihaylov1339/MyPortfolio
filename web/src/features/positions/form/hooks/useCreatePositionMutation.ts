'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPosition, type CreatePositionInput } from '../../services';

export function useCreatePositionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePositionInput) => createPosition(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}
