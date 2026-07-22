import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

const api = ManageService(API_V1_URL);

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  micCode: string;
  country: string;
  currency: string;
  instrumentType: string;
}

export function searchTickers(query: string): Promise<TickerSearchResult[]> {
  return api
    .prepareRequest('/market-prices/search', HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .setQueryParams({ query })
    .execRequest<TickerSearchResult[]>();
}
