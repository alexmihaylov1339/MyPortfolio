'use client';

import { useState } from 'react';

import {
  useDividendsQuery,
  useCreateDividendMutation,
  useDeleteDividendMutation,
} from '../hooks';

interface DividendsSectionProps {
  positionId: string;
  currency: string;
}

function todayAsDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DividendsSection({
  positionId,
  currency,
}: DividendsSectionProps) {
  const { data: dividends, isLoading } = useDividendsQuery(positionId);
  const createMutation = useCreateDividendMutation();
  const deleteMutation = useDeleteDividendMutation();

  const [amount, setAmount] = useState('');
  const [receivedAt, setReceivedAt] = useState(todayAsDateInputValue());

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount) return;

    createMutation.mutate(
      { positionId, input: { amount, receivedAt } },
      {
        onSuccess: () => {
          setAmount('');
          setReceivedAt(todayAsDateInputValue());
        },
      },
    );
  };

  const total = (dividends ?? []).reduce(
    (sum, dividend) => sum + Number(dividend.amount),
    0,
  );

  return (
    <div className="mt-8 border-t border-line-soft pt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink-strong">Dividends</h2>
        {(dividends?.length ?? 0) > 0 && (
          <span className="text-sm font-medium text-success-text">
            {total.toFixed(2)} {currency} total
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!isLoading && dividends && dividends.length === 0 && (
        <p className="mb-4 text-sm text-ink-muted">
          No dividends recorded for this position yet.
        </p>
      )}

      {!isLoading && dividends && dividends.length > 0 && (
        <ul className="mb-4 space-y-1">
          {dividends.map((dividend) => (
            <li
              key={dividend.id}
              className="flex items-center justify-between border-b border-line-soft py-1.5 text-sm"
            >
              <span className="text-ink-muted">
                {dividend.receivedAt.slice(0, 10)}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-ink-strong">
                  {Number(dividend.amount).toFixed(2)} {currency}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    deleteMutation.mutate({ positionId, dividendId: dividend.id })
                  }
                  disabled={deleteMutation.isPending}
                  className="cursor-pointer text-xs text-destructive-text hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="dividend-amount" className="mb-1 block text-xs font-medium text-ink-muted">
            Amount ({currency})
          </label>
          <input
            id="dividend-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="w-full rounded-[var(--radius-control)] border border-line bg-surface px-[10px] py-2 text-sm text-ink-strong transition focus:border-brand-accent focus:outline-none focus:ring-[3px] focus:ring-[var(--color-brand-contrast)]"
          />
        </div>
        <div>
          <label htmlFor="dividend-date" className="mb-1 block text-xs font-medium text-ink-muted">
            Received
          </label>
          <input
            id="dividend-date"
            type="date"
            value={receivedAt}
            onChange={(event) => setReceivedAt(event.target.value)}
            className="rounded-[var(--radius-control)] border border-line bg-surface px-[10px] py-2 text-sm text-ink-strong transition focus:border-brand-accent focus:outline-none focus:ring-[3px] focus:ring-[var(--color-brand-contrast)]"
          />
        </div>
        <button
          type="submit"
          disabled={!amount || createMutation.isPending}
          className="rounded-[var(--radius-control)] bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-accent-ink transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createMutation.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  );
}
