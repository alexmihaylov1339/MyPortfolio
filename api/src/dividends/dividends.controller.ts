import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import type { CreateDividendDto } from './dto/create-dividend.dto';
import { validateCreateDividendInput } from './dividends-validation';
import { DividendsService } from './dividends.service';

@UseGuards(AuthGuard)
@Controller('positions')
export class DividendsController {
  constructor(private readonly dividends: DividendsService) {}

  @Get(':positionId/dividends')
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('positionId') positionId: string,
  ) {
    return this.dividends.findAllForPosition(user.id, positionId);
  }

  @Post(':positionId/dividends')
  create(
    @CurrentUser() user: AuthUser,
    @Param('positionId') positionId: string,
    @Body() body: CreateDividendDto,
  ) {
    return this.dividends.create(
      user.id,
      positionId,
      validateCreateDividendInput(body),
    );
  }

  @Delete(':positionId/dividends/:dividendId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('positionId') positionId: string,
    @Param('dividendId') dividendId: string,
  ) {
    await this.dividends.remove(user.id, positionId, dividendId);
  }
}
