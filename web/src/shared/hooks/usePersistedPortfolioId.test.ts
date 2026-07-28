import { act, renderHook } from '@testing-library/react';

import { usePersistedPortfolioId } from './usePersistedPortfolioId';

describe('usePersistedPortfolioId', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts at null when nothing is stored yet', () => {
    const { result } = renderHook(() => usePersistedPortfolioId());

    expect(result.current[0]).toBeNull();
  });

  it('adopts a previously stored portfolio id after mount', () => {
    window.localStorage.setItem('selectedPortfolioId', 'portfolio-123');

    const { result } = renderHook(() => usePersistedPortfolioId());

    expect(result.current[0]).toBe('portfolio-123');
  });

  it('persists a new selection', () => {
    const { result } = renderHook(() => usePersistedPortfolioId());

    act(() => {
      result.current[1]('portfolio-456');
    });

    expect(result.current[0]).toBe('portfolio-456');
    expect(window.localStorage.getItem('selectedPortfolioId')).toBe(
      'portfolio-456',
    );
  });

  it('clears back to null', () => {
    const { result } = renderHook(() => usePersistedPortfolioId());

    act(() => {
      result.current[1]('portfolio-456');
    });
    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
    expect(window.localStorage.getItem('selectedPortfolioId')).toBe('');
  });
});
