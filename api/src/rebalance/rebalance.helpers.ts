import type { RebalanceEntry } from './rebalance-diff';

export interface RebalanceComparisonResponse {
  hasDefaultModel: boolean;
  modelId?: string;
  modelName?: string;
  currency: string | null;
  entries: RebalanceEntry[];
  excludedCurrencies: string[];
}
