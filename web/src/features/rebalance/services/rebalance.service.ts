import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

const REBALANCE_ENDPOINT = '/rebalance';

const api = ManageService(API_V1_URL);

export type RebalanceStatus =
  | 'OVERWEIGHT'
  | 'UNDERWEIGHT'
  | 'ON_TARGET'
  | 'PRICE_UNAVAILABLE';

export interface RebalanceEntry {
  ticker: string;
  exchangeMicCode: string | null;
  actualPercent: string | null;
  targetPercent: string;
  differencePercent: string | null;
  actualValue: string | null;
  targetValue: string;
  differenceValue: string | null;
  status: RebalanceStatus;
}

export interface RebalanceComparison {
  hasDefaultModel: boolean;
  modelId?: string;
  modelName?: string;
  baseCurrency: string | null;
  entries: RebalanceEntry[];
  fxUnavailable: boolean;
}

export function getRebalanceComparison(portfolioId?: string): Promise<RebalanceComparison> {
  const request = api
    .prepareRequest(REBALANCE_ENDPOINT, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders());

  if (portfolioId) {
    request.setQueryParams({ portfolioId });
  }

  return request.execRequest<RebalanceComparison>();
}
