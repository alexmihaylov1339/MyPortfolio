import type { Portfolio } from '@prisma/client';

export interface PortfolioResponse {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toPortfolioResponse(portfolio: Portfolio): PortfolioResponse {
  return {
    id: portfolio.id,
    name: portfolio.name,
    isDefault: portfolio.isDefault,
    createdAt: portfolio.createdAt.toISOString(),
    updatedAt: portfolio.updatedAt.toISOString(),
  };
}
