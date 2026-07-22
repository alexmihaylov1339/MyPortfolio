'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createModel, type CreateModelInput } from '../../services';

export function useCreateModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateModelInput) => createModel(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
