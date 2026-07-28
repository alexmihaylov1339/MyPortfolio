import type { RebalanceEntry } from './rebalance-diff';

export interface RebalanceComparisonResponse {
  hasDefaultModel: boolean;
  modelId?: string;
  modelName?: string;
  /** Every currency you hold is converted into this one (see rebalance-diff.ts). */
  baseCurrency: string | null;
  entries: RebalanceEntry[];
  /** True when a currency you hold has no live FX rate right now — entries is empty rather than a partially-wrong comparison. */
  fxUnavailable: boolean;
}
