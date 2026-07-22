'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateModel, type UpdateModelInput } from '../../services';

export function useUpdateModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateModelInput }) =>
      updateModel(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
