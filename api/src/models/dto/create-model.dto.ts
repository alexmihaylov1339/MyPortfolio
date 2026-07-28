export interface CreateModelAllocationDto {
  ticker: string;
  exchangeMicCode?: string;
  targetPercent: string;
}

export interface CreateModelDto {
  /** Which portfolio this model belongs to — defaults to your default portfolio when omitted. */
  portfolioId?: string;
  name: string;
  isDefault?: boolean;
  allocations: CreateModelAllocationDto[];
}
