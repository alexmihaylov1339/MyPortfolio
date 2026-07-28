import type { ModelAllocation, ModelPortfolio } from '@prisma/client';

export interface ModelAllocationResponse {
  id: string;
  ticker: string;
  exchangeMicCode: string | null;
  targetPercent: string;
}

export interface ModelPortfolioResponse {
  id: string;
  portfolioId: string;
  name: string;
  isDefault: boolean;
  allocations: ModelAllocationResponse[];
  createdAt: string;
  updatedAt: string;
}

function toAllocationResponse(
  allocation: ModelAllocation,
): ModelAllocationResponse {
  return {
    id: allocation.id,
    ticker: allocation.ticker,
    exchangeMicCode: allocation.exchangeMicCode,
    targetPercent: allocation.targetPercent.toString(),
  };
}

export function toModelResponse(
  model: ModelPortfolio & { allocations: ModelAllocation[] },
): ModelPortfolioResponse {
  return {
    id: model.id,
    portfolioId: model.portfolioId,
    name: model.name,
    isDefault: model.isDefault,
    allocations: model.allocations.map(toAllocationResponse),
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}
