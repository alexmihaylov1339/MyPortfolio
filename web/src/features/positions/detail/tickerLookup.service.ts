import { ManageService, HTTP_METHODS, getAuthHeaders, API_V1_URL } from '@shared/services';

const api = ManageService(API_V1_URL);

export interface TickerLookup {
  ticker: string;
  micCode: string | null;
  name: string | null;
  exchange: string | null;
  price: string | null;
}

export function lookupTicker(ticker: string, micCode?: string | null): Promise<TickerLookup> {
  return api
    .prepareRequest('/market-prices/lookup', HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .setQueryParams(micCode ? { ticker, micCode } : { ticker })
    .execRequest<TickerLookup>();
}
