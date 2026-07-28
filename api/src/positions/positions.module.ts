import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  imports: [AuthModule, PortfoliosModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
