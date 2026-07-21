import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { PositionsService } from './positions.service';

@UseGuards(AuthGuard)
@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.positions.findAllForUser(user.id);
  }
}
