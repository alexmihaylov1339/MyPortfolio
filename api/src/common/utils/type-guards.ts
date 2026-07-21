export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isNil(value: unknown): value is null | undefined {
  return isUndefined(value) || isNull(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObjectRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && !isNil(value) && !Array.isArray(value);
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => isString(item));
}

export function hasTrimmedTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => hasTrimmedText(item));
}

export function hasUniqueTrimmedTextArray(value: unknown): value is string[] {
  return (
    hasTrimmedTextArray(value) &&
    new Set(value.map((item) => item.trim())).size === value.length
  );
}

export function isNonNegativeInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value >= 0;
}

export function hasTrimmedText(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isNotNull<T>(value: T | null): value is T {
  return !isNull(value);
}
