'use client';

import { usePersistedPortfolioId } from './usePersistedPortfolioId';
import { usePortfoliosQuery } from './usePortfoliosQuery';
import type { Portfolio } from '../services';

export interface UseSelectedPortfolioResult {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  selectedPortfolioId: string | null;
  selectPortfolio: (id: string) => void;
  isLoading: boolean;
}

/**
 * Resolves which portfolio the app should currently show: your remembered
 * choice if it still exists, otherwise your default portfolio (covers the
 * first visit ever, and the case where a previously-selected portfolio
 * was since deleted). Every page that fetches portfolio-scoped data reads
 * `selectedPortfolioId` from here rather than each re-implementing the
 * same fallback.
 */
export function useSelectedPortfolio(): UseSelectedPortfolioResult {
  const [storedId, setStoredId] = usePersistedPortfolioId();
  const { data: portfolios, isLoading } = usePortfoliosQuery();

  const list = portfolios ?? [];
  const storedMatch = storedId
    ? list.find((portfolio) => portfolio.id === storedId)
    : undefined;
  const fallback = list.find((portfolio) => portfolio.isDefault) ?? list[0];
  const selectedPortfolio = storedMatch ?? fallback ?? null;

  return {
    portfolios: list,
    selectedPortfolio,
    selectedPortfolioId: selectedPortfolio?.id ?? null,
    selectPortfolio: setStoredId,
    isLoading,
  };
}
