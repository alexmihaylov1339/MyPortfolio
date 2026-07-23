import { ManageService, HTTP_METHODS, getAuthHeaders } from '@shared/services';
import { API_V1_URL } from '@/services/config';

import { DASHBOARD_ENDPOINTS } from '../constants';

const api = ManageService(API_V1_URL);

export interface TickerAllocationEntry {
  ticker: string;
  invested: string;
  percent: string;
}

export interface BrokerAllocationEntry {
  broker: string;
  invested: string;
  percent: string;
}

export interface CurrencySummary {
  currency: string;
  totalInvested: string;
  byTicker: TickerAllocationEntry[];
  byBroker: BrokerAllocationEntry[];
}

export interface PositionsSummary {
  currencies: CurrencySummary[];
  positionCounts: { open: number; closed: number };
}

export function getPositionsSummary(): Promise<PositionsSummary> {
  return api
    .prepareRequest(DASHBOARD_ENDPOINTS.SUMMARY, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<PositionsSummary>();
}

export interface PositionPnl {
  positionId: string;
  ticker: string;
  status: 'OPEN' | 'CLOSED';
  quantity: string;
  averageBuyPrice: string;
  currentPrice: string | null;
  currentValue: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
  totalDividends: string;
  totalReturnPnl: string | null;
  totalReturnPnlPercent: string | null;
}

export interface CurrencyPnlSummary {
  currency: string;
  totalCurrentValue: string;
  totalUnrealizedPnl: string;
  totalDividends: string;
  totalReturnPnl: string;
  totalPnlAllPositions: string;
  totalReturnPnlAllPositions: string;
  positions: PositionPnl[];
}

export interface PortfolioPnl {
  currencies: CurrencyPnlSummary[];
}

export function getPortfolioPnl(): Promise<PortfolioPnl> {
  return api
    .prepareRequest(DASHBOARD_ENDPOINTS.PNL, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders())
    .execRequest<PortfolioPnl>();
}
