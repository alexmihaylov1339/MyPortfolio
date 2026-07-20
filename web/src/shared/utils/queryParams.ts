import { isDefined } from './typeGuards';

export type QueryParamPrimitive = string | number | boolean;

export function setQueryParamIfDefined<
  T extends Record<string, QueryParamPrimitive>,
>(
  params: T,
  key: keyof T,
  value: QueryParamPrimitive | undefined,
): void {
  if (isDefined(value)) {
    params[key] = value as T[keyof T];
  }
}
