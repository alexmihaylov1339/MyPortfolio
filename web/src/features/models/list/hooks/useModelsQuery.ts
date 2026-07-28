'use client';

import { useQuery } from '@tanstack/react-query';

import { useSelectedPortfolio } from '@features/portfolios/hooks';

import { listModels } from '../../services';

export function useModelsQuery() {
  const { selectedPortfolioId } = useSelectedPortfolio();

  return useQuery({
    queryKey: ['models', selectedPortfolioId],
    queryFn: () => listModels(selectedPortfolioId ?? undefined),
  });
}
