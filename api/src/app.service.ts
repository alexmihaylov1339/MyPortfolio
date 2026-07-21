import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  health(): { status: string; db: string } {
    return {
      status: 'ok',
      db: this.prisma.isConnected() ? 'connected' : 'unavailable',
    };
  }
}
