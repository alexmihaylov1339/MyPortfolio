import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DividendsModule } from './dividends/dividends.module';
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
    // DividendsModule's routes are all 3-segment (/positions/:id/dividends),
    // so they don't collide with PositionsController's 2-segment /positions/:id
    // regardless of registration order — no ordering constraint needed here.
    DividendsModule,
    ModelsModule,
    RebalanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
