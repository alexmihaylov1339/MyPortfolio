'use client';

import { PortfoliosManager } from '@features/portfolios/components';

export default function PortfoliosPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">Portfolios</h1>
      <PortfoliosManager />
    </>
  );
}
