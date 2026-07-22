'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteModel } from '../../services';

export function useDeleteModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
