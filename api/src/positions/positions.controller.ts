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
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import type { CreatePositionDto } from './dto/create-position.dto';
import type { ListPositionsQueryDto } from './dto/list-positions.dto';
import type { UpdatePositionDto } from './dto/update-position.dto';
import {
  validateCreatePositionInput,
  validateListPositionsQuery,
  validateUpdatePositionInput,
} from './positions-validation';
import { PositionsService } from './positions.service';

@UseGuards(AuthGuard)
@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListPositionsQueryDto,
  ) {
    const { status } = validateListPositionsQuery(query);
    return this.positions.findAllForUser(user.id, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.positions.findOneForUser(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreatePositionDto) {
    return this.positions.create(user.id, validateCreatePositionInput(body));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdatePositionDto,
  ) {
    return this.positions.update(
      user.id,
      id,
      validateUpdatePositionInput(body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.positions.remove(user.id, id);
  }
}
