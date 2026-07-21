const POSITIONS_BASE = '/positions';

export const POSITIONS_ENDPOINTS = {
  LIST: POSITIONS_BASE,
  CREATE: POSITIONS_BASE,
  DETAIL: (id: string) => `${POSITIONS_BASE}/${id}`,
} as const;
