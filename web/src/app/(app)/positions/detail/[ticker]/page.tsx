'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { TickerDetailView } from '@features/positions';

export default function PositionDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = decodeURIComponent(params.ticker);
  const micCode = useSearchParams().get('mic');

  return <TickerDetailView ticker={ticker} micCode={micCode} />;
}
