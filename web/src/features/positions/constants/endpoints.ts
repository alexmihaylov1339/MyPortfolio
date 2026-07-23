const POSITIONS_BASE = '/positions';

export const POSITIONS_ENDPOINTS = {
  LIST: POSITIONS_BASE,
  CREATE: POSITIONS_BASE,
  DETAIL: (id: string) => `${POSITIONS_BASE}/${id}`,
  DIVIDENDS: (positionId: string) => `${POSITIONS_BASE}/${positionId}/dividends`,
  DIVIDEND_DETAIL: (positionId: string, dividendId: string) =>
    `${POSITIONS_BASE}/${positionId}/dividends/${dividendId}`,
} as const;
