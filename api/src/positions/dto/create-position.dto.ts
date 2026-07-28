export interface CreatePositionDto {
  /** Which portfolio this position belongs to — defaults to your default portfolio when omitted. */
  portfolioId?: string;
  broker: string;
  ticker: string;
  /** Exchange-qualified Yahoo Finance symbol (from the ticker search), disambiguates tickers shared across exchanges/countries. */
  exchangeMicCode?: string;
  name?: string;
  assetType?: string;
  quantity: string;
  averageBuyPrice: string;
  currency?: string;
  status?: string;
  openedAt?: string;
  closedAt?: string;
  closePrice?: string;
}
