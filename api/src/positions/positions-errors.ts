export const POSITION_ERROR_MESSAGES = {
  brokerInvalid: 'Broker must be one of: REVOLUT, IBKR',
  tickerRequired: 'Ticker is required',
  assetTypeInvalid: 'Asset type must be one of: STOCK, ETF',
  quantityInvalid: 'Quantity must be a positive number',
  averageBuyPriceInvalid: 'Average buy price must be a positive number',
  statusInvalid: 'Status must be one of: OPEN, CLOSED',
  closedAtRequiredWhenClosed: 'Closed date is required when status is CLOSED',
  closePriceRequiredWhenClosed:
    'Close price must be a positive number when status is CLOSED',
  openedAtInvalid: 'Opened date is invalid',
  closedAtInvalid: 'Closed date is invalid',
  updateRequiresField: 'At least one field is required',
  positionNotFound: 'Position not found',
} as const;
