'use client';

import { useQuery } from '@tanstack/react-query';

import { getRebalanceComparison } from '../services';

// This view depends on BOTH positions and models data, so — unlike the
// dashboard, which borrows the single 'positions' cache-key namespace it
// depends on — there's no one prefix that covers both dependencies here.
// Simpler and just as correct for a page the user visits deliberately:
// always refetch on mount instead of wiring cross-feature invalidation
// into every positions/models mutation.
export function useRebalanceQuery() {
  return useQuery({
    queryKey: ['rebalance'],
    queryFn: getRebalanceComparison,
    staleTime: 0,
  });
}
