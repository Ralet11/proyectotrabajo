import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [CategoriesModule, ReviewsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

