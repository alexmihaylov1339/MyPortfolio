import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { MarketPricesController } from './market-prices.controller';
import { MarketPricesSearchController } from './market-prices-search.controller';
import { MarketPricesService } from './market-prices.service';

@Module({
  imports: [AuthModule, PortfoliosModule],
  controllers: [MarketPricesController, MarketPricesSearchController],
  providers: [MarketPricesService],
  exports: [MarketPricesService],
})
export class MarketPricesModule {}
