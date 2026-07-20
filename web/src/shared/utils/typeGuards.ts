export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isDefined<T>(value: T | undefined): value is T {
  return !isUndefined(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObjectRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && !isNull(value);
}

export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
