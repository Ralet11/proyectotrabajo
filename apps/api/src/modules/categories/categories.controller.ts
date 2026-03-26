import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/public.decorator';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.categoriesService.listPublic(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.categoriesService.getPublicById(id);
  }
}

