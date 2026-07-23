'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDividend, type CreateDividendInput } from '../../services';

export function useCreateDividendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      positionId,
      input,
    }: {
      positionId: string;
      input: CreateDividendInput;
    }) => createDividend(positionId, input),
    onSuccess: () => {
      // Broad invalidation on purpose: a new dividend changes both this
      // position's dividend list and the dashboard's total-return P&L.
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}
