import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { CurrentUser } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Public } from '../../common/public.decorator';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    return this.reviewsService.create(user, body);
  }

  @Public()
  @Get('professionals/:id/reviews')
  listPublicByProfessional(@Param('id') id: string, @Query() query: Record<string, unknown>) {
    return this.reviewsService.listPublicByProfessional(id, query);
  }
}

