'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

import { useSelectedPortfolio } from '../hooks';

export default function PortfolioSwitcher() {
  const { portfolios, selectedPortfolio, selectPortfolio, isLoading } =
    useSelectedPortfolio();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading || !selectedPortfolio) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex cursor-pointer items-center gap-1 rounded-[var(--radius-control)] border border-line-soft px-2.5 py-1 text-sm font-medium text-ink-strong transition hover:border-line"
      >
        {selectedPortfolio.name}
        <span className="text-ink-faint">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-1 w-48 overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-surface shadow-card">
          {portfolios.map((portfolio) => (
            <button
              key={portfolio.id}
              type="button"
              onClick={() => {
                selectPortfolio(portfolio.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-surface-soft ${
                portfolio.id === selectedPortfolio.id
                  ? 'font-semibold text-brand'
                  : 'text-ink-strong'
              }`}
            >
              {portfolio.name}
              {portfolio.isDefault && (
                <span className="text-xs text-ink-faint">Default</span>
              )}
            </button>
          ))}
          <Link
            href={APP_ROUTES.portfolios}
            onClick={() => setIsOpen(false)}
            className="block border-t border-line-soft px-3 py-2 text-left text-sm text-brand hover:bg-surface-soft hover:underline"
          >
            Manage portfolios
          </Link>
        </div>
      )}
    </div>
  );
}
