'use client';

import { useQuery } from '@tanstack/react-query';

import { useSelectedPortfolio } from '@features/portfolios/hooks';

import { listPositions, type ListPositionsFilter } from '../../services';

export function usePositionsQuery(filter?: ListPositionsFilter) {
  const { selectedPortfolioId } = useSelectedPortfolio();

  return useQuery({
    queryKey: ['positions', filter?.status ?? 'all', selectedPortfolioId],
    queryFn: () =>
      listPositions({ ...filter, portfolioId: selectedPortfolioId ?? undefined }),
  });
}
