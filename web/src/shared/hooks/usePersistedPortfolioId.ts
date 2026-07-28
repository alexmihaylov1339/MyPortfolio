'use client';

import { usePersistedValue } from './usePersistedValue';

const PORTFOLIO_ID_KEY = 'selectedPortfolioId';

/**
 * Which portfolio you're currently viewing, remembered across visits —
 * null means "no explicit choice made yet", in which case callers should
 * fall back to the user's default portfolio.
 */
export function usePersistedPortfolioId(): [
  string | null,
  (id: string | null) => void,
] {
  return usePersistedValue<string | null>(
    PORTFOLIO_ID_KEY,
    null,
    (value) => value ?? '',
    (raw) => (raw === '' ? null : raw),
  );
}
