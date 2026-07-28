import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

import { MODELS_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export interface ModelAllocation {
  id: string;
  ticker: string;
  exchangeMicCode: string | null;
  targetPercent: string;
}

export interface ModelPortfolio {
  id: string;
  name: string;
  isDefault: boolean;
  allocations: ModelAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface AllocationInput {
  ticker: string;
  exchangeMicCode?: string | null;
  targetPercent: string;
}

export interface CreateModelInput {
  name: string;
  isDefault?: boolean;
  allocations: AllocationInput[];
  portfolioId?: string;
}

export type UpdateModelInput = Partial<CreateModelInput>;

export function listModels(portfolioId?: string): Promise<ModelPortfolio[]> {
  const request = api
    .prepareRequest(MODELS_ENDPOINTS.LIST, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders());

  if (portfolioId) {
    request.setQueryParams({ portfolioId });
  }

  return request.execRequest<ModelPortfolio[]>();
}

export function getModel(id: string): Promise<ModelPortfolio> {
  return api
    .prepareRequest(MODELS_ENDPOINTS.DETAIL(id), HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<ModelPortfolio>();
}

export function createModel(input: CreateModelInput): Promise<ModelPortfolio> {
  return api
    .prepareRequest(MODELS_ENDPOINTS.CREATE, HTTP_METHODS.POST)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<ModelPortfolio>();
}

export function updateModel(
  id: string,
  input: UpdateModelInput,
): Promise<ModelPortfolio> {
  return api
    .prepareRequest(MODELS_ENDPOINTS.DETAIL(id), HTTP_METHODS.PATCH)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<ModelPortfolio>();
}

export function deleteModel(id: string): Promise<void> {
  return api
    .prepareRequest(MODELS_ENDPOINTS.DETAIL(id), HTTP_METHODS.DELETE)
    .setHeaders(getAuthHeaders())
    .execRequest<void>();
}
