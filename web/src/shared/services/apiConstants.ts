/**
 * HTTP Methods constants
 * Use these across the project instead of string literals
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * Common HTTP Headers
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

