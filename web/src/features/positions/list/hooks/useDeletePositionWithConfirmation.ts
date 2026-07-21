'use client';

import { useDeletePositionMutation } from './useDeletePositionMutation';
import type { Position } from '../../services';

export function useDeletePositionWithConfirmation() {
  const mutation = useDeletePositionMutation();

  const handleDelete = (position: Position) => {
    const confirmed = window.confirm(
      `Delete ${position.ticker}? This cannot be undone.`,
    );

    if (confirmed) {
      mutation.mutate(position.id);
    }
  };

  return { handleDelete, isDeleting: mutation.isPending };
}
