'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePosition, type UpdatePositionInput } from '../../services';

export function useUpdatePositionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePositionInput }) =>
      updatePosition(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}
