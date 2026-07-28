'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePortfolio } from '../services';

export function useDeletePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}
