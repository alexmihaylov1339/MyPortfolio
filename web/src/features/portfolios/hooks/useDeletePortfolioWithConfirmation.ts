'use client';

import { useDeletePortfolioMutation } from './useDeletePortfolioMutation';
import type { Portfolio } from '../services';

export function useDeletePortfolioWithConfirmation() {
  const mutation = useDeletePortfolioMutation();

  const handleDelete = (portfolio: Portfolio) => {
    const confirmed = window.confirm(
      `Delete "${portfolio.name}"? This permanently deletes every position, dividend, and model inside this portfolio. This cannot be undone.`,
    );

    if (confirmed) {
      mutation.mutate(portfolio.id);
    }
  };

  return { handleDelete, isDeleting: mutation.isPending };
}
