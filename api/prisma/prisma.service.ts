import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Connected to database');
    } catch (err) {
      this.logger.error(
        `Failed to connect to database: ${(err as Error).message}`,
        '\nCheck that your Supabase project is active (free-tier projects pause after inactivity).',
      );
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
