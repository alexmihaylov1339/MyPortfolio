'use client';

import { useMemo } from 'react';

import { usePositionsQuery } from '@features/positions/list/hooks';
import { usePortfolioPnlQuery } from '@features/dashboard/hooks';
import type { PositionPnl } from '@features/dashboard/services';

import { buildTickerDetail, type TickerDetail } from '../buildTickerDetail';

export interface UseTickerDetailResult {
  detail: TickerDetail | null;
  isLoading: boolean;
  isError: boolean;
}

export function useTickerDetail(
  ticker: string,
  includeClosedPositions: boolean,
  includeDividends: boolean,
): UseTickerDetailResult {
  const positionsQuery = usePositionsQuery();
  const pnlQuery = usePortfolioPnlQuery();

  const pnlByPositionId = useMemo(() => {
    const map = new Map<string, PositionPnl>();
    for (const currency of pnlQuery.data?.currencies ?? []) {
      for (const position of currency.positions) {
        map.set(position.positionId, position);
      }
    }
    return map;
  }, [pnlQuery.data]);

  const detail = useMemo(() => {
    if (!positionsQuery.data) {
      return null;
    }
    return buildTickerDetail(
      ticker,
      positionsQuery.data,
      pnlByPositionId,
      includeClosedPositions,
      includeDividends,
    );
  }, [ticker, positionsQuery.data, pnlByPositionId, includeClosedPositions, includeDividends]);

  return {
    detail,
    isLoading: positionsQuery.isLoading || pnlQuery.isLoading,
    isError: positionsQuery.isError || pnlQuery.isError,
  };
}
