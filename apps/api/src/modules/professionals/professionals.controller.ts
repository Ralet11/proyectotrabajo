import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/public.decorator';
import { ProfessionalsService } from './professionals.service';

@ApiTags('professionals')
@Public()
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  search(@Query() query: Record<string, unknown>) {
    return this.professionalsService.searchPublic(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.professionalsService.getPublicById(id);
  }
}

