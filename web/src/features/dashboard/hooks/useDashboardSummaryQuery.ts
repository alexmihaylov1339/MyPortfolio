'use client';

import { useQuery } from '@tanstack/react-query';

import { getPositionsSummary } from '../services';

// Keyed under the 'positions' cache namespace (not 'dashboard') so the
// existing positions create/update/delete mutations' invalidateQueries({
// queryKey: ['positions'] }) automatically refreshes this summary too —
// TanStack Query invalidates by key prefix.
export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['positions', 'summary'],
    queryFn: getPositionsSummary,
  });
}
