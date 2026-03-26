import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/public.decorator';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: unknown) {
    return this.authService.login(body);
  }

  @Public()
  @Post('social/google')
  google(@Body() body: unknown) {
    return this.authService.socialLogin({ ...((body as object) ?? {}), provider: 'GOOGLE' });
  }

  @Public()
  @Post('social/apple')
  apple(@Body() body: unknown) {
    return this.authService.socialLogin({ ...((body as object) ?? {}), provider: 'APPLE' });
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: unknown) {
    return this.authService.refresh(body);
  }

  @Public()
  @Post('logout')
  logout(@Body() body: unknown) {
    return this.authService.logout(body);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() body: unknown) {
    return this.authService.verifyEmail(body);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: unknown) {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: unknown) {
    return this.authService.resetPassword(body);
  }
}

