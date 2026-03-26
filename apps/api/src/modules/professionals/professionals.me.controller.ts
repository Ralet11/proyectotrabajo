import { Body, Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ProfessionalsService } from './professionals.service';

@ApiTags('me-professional-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/professional-profile')
export class ProfessionalsMeController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.professionalsService.getMyProfile(user);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.professionalsService.createMyProfile(user, body);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.professionalsService.updateMyProfile(user, body);
  }

  @Put('categories')
  replaceCategories(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.professionalsService.replaceCategories(user, body);
  }

  @Put('service-areas')
  replaceServiceAreas(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.professionalsService.replaceServiceAreas(user, body);
  }

  @Put('availability')
  updateAvailability(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.professionalsService.updateAvailability(user, body);
  }
}

