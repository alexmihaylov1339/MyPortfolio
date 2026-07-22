import type { AllocationInput, ModelPortfolio } from '../services';

export interface ModelFormValues {
  name: string;
  isDefault: boolean;
  allocations: AllocationInput[];
}

export function toModelFormValues(model: ModelPortfolio): ModelFormValues {
  return {
    name: model.name,
    isDefault: model.isDefault,
    allocations: model.allocations.map((allocation) => ({
      ticker: allocation.ticker,
      targetPercent: allocation.targetPercent,
    })),
  };
}
