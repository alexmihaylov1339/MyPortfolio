'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDividend } from '../../services';

export function useDeleteDividendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      positionId,
      dividendId,
    }: {
      positionId: string;
      dividendId: string;
    }) => deleteDividend(positionId, dividendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}
