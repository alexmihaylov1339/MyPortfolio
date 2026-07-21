import type { Position } from '@prisma/client';

export interface PositionResponse {
  id: string;
  broker: string;
  ticker: string;
  name?: string;
  assetType: string;
  quantity: string;
  averageBuyPrice: string;
  currency: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function toPositionResponse(position: Position): PositionResponse {
  return {
    id: position.id,
    broker: position.broker,
    ticker: position.ticker,
    name: position.name ?? undefined,
    assetType: position.assetType,
    quantity: position.quantity.toString(),
    averageBuyPrice: position.averageBuyPrice.toString(),
    currency: position.currency,
    status: position.status,
    openedAt: position.openedAt.toISOString(),
    closedAt: position.closedAt ? position.closedAt.toISOString() : undefined,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}
