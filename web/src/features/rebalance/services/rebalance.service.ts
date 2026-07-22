import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

const REBALANCE_ENDPOINT = '/rebalance';

const api = ManageService(API_V1_URL);

export type RebalanceStatus = 'OVERWEIGHT' | 'UNDERWEIGHT' | 'ON_TARGET';

export interface RebalanceEntry {
  ticker: string;
  actualPercent: string;
  targetPercent: string;
  differencePercent: string;
  status: RebalanceStatus;
}

export interface RebalanceComparison {
  hasDefaultModel: boolean;
  modelId?: string;
  modelName?: string;
  currency: string | null;
  entries: RebalanceEntry[];
  excludedCurrencies: string[];
}

export function getRebalanceComparison(): Promise<RebalanceComparison> {
  return api
    .prepareRequest(REBALANCE_ENDPOINT, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<RebalanceComparison>();
}
