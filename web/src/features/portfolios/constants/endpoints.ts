const PORTFOLIOS_BASE = '/portfolios';

export const PORTFOLIOS_ENDPOINTS = {
  LIST: PORTFOLIOS_BASE,
  CREATE: PORTFOLIOS_BASE,
  DETAIL: (id: string) => `${PORTFOLIOS_BASE}/${id}`,
} as const;
