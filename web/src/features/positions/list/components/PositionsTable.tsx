'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';
import type { PositionPnl } from '@features/dashboard/services';

import type { Position } from '../../services';

interface PositionsTableProps {
  positions: Position[];
  pnlByPositionId?: Map<string, PositionPnl>;
  onDelete: (position: Position) => void;
  isDeleting?: boolean;
}

type SortField = 'ticker' | 'broker' | 'quantity' | 'averageBuyPrice' | 'openedAt';

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'ticker', label: 'Ticker' },
  { field: 'broker', label: 'Broker' },
  { field: 'quantity', label: 'Quantity' },
  { field: 'averageBuyPrice', label: 'Avg. price' },
  { field: 'openedAt', label: 'Opened' },
];

function comparePositions(a: Position, b: Position, field: SortField): number {
  if (field === 'quantity' || field === 'averageBuyPrice') {
    return Number(a[field]) - Number(b[field]);
  }

  return String(a[field]).localeCompare(String(b[field]));
}

export default function PositionsTable({
  positions,
  pnlByPositionId,
  onDelete,
  isDeleting,
}: PositionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedPositions = useMemo(() => {
    const sorted = [...positions].sort((a, b) => comparePositions(a, b, sortField));
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [positions, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('asc');
  };

  if (positions.length === 0) {
    return <p className="text-ink-muted">No positions yet.</p>;
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
          <th className="py-2 pr-4 font-semibold text-ink-strong">Current price</th>
          <th className="py-2 pr-4 font-semibold text-ink-strong">Current value</th>
          <th className="py-2 pr-4 font-semibold text-ink-strong">Status</th>
          <th className="py-2 font-semibold text-ink-strong">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedPositions.map((position) => {
          const pnl = pnlByPositionId?.get(position.id);
          return (
            <tr key={position.id} className="border-b border-line-soft">
              <td className="py-2 pr-4">
                <Link
                  href={APP_ROUTES.positionDetail(position.ticker)}
                  className="text-brand hover:underline"
                >
                  {position.ticker}
                </Link>
              </td>
              <td className="py-2 pr-4">{position.broker}</td>
              <td className="py-2 pr-4">{position.quantity}</td>
              <td className="py-2 pr-4">
                {position.averageBuyPrice} {position.currency}
              </td>
              <td className="py-2 pr-4">{position.openedAt.slice(0, 10)}</td>
              <td className="py-2 pr-4">
                {pnl?.currentPrice ? (
                  `${pnl.currentPrice} ${position.currency}`
                ) : (
                  <span className="text-ink-faint">Unavailable</span>
                )}
              </td>
              <td className="py-2 pr-4">
                {pnl?.currentValue ? (
                  `${pnl.currentValue} ${position.currency}`
                ) : (
                  <span className="text-ink-faint">Unavailable</span>
                )}
              </td>
              <td className="py-2 pr-4">{position.status}</td>
              <td className="py-2">
                <Link
                  href={APP_ROUTES.positionEdit(position.id)}
                  className="mr-3 text-brand hover:underline"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(position)}
                  disabled={isDeleting}
                  className="cursor-pointer text-destructive-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
