import type { Dividend } from '@prisma/client';

export interface DividendResponse {
  id: string;
  positionId: string;
  amount: string;
  receivedAt: string;
  createdAt: string;
}

export function toDividendResponse(dividend: Dividend): DividendResponse {
  return {
    id: dividend.id,
    positionId: dividend.positionId,
    amount: dividend.amount.toString(),
    receivedAt: dividend.receivedAt.toISOString(),
    createdAt: dividend.createdAt.toISOString(),
  };
}
