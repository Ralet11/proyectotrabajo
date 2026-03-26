import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ServiceRequestsService } from './service-requests.service';

@ApiTags('service-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post('service-requests')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.serviceRequestsService.create(user, body);
  }

  @Get('me/service-requests')
  listMine(@CurrentUser() user: AuthenticatedUser, @Query() query: Record<string, unknown>) {
    return this.serviceRequestsService.listMine(user, query);
  }

  @Get('service-requests/:id')
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.getById(user, id);
  }

  @Post('service-requests/:id/accept')
  accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.accept(user, id);
  }

  @Post('service-requests/:id/reject')
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.reject(user, id);
  }

  @Post('service-requests/:id/cancel')
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.cancel(user, id);
  }

  @Post('service-requests/:id/complete')
  complete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.complete(user, id);
  }

  @Get('service-requests/:id/messages')
  listMessages(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.serviceRequestsService.listMessages(user, id);
  }

  @Post('service-requests/:id/messages')
  createMessage(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: unknown) {
    return this.serviceRequestsService.createMessage(user, id, body);
  }
}

