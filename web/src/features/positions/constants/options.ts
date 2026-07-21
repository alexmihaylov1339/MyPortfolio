export const BROKER_OPTIONS = [
  { value: 'REVOLUT', label: 'Revolut' },
  { value: 'IBKR', label: 'IBKR' },
] as const;

export const ASSET_TYPE_OPTIONS = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'ETF', label: 'ETF' },
] as const;

export const POSITION_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
] as const;
