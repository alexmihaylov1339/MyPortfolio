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

export function getPositionsSummary(portfolioId?: string): Promise<PositionsSummary> {
  const request = api
    .prepareRequest(DASHBOARD_ENDPOINTS.SUMMARY, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders());

  if (portfolioId) {
    request.setQueryParams({ portfolioId });
  }

  return request.execRequest<PositionsSummary>();
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

export interface CombinedPnlTotal {
  currency: string;
  totalCurrentValue: string;
  totalUnrealizedPnl: string;
  totalDividends: string;
  totalReturnPnl: string;
  totalPnlAllPositions: string;
  totalReturnPnlAllPositions: string;
  rates: Record<string, string>;
}

export interface PortfolioPnl {
  currencies: CurrencyPnlSummary[];
  /** Null when a currency you hold is missing a live FX rate — never a partial/wrong total. */
  combinedTotal: CombinedPnlTotal | null;
}

export function getPortfolioPnl(portfolioId?: string): Promise<PortfolioPnl> {
  const request = api
    .prepareRequest(DASHBOARD_ENDPOINTS.PNL, HTTP_METHODS.GET)
    .setHeaders(getAuthHeaders());

  if (portfolioId) {
    request.setQueryParams({ portfolioId });
  }

  return request.execRequest<PortfolioPnl>();
}
