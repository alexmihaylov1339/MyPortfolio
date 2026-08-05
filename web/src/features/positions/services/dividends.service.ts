import { ManageService, HTTP_METHODS, getAuthHeaders, API_V1_URL } from '@shared/services';

import { POSITIONS_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export interface Dividend {
  id: string;
  positionId: string;
  amount: string;
  receivedAt: string;
  createdAt: string;
}

export interface CreateDividendInput {
  amount: string;
  receivedAt?: string;
}

export function listDividends(positionId: string): Promise<Dividend[]> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.DIVIDENDS(positionId), HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<Dividend[]>();
}

export function createDividend(
  positionId: string,
  input: CreateDividendInput,
): Promise<Dividend> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.DIVIDENDS(positionId), HTTP_METHODS.POST)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<Dividend>();
}

export function deleteDividend(
  positionId: string,
  dividendId: string,
): Promise<void> {
  return api
    .prepareRequest(
      POSITIONS_ENDPOINTS.DIVIDEND_DETAIL(positionId, dividendId),
      HTTP_METHODS.DELETE,
    )
    .setHeaders(getAuthHeaders())
    .execRequest<void>();
}
