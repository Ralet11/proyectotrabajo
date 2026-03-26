import { Module } from '@nestjs/common';

import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsMeController } from './professionals.me.controller';
import { ProfessionalsService } from './professionals.service';

@Module({
  controllers: [ProfessionalsController, ProfessionalsMeController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}

