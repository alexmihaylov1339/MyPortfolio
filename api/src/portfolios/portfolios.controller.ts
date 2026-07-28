import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import type { CreatePortfolioDto } from './dto/create-portfolio.dto';
import type { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import {
  validateCreatePortfolioInput,
  validateUpdatePortfolioInput,
} from './portfolios-validation';
import { PortfoliosService } from './portfolios.service';

@UseGuards(AuthGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfolios: PortfoliosService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.portfolios.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.portfolios.findOneForUser(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreatePortfolioDto) {
    return this.portfolios.create(user.id, validateCreatePortfolioInput(body));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdatePortfolioDto,
  ) {
    return this.portfolios.update(
      user.id,
      id,
      validateUpdatePortfolioInput(body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.portfolios.remove(user.id, id);
  }
}
