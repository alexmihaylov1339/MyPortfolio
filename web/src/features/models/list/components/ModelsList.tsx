'use client';

import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

import type { ModelPortfolio } from '../../services';

interface ModelsListProps {
  models: ModelPortfolio[];
  onDelete: (model: ModelPortfolio) => void;
  isDeleting?: boolean;
}

export default function ModelsList({
  models,
  onDelete,
  isDeleting,
}: ModelsListProps) {
  if (models.length === 0) {
    return <p className="text-ink-muted">No models yet.</p>;
  }

  return (
    <div className="space-y-3">
      {models.map((model) => (
        <div
          key={model.id}
          className="rounded-[var(--radius-card)] border border-line-soft p-4 shadow-card"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-strong">
                {model.name}
              </span>
              {model.isDefault && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                  Default
                </span>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={APP_ROUTES.modelEdit(model.id)}
                className="text-brand hover:underline"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => onDelete(model)}
                disabled={isDeleting}
                className="cursor-pointer text-destructive-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-ink-muted">
            {model.allocations
              .map((allocation) => `${allocation.ticker} ${allocation.targetPercent}%`)
              .join(' · ')}
          </p>
        </div>
      ))}
    </div>
  );
}
