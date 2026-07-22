const MODELS_BASE = '/models';

export const MODELS_ENDPOINTS = {
  LIST: MODELS_BASE,
  CREATE: MODELS_BASE,
  DETAIL: (id: string) => `${MODELS_BASE}/${id}`,
} as const;
