import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { MarketPricesService } from './market-prices.service';

@UseGuards(AuthGuard)
@Controller('market-prices')
export class MarketPricesSearchController {
  constructor(private readonly marketPrices: MarketPricesService) {}

  @Get('search')
  search(@Query('query') query: string | undefined) {
    return this.marketPrices.searchSymbols(query ?? '');
  }

  @Get('lookup')
  lookup(
    @Query('ticker') ticker: string,
    @Query('micCode') micCode: string | undefined,
  ) {
    return this.marketPrices.lookupTicker(ticker, micCode);
  }
}
