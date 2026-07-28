'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePortfolio, type UpdatePortfolioInput } from '../services';

export function useUpdatePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePortfolioInput }) =>
      updatePortfolio(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}
