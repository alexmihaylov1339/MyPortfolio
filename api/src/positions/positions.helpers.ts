import type { Position } from '@prisma/client';

export interface PositionResponse {
  id: string;
  portfolioId: string;
  broker: string;
  ticker: string;
  exchangeMicCode?: string;
  name?: string;
  assetType: string;
  quantity: string;
  averageBuyPrice: string;
  currency: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  closePrice?: string;
  createdAt: string;
  updatedAt: string;
}

export function toPositionResponse(position: Position): PositionResponse {
  return {
    id: position.id,
    portfolioId: position.portfolioId,
    broker: position.broker,
    ticker: position.ticker,
    exchangeMicCode: position.exchangeMicCode ?? undefined,
    name: position.name ?? undefined,
    assetType: position.assetType,
    quantity: position.quantity.toString(),
    averageBuyPrice: position.averageBuyPrice.toString(),
    currency: position.currency,
    status: position.status,
    openedAt: position.openedAt.toISOString(),
    closedAt: position.closedAt ? position.closedAt.toISOString() : undefined,
    closePrice: position.closePrice
      ? position.closePrice.toString()
      : undefined,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}
