import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { parseEnv, apiEnvSchema } from '@oficios/config';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AdminModule } from './modules/admin/admin.module';

const env = parseEnv(apiEnvSchema, process.env);

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProfessionalsModule,
    ServiceRequestsModule,
    ReviewsModule,
    NotificationsModule,
    UploadsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: 'API_ENV',
      useValue: env,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

