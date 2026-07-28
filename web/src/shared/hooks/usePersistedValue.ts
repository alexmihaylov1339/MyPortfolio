'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Same-tab writes don't fire the native `storage` event (only other tabs
// get that), so we keep a tiny in-memory pub-sub per key to notify this
// tab's own subscribers immediately. `storage` is still listened to below,
// which gets us cross-tab sync as a free bonus.
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, onStoreChange: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onStoreChange);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) onStoreChange();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    set?.delete(onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * A value that remembers its last setting in localStorage — for pure view
 * preferences (e.g. "include dividends", "which portfolio am I looking
 * at") that should default to how you last left them, not app data. Uses
 * useSyncExternalStore (rather than reading localStorage in an effect) so
 * the server-rendered pass and the first client paint both show
 * `defaultValue` with no hydration mismatch, and the remembered value
 * takes over as soon as React can subscribe to it.
 */
export function usePersistedValue<T>(
  key: string,
  defaultValue: T,
  serialize: (value: T) => string,
  deserialize: (raw: string) => T,
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    useCallback((onStoreChange) => subscribe(key, onStoreChange), [key]),
    () => {
      const stored = window.localStorage.getItem(key);
      return stored === null ? defaultValue : deserialize(stored);
    },
    () => defaultValue,
  );

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch {
        // Private browsing / storage full — the value still updates for
        // this render via notify(), it just won't be remembered next time.
      }
      notify(key);
    },
    [key, serialize],
  );

  return [value, setValue];
}
