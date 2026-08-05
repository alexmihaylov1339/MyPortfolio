import { ManageService, HTTP_METHODS, getAuthHeaders, API_V1_URL } from '@shared/services';

import { POSITIONS_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export type Broker = 'REVOLUT' | 'IBKR';
export type AssetType = 'STOCK' | 'ETF';
export type PositionStatus = 'OPEN' | 'CLOSED';

export interface Position {
  id: string;
  broker: Broker;
  ticker: string;
  exchangeMicCode?: string;
  name?: string;
  assetType: AssetType;
  quantity: string;
  averageBuyPrice: string;
  currency: string;
  status: PositionStatus;
  openedAt: string;
  closedAt?: string;
  closePrice?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePositionInput = {
  broker: Broker;
  ticker: string;
  exchangeMicCode?: string;
  name?: string;
  assetType?: AssetType;
  quantity: string;
  averageBuyPrice: string;
  currency?: string;
  status?: PositionStatus;
  openedAt?: string;
  closedAt?: string;
  closePrice?: string;
  portfolioId?: string;
};

export type UpdatePositionInput = Partial<CreatePositionInput> & {
  closedAt?: string | null;
  closePrice?: string | null;
};

export type ListPositionsFilter = {
  status?: PositionStatus;
  portfolioId?: string;
};

export function listPositions(filter?: ListPositionsFilter): Promise<Position[]> {
  const request = api
    .prepareRequest(POSITIONS_ENDPOINTS.LIST, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders());

  const queryParams: Record<string, string> = {};
  if (filter?.status) {
    queryParams.status = filter.status;
  }
  if (filter?.portfolioId) {
    queryParams.portfolioId = filter.portfolioId;
  }
  if (Object.keys(queryParams).length > 0) {
    request.setQueryParams(queryParams);
  }

  return request.execRequest<Position[]>();
}

export function getPosition(id: string): Promise<Position> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.DETAIL(id), HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<Position>();
}

export function createPosition(input: CreatePositionInput): Promise<Position> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.CREATE, HTTP_METHODS.POST)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<Position>();
}

export function updatePosition(
  id: string,
  input: UpdatePositionInput,
): Promise<Position> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.DETAIL(id), HTTP_METHODS.PATCH)
    .setHeaders(getAuthHeaders())
    .setBody(input)
    .execRequest<Position>();
}

export function deletePosition(id: string): Promise<void> {
  return api
    .prepareRequest(POSITIONS_ENDPOINTS.DETAIL(id), HTTP_METHODS.DELETE)
    .setHeaders(getAuthHeaders())
    .execRequest<void>();
}
