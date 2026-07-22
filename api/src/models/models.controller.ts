import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ModelsService } from './models.service';

@UseGuards(AuthGuard)
@Controller('models')
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.models.findAllForUser(user.id);
  }
}
