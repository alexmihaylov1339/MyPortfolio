export interface UpdatePositionDto {
  broker?: string;
  ticker?: string;
  exchangeMicCode?: string;
  name?: string;
  assetType?: string;
  quantity?: string;
  averageBuyPrice?: string;
  currency?: string;
  status?: string;
  openedAt?: string;
  closedAt?: string | null;
  closePrice?: string | null;
}
