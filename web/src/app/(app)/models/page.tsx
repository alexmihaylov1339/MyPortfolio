'use client';

import Link from 'next/link';

import { PageLoader, ErrorMessage } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { useModelsQuery, useDeleteModelWithConfirmation } from '@features/models/list/hooks';
import { ModelsList } from '@features/models/list/components';

export default function ModelsPage() {
  const { data: models, isLoading, isError } = useModelsQuery();
  const { handleDelete, isDeleting } = useDeleteModelWithConfirmation();

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-strong">
          Model Portfolios
        </h1>
        <Link
          href={APP_ROUTES.newModel}
          className="rounded-[var(--radius-control)] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-brand-accent-ink transition hover:opacity-90"
        >
          Add model
        </Link>
      </div>

      {isLoading && <PageLoader />}
      {isError && <ErrorMessage message="Could not load your models." />}
      {!isLoading && !isError && (
        <ModelsList
          models={models ?? []}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
