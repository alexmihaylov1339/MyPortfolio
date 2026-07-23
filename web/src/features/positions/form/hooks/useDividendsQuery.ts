'use client';

import { useQuery } from '@tanstack/react-query';

import { listDividends } from '../../services';

export function useDividendsQuery(positionId: string) {
  return useQuery({
    queryKey: ['positions', positionId, 'dividends'],
    queryFn: () => listDividends(positionId),
  });
}
