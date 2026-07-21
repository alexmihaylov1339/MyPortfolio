const BASE = process.env.NEXT_PUBLIC_API_URL;
const root = BASE && BASE.length > 0 ? BASE.replace(/\/$/, '') : 'http://localhost:3001';

/** API origin without trailing slash (e.g. http://localhost:3001) */
export const API_ROOT_URL = root;

/** Versioned API base (global Nest prefix `v1`) */
export const API_V1_URL = `${root}/v1`;
