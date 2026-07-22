import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.modelPortfolio.findMany({
      where: { userId },
      include: { allocations: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
