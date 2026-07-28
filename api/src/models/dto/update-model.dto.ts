export interface UpdateModelAllocationDto {
  ticker: string;
  exchangeMicCode?: string;
  targetPercent: string;
}

export interface UpdateModelDto {
  name?: string;
  isDefault?: boolean;
  allocations?: UpdateModelAllocationDto[];
}
