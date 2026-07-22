'use client';

import { useDeleteModelMutation } from './useDeleteModelMutation';
import type { ModelPortfolio } from '../../services';

export function useDeleteModelWithConfirmation() {
  const mutation = useDeleteModelMutation();

  const handleDelete = (model: ModelPortfolio) => {
    const confirmed = window.confirm(
      `Delete "${model.name}"? This cannot be undone.`,
    );

    if (confirmed) {
      mutation.mutate(model.id);
    }
  };

  return { handleDelete, isDeleting: mutation.isPending };
}
