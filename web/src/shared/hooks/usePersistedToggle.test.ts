import { act, renderHook } from '@testing-library/react';

import { usePersistedToggle } from './usePersistedToggle';

describe('usePersistedToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts at defaultValue when nothing is stored yet', () => {
    const { result } = renderHook(() => usePersistedToggle('my-toggle', false));

    expect(result.current[0]).toBe(false);
  });

  it('adopts a previously stored value after mount', () => {
    window.localStorage.setItem('my-toggle', 'true');

    const { result } = renderHook(() => usePersistedToggle('my-toggle', false));

    expect(result.current[0]).toBe(true);
  });

  it('persists a new value to localStorage when updated', () => {
    const { result } = renderHook(() => usePersistedToggle('my-toggle', false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(window.localStorage.getItem('my-toggle')).toBe('true');
  });

  it('keeps separate keys independent', () => {
    window.localStorage.setItem('toggle-a', 'true');

    const { result: a } = renderHook(() => usePersistedToggle('toggle-a', false));
    const { result: b } = renderHook(() => usePersistedToggle('toggle-b', false));

    expect(a.current[0]).toBe(true);
    expect(b.current[0]).toBe(false);
  });
});
