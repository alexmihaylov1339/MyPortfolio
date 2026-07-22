export interface CreateModelAllocationDto {
  ticker: string;
  targetPercent: string;
}

export interface CreateModelDto {
  name: string;
  isDefault?: boolean;
  allocations: CreateModelAllocationDto[];
}
