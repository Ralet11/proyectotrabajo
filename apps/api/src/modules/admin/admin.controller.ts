import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('users')
  listUsers(@Query() query: Record<string, unknown>) {
    return this.adminService.listUsers(query);
  }

  @Get('professionals')
  listProfessionals(@Query() query: Record<string, unknown>) {
    return this.adminService.listProfessionals(query);
  }

  @Post('professionals/:id/approve')
  approveProfessional(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminService.approveProfessional(user, id, body);
  }

  @Post('professionals/:id/reject')
  rejectProfessional(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.adminService.rejectProfessional(user, id, body);
  }

  @Post('categories')
  createCategory(@Body() body: unknown) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get('service-requests')
  listServiceRequests(@Query() query: Record<string, unknown>) {
    return this.adminService.listServiceRequests(query);
  }

  @Get('reviews')
  listReviews(@Query() query: Record<string, unknown>) {
    return this.adminService.listReviews(query);
  }

  @Post('reviews/:id/hide')
  hideReview(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.adminService.hideReview(user, id);
  }

  @Post('reviews/:id/unhide')
  unhideReview(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.adminService.unhideReview(user, id);
  }
}

