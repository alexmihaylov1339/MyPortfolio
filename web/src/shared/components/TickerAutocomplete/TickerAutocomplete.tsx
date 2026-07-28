'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { searchTickers, type TickerSearchResult } from './tickerSearch.service';

interface TickerAutocompleteProps {
  ticker: string;
  micCode: string | null;
  onChange: (ticker: string, micCode: string | null, name?: string) => void;
  required?: boolean;
  /** Omit to render the input without a visible label (e.g. inside a table row). */
  label?: string | null;
}

const DEBOUNCE_MS = 300;

function describeMatch(result: TickerSearchResult, separator: string): string {
  return [result.exchange, result.country, result.currency]
    .filter(Boolean)
    .join(separator);
}

export default function TickerAutocomplete({
  ticker,
  micCode,
  onChange,
  required,
  label = 'Ticker',
}: TickerAutocompleteProps) {
  const inputId = useId();
  const [results, setResults] = useState<TickerSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

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

  useEffect(() => {
    const query = ticker.trim();
    // Nothing to search for an empty ticker — stale `results` from a
    // previous query are harmless since the dropdown itself only renders
    // when the ticker is non-empty (see the JSX below).
    if (!query) {
      return;
    }

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setIsLoading(true);
      searchTickers(query)
        .then((matches) => {
          if (requestId !== requestIdRef.current) return;
          setResults(matches);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [ticker]);

  const selectedMatch = results.find(
    (result) => result.symbol === ticker && result.micCode === micCode,
  );

  return (
    <div className="mb-[14px]" ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-[13px] font-semibold text-ink-strong"
        >
          {label}
          {required && <span className="text-destructive-text"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          placeholder="AAPL"
          required={required}
          autoComplete="off"
          value={ticker}
          onChange={(event) => {
            onChange(event.target.value.toUpperCase(), null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-[var(--radius-control)] border border-line bg-surface px-[10px] py-2 text-sm text-ink-strong transition focus:border-brand-accent focus:outline-none focus:ring-[3px] focus:ring-[var(--color-brand-contrast)]"
        />

        {isOpen && ticker.trim() && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-[var(--radius-card)] border border-line-soft bg-surface shadow-card">
            {isLoading && (
              <p className="px-3 py-2 text-sm text-ink-muted">Searching…</p>
            )}
            {!isLoading && results.length === 0 && (
              <p className="px-3 py-2 text-sm text-ink-muted">
                No matches — you can still use this ticker as free text.
              </p>
            )}
            {!isLoading &&
              results.map((result) => (
                <button
                  key={`${result.symbol}-${result.micCode}`}
                  type="button"
                  onClick={() => {
                    onChange(result.symbol, result.micCode, result.name);
                    setIsOpen(false);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-surface-soft"
                >
                  <span className="font-semibold text-ink-strong">
                    {result.symbol}
                    <span className="ml-2 font-normal text-ink-muted">{result.name}</span>
                  </span>
                  <span className="text-xs text-ink-faint">
                    {describeMatch(result, ' · ') || result.micCode}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-ink-faint">
        {selectedMatch
          ? `Matched: ${describeMatch(selectedMatch, ', ') || selectedMatch.micCode}`
          : 'Pick a match for accurate live pricing, or type freely.'}
      </p>
    </div>
  );
}
