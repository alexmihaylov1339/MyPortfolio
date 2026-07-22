import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MarketPricesModule } from './market-prices/market-prices.module';
import { ModelsModule } from './models/models.module';
import { PositionsModule } from './positions/positions.module';
import { PrismaModule } from './prisma.module';
import { RebalanceModule } from './rebalance/rebalance.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    // MarketPricesModule is registered before PositionsModule so its literal
    // GET /positions/pnl route is matched before PositionsController's
    // GET /positions/:id — Express matches routes in registration order.
    MarketPricesModule,
    PositionsModule,
    ModelsModule,
    RebalanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
