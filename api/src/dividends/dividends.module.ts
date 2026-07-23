import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DividendsController } from './dividends.controller';
import { DividendsService } from './dividends.service';

@Module({
  imports: [AuthModule],
  controllers: [DividendsController],
  providers: [DividendsService],
})
export class DividendsModule {}
