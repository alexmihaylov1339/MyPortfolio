import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Portfolio } from '@prisma/client';

import { PortfoliosService } from './portfolios.service';

function buildPortfolio(overrides: Partial<Portfolio> = {}): Portfolio {
  return {
    id: 'p1',
    userId: 'user-1',
    name: 'Default',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

interface MockPrisma {
  portfolio: {
    findMany: jest.Mock<Promise<Portfolio[]>, [unknown?]>;
    findFirst: jest.Mock<Promise<Portfolio | null>, [unknown?]>;
    findUnique: jest.Mock<Promise<Portfolio | null>, [unknown?]>;
    count: jest.Mock<Promise<number>, [unknown?]>;
    create: jest.Mock<Promise<Portfolio>, [unknown?]>;
    update: jest.Mock<Promise<Portfolio>, [unknown?]>;
    updateMany: jest.Mock<Promise<{ count: number }>, [unknown?]>;
    delete: jest.Mock<Promise<Portfolio>, [unknown?]>;
  };
  $transaction: jest.Mock<Promise<unknown>, [(tx: MockPrisma) => unknown]>;
}

function mockPrisma(): MockPrisma {
  const prisma: MockPrisma = {
    portfolio: {
      findMany: jest.fn<Promise<Portfolio[]>, [unknown?]>(),
      findFirst: jest.fn<Promise<Portfolio | null>, [unknown?]>(),
      findUnique: jest.fn<Promise<Portfolio | null>, [unknown?]>(),
      count: jest.fn<Promise<number>, [unknown?]>(),
      create: jest.fn<Promise<Portfolio>, [unknown?]>(),
      update: jest.fn<Promise<Portfolio>, [unknown?]>(),
      updateMany: jest
        .fn<Promise<{ count: number }>, [unknown?]>()
        .mockResolvedValue({ count: 0 }),
      delete: jest.fn<Promise<Portfolio>, [unknown?]>(),
    },
    $transaction: jest.fn<Promise<unknown>, [(tx: MockPrisma) => unknown]>(
      async (callback) => await callback(prisma),
    ),
  };
  return prisma;
}

describe('PortfoliosService', () => {
  describe('create', () => {
    it('makes the first portfolio default regardless of the requested flag', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.count.mockResolvedValue(0);
      prisma.portfolio.create.mockResolvedValue(
        buildPortfolio({ isDefault: true }),
      );
      const service = new PortfoliosService(prisma as never);

      await service.create('user-1', { name: 'Personal', isDefault: false });

      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', name: 'Personal', isDefault: true },
      });
    });

    it('does not default a second portfolio unless requested', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.count.mockResolvedValue(1);
      prisma.portfolio.create.mockResolvedValue(
        buildPortfolio({ isDefault: false }),
      );
      const service = new PortfoliosService(prisma as never);

      await service.create('user-1', { name: 'Retirement', isDefault: false });

      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', name: 'Retirement', isDefault: false },
      });
      expect(prisma.portfolio.updateMany).not.toHaveBeenCalled();
    });

    it('unsets the old default when a new portfolio is explicitly made default', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.count.mockResolvedValue(1);
      prisma.portfolio.create.mockResolvedValue(
        buildPortfolio({ isDefault: true }),
      );
      const service = new PortfoliosService(prisma as never);

      await service.create('user-1', { name: 'Retirement', isDefault: true });

      expect(prisma.portfolio.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('remove', () => {
    it('refuses to delete the only portfolio', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(buildPortfolio());
      prisma.portfolio.count.mockResolvedValue(1);
      const service = new PortfoliosService(prisma as never);

      await expect(service.remove('user-1', 'p1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.portfolio.delete).not.toHaveBeenCalled();
    });

    it('404s when the portfolio belongs to a different user', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(
        buildPortfolio({ userId: 'someone-else' }),
      );
      const service = new PortfoliosService(prisma as never);

      await expect(service.remove('user-1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('promotes the oldest remaining portfolio to default when the default one is deleted', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(
        buildPortfolio({ id: 'p1', isDefault: true }),
      );
      prisma.portfolio.count.mockResolvedValue(2);
      prisma.portfolio.findFirst.mockResolvedValue(
        buildPortfolio({ id: 'p2', isDefault: false }),
      );
      const service = new PortfoliosService(prisma as never);

      await service.remove('user-1', 'p1');

      expect(prisma.portfolio.delete).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'p2' },
        data: { isDefault: true },
      });
    });

    it('does not touch other portfolios when a non-default one is deleted', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(
        buildPortfolio({ id: 'p2', isDefault: false }),
      );
      prisma.portfolio.count.mockResolvedValue(2);
      const service = new PortfoliosService(prisma as never);

      await service.remove('user-1', 'p2');

      expect(prisma.portfolio.delete).toHaveBeenCalledWith({
        where: { id: 'p2' },
      });
      expect(prisma.portfolio.update).not.toHaveBeenCalled();
    });
  });

  describe('resolvePortfolioId', () => {
    it('returns the requested portfolio id after verifying ownership', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(
        buildPortfolio({ id: 'p1', userId: 'user-1' }),
      );
      const service = new PortfoliosService(prisma as never);

      const id = await service.resolvePortfolioId('user-1', 'p1');

      expect(id).toBe('p1');
    });

    it('404s when the requested portfolio belongs to a different user', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findUnique.mockResolvedValue(
        buildPortfolio({ id: 'p1', userId: 'someone-else' }),
      );
      const service = new PortfoliosService(prisma as never);

      await expect(service.resolvePortfolioId('user-1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('falls back to the default portfolio when none is requested', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findFirst.mockResolvedValue(
        buildPortfolio({ id: 'default-id' }),
      );
      const service = new PortfoliosService(prisma as never);

      const id = await service.resolvePortfolioId('user-1');

      expect(id).toBe('default-id');
    });

    it('creates a Default portfolio for a user who has never had one', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findFirst.mockResolvedValue(null);
      prisma.portfolio.create.mockResolvedValue(
        buildPortfolio({ id: 'new-id' }),
      );
      const service = new PortfoliosService(prisma as never);

      const id = await service.resolvePortfolioId('user-1');

      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', name: 'Default', isDefault: true },
      });
      expect(id).toBe('new-id');
    });
  });

  describe('getOrCreateDefaultPortfolio', () => {
    it('promotes an existing portfolio rather than creating a duplicate if the default flag was lost', async () => {
      const prisma = mockPrisma();
      prisma.portfolio.findFirst
        .mockResolvedValueOnce(null) // no isDefault:true row
        .mockResolvedValueOnce(buildPortfolio({ id: 'p1', isDefault: false })); // but one exists
      prisma.portfolio.update.mockResolvedValue(
        buildPortfolio({ id: 'p1', isDefault: true }),
      );
      const service = new PortfoliosService(prisma as never);

      const result = await service.getOrCreateDefaultPortfolio('user-1');

      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { isDefault: true },
      });
      expect(prisma.portfolio.create).not.toHaveBeenCalled();
      expect(result.isDefault).toBe(true);
    });
  });
});
