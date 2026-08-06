'use client';

import { useQuery } from '@tanstack/react-query';

import { useSelectedPortfolio } from '@features/portfolios';

import { getPortfolioPnl } from '../services';

// Shares the 'positions' cache-key prefix with useDashboardSummaryQuery so
// positions create/update/delete mutations' invalidateQueries({ queryKey:
// ['positions'] }) also refreshes this P&L view automatically.
export function usePortfolioPnlQuery() {
  const { selectedPortfolioId } = useSelectedPortfolio();

  return useQuery({
    queryKey: ['positions', 'pnl', selectedPortfolioId],
    queryFn: () => getPortfolioPnl(selectedPortfolioId ?? undefined),
  });
}
