import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ModelsModule } from './models/models.module';
import { PositionsModule } from './positions/positions.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, PositionsModule, ModelsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
