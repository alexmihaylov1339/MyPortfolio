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
import type { CreateModelDto } from './dto/create-model.dto';
import type { UpdateModelDto } from './dto/update-model.dto';
import {
  validateCreateModelInput,
  validateUpdateModelInput,
} from './models-validation';
import { ModelsService } from './models.service';

@UseGuards(AuthGuard)
@Controller('models')
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.models.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.models.findOneForUser(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreateModelDto) {
    return this.models.create(user.id, validateCreateModelInput(body));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateModelDto,
  ) {
    return this.models.update(user.id, id, validateUpdateModelInput(body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.models.remove(user.id, id);
  }
}
