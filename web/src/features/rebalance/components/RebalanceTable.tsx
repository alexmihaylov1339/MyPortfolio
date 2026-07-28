'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

import type { RebalanceEntry } from '../services';

interface RebalanceTableProps {
  entries: RebalanceEntry[];
  currency: string;
}

const STATUS_LABELS: Record<RebalanceEntry['status'], string> = {
  OVERWEIGHT: 'Overweight',
  UNDERWEIGHT: 'Underweight',
  ON_TARGET: 'On target',
  PRICE_UNAVAILABLE: 'Price unavailable',
};

const STATUS_COLORS: Record<RebalanceEntry['status'], string> = {
  OVERWEIGHT: 'text-destructive-text',
  UNDERWEIGHT: 'text-brand',
  ON_TARGET: 'text-success-text',
  PRICE_UNAVAILABLE: 'text-ink-faint',
};

type SortField =
  | 'ticker'
  | 'actualPercent'
  | 'targetPercent'
  | 'differencePercent'
  | 'actualValue'
  | 'targetValue'
  | 'differenceValue';

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'ticker', label: 'Ticker' },
  { field: 'actualPercent', label: 'Actual %' },
  { field: 'targetPercent', label: 'Target %' },
  { field: 'differencePercent', label: 'Diff %' },
  { field: 'actualValue', label: 'Actual' },
  { field: 'targetValue', label: 'Target' },
  { field: 'differenceValue', label: 'To buy / sell' },
];

// Nulls (price unavailable) always sort last, regardless of direction — an
// unknown gap shouldn't be mistaken for a zero gap at either extreme.
function compareEntries(a: RebalanceEntry, b: RebalanceEntry, field: SortField): number {
  if (field === 'ticker') {
    return a.ticker.localeCompare(b.ticker);
  }

  const aValue = a[field];
  const bValue = b[field];

  if (aValue === null && bValue === null) return 0;
  if (aValue === null) return 1;
  if (bValue === null) return -1;

  return Number(aValue) - Number(bValue);
}

function formatPercent(value: string | null): string {
  return value === null ? '—' : `${value}%`;
}

function formatMoney(value: string | null, currency: string): string {
  return value === null ? '—' : `${value} ${currency}`;
}

function diffColorClass(value: string | null): string {
  if (value === null) return 'text-ink-faint';
  if (value === '0.00') return 'text-ink-muted';
  return value.startsWith('-') ? 'text-brand' : 'text-destructive-text';
}

export default function RebalanceTable({ entries, currency }: RebalanceTableProps) {
  const [sortField, setSortField] = useState<SortField>('differenceValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => compareEntries(a, b, sortField));
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [entries, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('asc');
  };

  if (entries.length === 0) {
    return <p className="text-ink-muted">Nothing to compare yet.</p>;
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          {COLUMNS.map((column) => (
            <th
              key={column.field}
              className="cursor-pointer select-none py-2 pr-4 font-semibold text-ink-strong"
              onClick={() => handleSort(column.field)}
            >
              {column.label}
              {sortField === column.field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
            </th>
          ))}
          <th className="py-2 font-semibold text-ink-strong">Status</th>
        </tr>
      </thead>
      <tbody>
        {sortedEntries.map((entry) => (
          <tr key={entry.ticker} className="border-b border-line-soft">
            <td className="py-2 pr-4">
              <Link
                href={APP_ROUTES.positionDetail(entry.ticker, entry.exchangeMicCode)}
                className="text-brand hover:underline"
              >
                {entry.ticker}
              </Link>
            </td>
            <td className="py-2 pr-4">{formatPercent(entry.actualPercent)}</td>
            <td className="py-2 pr-4">{formatPercent(entry.targetPercent)}</td>
            <td className={`py-2 pr-4 ${diffColorClass(entry.differencePercent)}`}>
              {formatPercent(entry.differencePercent)}
            </td>
            <td className="py-2 pr-4">{formatMoney(entry.actualValue, currency)}</td>
            <td className="py-2 pr-4">{formatMoney(entry.targetValue, currency)}</td>
            <td className={`py-2 pr-4 font-medium ${diffColorClass(entry.differenceValue)}`}>
              {formatMoney(entry.differenceValue, currency)}
            </td>
            <td className={`py-2 font-medium ${STATUS_COLORS[entry.status]}`}>
              {STATUS_LABELS[entry.status]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
