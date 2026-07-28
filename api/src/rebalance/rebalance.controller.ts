import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { RebalanceService } from './rebalance.service';

@UseGuards(AuthGuard)
@Controller('rebalance')
export class RebalanceController {
  constructor(private readonly rebalance: RebalanceService) {}

  @Get()
  getComparison(
    @CurrentUser() user: AuthUser,
    @Query('portfolioId') portfolioId?: string,
  ) {
    return this.rebalance.getComparisonForUser(user.id, portfolioId);
  }
}
