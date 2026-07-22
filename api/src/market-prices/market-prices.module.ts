import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { MarketPricesController } from './market-prices.controller';
import { MarketPricesService } from './market-prices.service';

@Module({
  imports: [AuthModule],
  controllers: [MarketPricesController],
  providers: [MarketPricesService],
})
export class MarketPricesModule {}
