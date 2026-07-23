import type { Broker, AssetType, CreatePositionInput, PositionStatus } from '../services';

export function mapFormValuesToPositionInput(
  values: Record<string, string>,
): CreatePositionInput {
  return {
    broker: values.broker as Broker,
    ticker: values.ticker,
    exchangeMicCode: values.exchangeMicCode || undefined,
    name: values.name || undefined,
    assetType: (values.assetType as AssetType) || undefined,
    // FormBuilder's NumberField returns a JS number at runtime (despite the
    // `Record<string, string>` type param here); the API's Decimal fields
    // require string values, so these must be coerced explicitly.
    quantity: String(values.quantity),
    averageBuyPrice: String(values.averageBuyPrice),
    currency: values.currency || undefined,
    status: (values.status as PositionStatus) || undefined,
    openedAt: values.openedAt || undefined,
    closedAt: values.closedAt || undefined,
    // closePrice is only rendered (and only present in `values`) when
    // status is CLOSED — String(undefined) would otherwise produce the
    // literal string "undefined", so this must stay a guarded coercion.
    closePrice:
      values.closePrice !== undefined && values.closePrice !== ''
        ? String(values.closePrice)
        : undefined,
  };
}
