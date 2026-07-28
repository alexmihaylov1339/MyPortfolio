import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

import { PORTFOLIOS_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export interface Portfolio {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioInput {
  name: string;
  isDefault?: boolean;
}

export interface UpdatePortfolioInput {
  name?: string;
  isDefault?: true;
}

export function listPortfolios(): Promise<Portfolio[]> {
  return api
    .prepareRequest(PORTFOLIOS_ENDPOINTS.LIST, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<Portfolio[]>();
}

export function createPortfolio(input: CreatePortfolioInput): Promise<Portfolio> {
  return api
    .prepareRequest(PORTFOLIOS_ENDPOINTS.CREATE, HTTP_METHODS.POST)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<Portfolio>();
}

export function updatePortfolio(
  id: string,
  input: UpdatePortfolioInput,
): Promise<Portfolio> {
  return api
    .prepareRequest(PORTFOLIOS_ENDPOINTS.DETAIL(id), HTTP_METHODS.PATCH)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<Portfolio>();
}

export function deletePortfolio(id: string): Promise<void> {
  return api
    .prepareRequest(PORTFOLIOS_ENDPOINTS.DETAIL(id), HTTP_METHODS.DELETE)
    .setHeaders(getAuthHeaders())
    .execRequest<void>();
}
