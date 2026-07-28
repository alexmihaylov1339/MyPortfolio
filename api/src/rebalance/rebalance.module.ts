import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { MarketPricesModule } from '../market-prices/market-prices.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { RebalanceController } from './rebalance.controller';
import { RebalanceService } from './rebalance.service';

@Module({
  imports: [AuthModule, MarketPricesModule, PortfoliosModule],
  controllers: [RebalanceController],
  providers: [RebalanceService],
})
export class RebalanceModule {}
