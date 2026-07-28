'use client';

import { usePersistedValue } from './usePersistedValue';

/**
 * A boolean toggle that remembers its last value in localStorage — see
 * usePersistedValue for the underlying mechanics.
 */
export function usePersistedToggle(
  key: string,
  defaultValue: boolean,
): [boolean, (value: boolean) => void] {
  return usePersistedValue<boolean>(
    key,
    defaultValue,
    String,
    (raw) => raw === 'true',
  );
}
