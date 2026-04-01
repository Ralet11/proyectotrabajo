import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, Prisma, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  socialLoginSchema,
  verifyEmailSchema,
} from '@oficios/contracts';

import { API_ENV } from '../../common/env.module';
import { PrismaService } from '../../common/prisma/prisma.service';

type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  emailVerifiedAt: Date | null;
  sessionVersion: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(API_ENV) private readonly env: Record<string, string>,
  ) {}

  async register(payload: unknown) {
    const input = registerSchema.parse(payload);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        roles: [UserRole.CUSTOMER],
        authIdentities: {
          create: {
            provider: AuthProvider.PASSWORD,
            providerUserId: input.email.toLowerCase(),
            passwordHash,
          },
        },
      },
      select: this.safeUserSelect(),
    });

    return this.createSessionForUser(user, input.email);
  }

  async login(payload: unknown) {
    const input = loginSchema.parse(payload);
    const email = input.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        authIdentities: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordIdentity = user.authIdentities.find((identity) => identity.provider === AuthProvider.PASSWORD);

    if (!passwordIdentity?.passwordHash) {
      throw new UnauthorizedException('Password login not available for this account');
    }

    const passwordMatches = await argon2.verify(passwordIdentity.passwordHash, input.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSessionForUser(user, input.deviceName);
  }

  async socialLogin(payload: unknown) {
    const input = socialLoginSchema.parse(payload);
    const email = this.resolveSocialEmail(input.idToken);

    if (!email) {
      throw new NotImplementedException(
        'Social token verification requires provider SDK/JWKS setup. Use dev:<email> as idToken during local development.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { authIdentities: true },
    });

    const providerIdentity = existingUser?.authIdentities.find(
      (identity) => identity.provider === (input.provider as AuthProvider),
    );

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          email,
          firstName: 'Nuevo',
          lastName: 'Usuario',
          roles: [UserRole.CUSTOMER],
          emailVerifiedAt: new Date(),
          authIdentities: {
            create: {
              provider: input.provider as AuthProvider,
              providerUserId: email,
            },
          },
        },
        include: { authIdentities: true },
      }));

    if (existingUser && !providerIdentity) {
      await this.prisma.authIdentity.create({
        data: {
          userId: user.id,
          provider: input.provider as AuthProvider,
          providerUserId: email,
        },
      });
    }

    const safeUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: this.safeUserSelect(),
    });

    return this.createSessionForUser(safeUser, input.deviceName ?? `${input.provider}-social`);
  }

  async refresh(payload: unknown) {
    const input = refreshTokenSchema.parse(payload);
    const decoded = await this.verifyToken(input.refreshToken, this.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: { select: this.safeUserSelect() } },
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const refreshMatches = await argon2.verify(session.refreshTokenHash, input.refreshToken);
    if (!refreshMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.user.sessionVersion !== decoded.sessionVersion) {
      throw new UnauthorizedException('Session version mismatch');
    }

    return this.issueTokens(session.user, session.id);
  }

  async logout(payload: unknown) {
    const input = refreshTokenSchema.parse(payload);

    try {
      const decoded = await this.verifyToken(input.refreshToken, this.env.JWT_REFRESH_SECRET);
      await this.prisma.session.update({
        where: { id: decoded.sessionId },
        data: { revokedAt: new Date() },
      });
    } catch {
      return { success: true };
    }

    return { success: true };
  }

  async verifyEmail(payload: unknown) {
    const input = verifyEmailSchema.parse(payload);
    const decoded = await this.verifyToken(input.token, this.env.JWT_ACCESS_SECRET);

    if (decoded.type !== 'verify-email') {
      throw new BadRequestException('Invalid email verification token');
    }

    await this.prisma.user.update({
      where: { id: decoded.sub },
      data: { emailVerifiedAt: new Date() },
    });

    return { success: true };
  }

  async forgotPassword(payload: unknown) {
    const input = forgotPasswordSchema.parse(payload);
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      return { success: true };
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id, type: 'reset-password' },
      {
        secret: this.env.JWT_ACCESS_SECRET,
        expiresIn: '30m',
      },
    );

    return {
      success: true,
      resetToken: process.env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async resetPassword(payload: unknown) {
    const input = resetPasswordSchema.parse(payload);
    const decoded = await this.verifyToken(input.token, this.env.JWT_ACCESS_SECRET);

    if (decoded.type !== 'reset-password') {
      throw new BadRequestException('Invalid reset token');
    }

    const passwordHash = await argon2.hash(input.newPassword);

    await this.prisma.$transaction([
      this.prisma.authIdentity.updateMany({
        where: {
          userId: decoded.sub,
          provider: AuthProvider.PASSWORD,
        },
        data: { passwordHash },
      }),
      this.prisma.user.update({
        where: { id: decoded.sub },
        data: { sessionVersion: { increment: 1 } },
      }),
    ]);

    return { success: true };
  }

  private async createSessionForUser(user: SafeUser, deviceName?: string) {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        deviceName,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return this.issueTokens(user, session.id);
  }

  private async issueTokens(user: SafeUser, sessionId: string) {
    const accessPayload = {
      sub: user.id,
      roles: user.roles,
      sessionId,
      sessionVersion: user.sessionVersion,
      type: 'access',
    } as const;

    const refreshPayload = {
      sub: user.id,
      roles: user.roles,
      sessionId,
      sessionVersion: user.sessionVersion,
      type: 'refresh',
    } as const;

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        revokedAt: null,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      },
    };
  }

  private resolveSocialEmail(idToken: string) {
    if (idToken.startsWith('dev:')) {
      return idToken.replace(/^dev:/, '').trim().toLowerCase();
    }

    return null;
  }

  private async verifyToken(token: string, secret: string) {
    try {
      return await this.jwtService.verifyAsync<Record<string, any>>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private safeUserSelect(): Prisma.UserSelect {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      roles: true,
      emailVerifiedAt: true,
      sessionVersion: true,
    };
  }
}
