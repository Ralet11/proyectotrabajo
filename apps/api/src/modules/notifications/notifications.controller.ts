import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('devices/push-token')
  registerPushToken(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.notificationsService.registerPushToken(user, body);
  }

  @Get('notifications')
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: Record<string, unknown>) {
    return this.notificationsService.list(user, query);
  }

  @Patch('notifications/:id/read')
  markRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notificationsService.markRead(user, id);
  }
}

