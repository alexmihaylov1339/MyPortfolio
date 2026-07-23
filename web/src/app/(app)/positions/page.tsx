'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { PageLoader, ErrorMessage } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { usePositionsQuery, useDeletePositionWithConfirmation } from '@features/positions/list/hooks';
import { PositionsTable, PositionsFilter } from '@features/positions/list/components';
import type { PositionStatus } from '@features/positions/services';
import { usePortfolioPnlQuery } from '@features/dashboard/hooks';
import type { PositionPnl } from '@features/dashboard/services';

export default function PositionsPage() {
  const [statusFilter, setStatusFilter] = useState<PositionStatus | undefined>(undefined);
  const { data: positions, isLoading, isError } = usePositionsQuery(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const { data: pnl } = usePortfolioPnlQuery();
  const { handleDelete, isDeleting } = useDeletePositionWithConfirmation();

  const pnlByPositionId = useMemo(() => {
    const map = new Map<string, PositionPnl>();
    for (const currency of pnl?.currencies ?? []) {
      for (const position of currency.positions) {
        map.set(position.positionId, position);
      }
    }
    return map;
  }, [pnl]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink-strong">Positions</h1>
        <Link
          href={APP_ROUTES.newPosition}
          className="rounded-[var(--radius-control)] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-brand-accent-ink transition hover:opacity-90"
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
          pnlByPositionId={pnlByPositionId}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
