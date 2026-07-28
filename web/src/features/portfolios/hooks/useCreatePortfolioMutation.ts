'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPortfolio, type CreatePortfolioInput } from '../services';

export function useCreatePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePortfolioInput) => createPortfolio(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}
