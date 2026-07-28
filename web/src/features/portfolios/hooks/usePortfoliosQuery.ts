'use client';

import { useQuery } from '@tanstack/react-query';

import { listPortfolios } from '../services';

export function usePortfoliosQuery() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: listPortfolios,
  });
}
