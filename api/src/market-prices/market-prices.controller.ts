import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { MarketPricesService } from './market-prices.service';

@UseGuards(AuthGuard)
@Controller('positions')
export class MarketPricesController {
  constructor(
    private readonly marketPrices: MarketPricesService,
    private readonly portfolios: PortfoliosService,
  ) {}

  @Get('pnl')
  async getPortfolioPnl(
    @CurrentUser() user: AuthUser,
    @Query('portfolioId') portfolioId?: string,
  ) {
    const resolvedPortfolioId = await this.portfolios.resolvePortfolioId(
      user.id,
      portfolioId,
    );
    return this.marketPrices.getPortfolioPnlForUser(
      user.id,
      resolvedPortfolioId,
    );
  }
}
