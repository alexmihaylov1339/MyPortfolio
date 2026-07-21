'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePosition } from '../../services';

export function useDeletePositionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}
