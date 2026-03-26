import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user);
  }

  @Patch()
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.usersService.updateMe(user, body);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listSessions(user);
  }

  @Delete('sessions/:id')
  revokeSession(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.revokeSession(user, id);
  }
}

