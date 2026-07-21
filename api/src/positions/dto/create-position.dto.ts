export interface CreatePositionDto {
  broker: string;
  ticker: string;
  name?: string;
  assetType?: string;
  quantity: string;
  averageBuyPrice: string;
  currency?: string;
  status?: string;
  openedAt?: string;
  closedAt?: string;
}
