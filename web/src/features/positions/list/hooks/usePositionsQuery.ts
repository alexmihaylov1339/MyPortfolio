'use client';

import { useQuery } from '@tanstack/react-query';

import { listPositions, type ListPositionsFilter } from '../../services';

export function usePositionsQuery(filter?: ListPositionsFilter) {
  return useQuery({
    queryKey: ['positions', filter?.status ?? 'all'],
    queryFn: () => listPositions(filter),
  });
}
