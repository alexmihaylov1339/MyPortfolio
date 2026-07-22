'use client';

import { useState } from 'react';

import Link from 'next/link';

import { PageLoader, ErrorMessage } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { usePositionsQuery, useDeletePositionWithConfirmation } from '@features/positions/list/hooks';
import { PositionsTable, PositionsFilter } from '@features/positions/list/components';
import type { PositionStatus } from '@features/positions/services';

export default function PositionsPage() {
  const [statusFilter, setStatusFilter] = useState<PositionStatus | undefined>(undefined);
  const { data: positions, isLoading, isError } = usePositionsQuery(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const { handleDelete, isDeleting } = useDeletePositionWithConfirmation();

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-strong">Positions</h1>
        <Link
          href={APP_ROUTES.newPosition}
          className="rounded-[4px] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-white transition hover:opacity-90"
        >
          Add position
        </Link>
      </div>

      <PositionsFilter value={statusFilter} onChange={setStatusFilter} />

      {isLoading && <PageLoader />}
      {isError && <ErrorMessage message="Could not load positions." />}
      {!isLoading && !isError && (
        <PositionsTable
          positions={positions ?? []}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
