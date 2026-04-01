import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { API_ENV } from '../../common/env.module';
import type { AuthenticatedUser } from '../../common/authenticated-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(API_ENV) env: Record<string, string>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: AuthenticatedUser & { type: 'access' | 'refresh' }) {
    return {
      sub: payload.sub,
      roles: payload.roles,
      sessionId: payload.sessionId,
      sessionVersion: payload.sessionVersion,
    } satisfies AuthenticatedUser;
  }
}

