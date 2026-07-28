'use client';

import { PageLoader, ErrorMessage } from '@shared/components';

import { useRebalanceQuery } from '@features/rebalance/hooks';
import { RebalanceTable, RebalanceEmptyState } from '@features/rebalance/components';

export default function RebalancePage() {
  const { data, isLoading, isError } = useRebalanceQuery();

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">
        Rebalance
      </h1>

      {isLoading && <PageLoader />}
      {isError && (
        <ErrorMessage message="Could not load your rebalance comparison." />
      )}

      {data && !data.hasDefaultModel && <RebalanceEmptyState />}

      {data && data.hasDefaultModel && data.fxUnavailable && (
        <ErrorMessage message="Could not convert one of your currencies to a live rate right now — try again shortly." />
      )}

      {data && data.hasDefaultModel && !data.fxUnavailable && (
        <>
          <p className="mb-2 text-sm text-ink-muted">
            Comparing against &ldquo;{data.modelName}&rdquo; — all positions
            converted to {data.baseCurrency}.
          </p>
          <RebalanceTable
            entries={data.entries}
            currency={data.baseCurrency ?? ''}
          />
        </>
      )}
    </>
  );
}
