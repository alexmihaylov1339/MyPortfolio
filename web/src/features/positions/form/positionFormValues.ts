import type { Position } from '../services';

/** Converts a fetched Position into FormBuilder-ready initialValues (dates truncated to YYYY-MM-DD). */
export function toPositionFormValues(position: Position): Record<string, string> {
  return {
    broker: position.broker,
    ticker: position.ticker,
    exchangeMicCode: position.exchangeMicCode ?? '',
    name: position.name ?? '',
    assetType: position.assetType,
    quantity: position.quantity,
    averageBuyPrice: position.averageBuyPrice,
    currency: position.currency,
    status: position.status,
    openedAt: position.openedAt.slice(0, 10),
    closedAt: position.closedAt ? position.closedAt.slice(0, 10) : '',
    closePrice: position.closePrice ?? '',
  };
}
