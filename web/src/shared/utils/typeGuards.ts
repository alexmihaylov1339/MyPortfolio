export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
