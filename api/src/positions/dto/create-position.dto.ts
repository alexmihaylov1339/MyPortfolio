export interface CreatePositionDto {
  broker: string;
  ticker: string;
  /** Twelve Data mic_code identifying the exact listing (from the ticker search), disambiguates tickers shared across exchanges/countries. */
  exchangeMicCode?: string;
  name?: string;
  assetType?: string;
  quantity: string;
  averageBuyPrice: string;
  currency?: string;
  status?: string;
  openedAt?: string;
  closedAt?: string;
}
