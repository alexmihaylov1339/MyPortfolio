'use client';

import { useQuery } from '@tanstack/react-query';

import { lookupTicker } from '../tickerLookup.service';

export function useTickerLookup(
  ticker: string,
  micCode: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['market-prices', 'lookup', ticker, micCode ?? ''],
    queryFn: () => lookupTicker(ticker, micCode),
    enabled,
  });
}
