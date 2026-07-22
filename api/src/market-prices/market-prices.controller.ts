import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { MarketPricesService } from './market-prices.service';

@UseGuards(AuthGuard)
@Controller('positions')
export class MarketPricesController {
  constructor(private readonly marketPrices: MarketPricesService) {}

  @Get('pnl')
  getPortfolioPnl(@CurrentUser() user: AuthUser) {
    return this.marketPrices.getPortfolioPnlForUser(user.id);
  }
}
