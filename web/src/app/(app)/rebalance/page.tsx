'use client';

import { PageLoader, ErrorMessage } from '@shared/components';

import { useRebalanceQuery } from '@features/rebalance/hooks';
import {
  RebalanceTable,
  RebalanceEmptyState,
  ExcludedCurrenciesNote,
} from '@features/rebalance/components';

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

      {data && data.hasDefaultModel && (
        <>
          <p className="mb-2 text-sm text-ink-muted">
            Comparing against &ldquo;{data.modelName}&rdquo;
          </p>
          <ExcludedCurrenciesNote currencies={data.excludedCurrencies} />
          <RebalanceTable
            entries={data.entries}
            currency={data.currency ?? ''}
          />
        </>
      )}
    </>
  );
}
