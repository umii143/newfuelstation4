import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminSecurityController } from './admin-security.controller';
import { AuditService } from './audit.service';
import { AuthVerifyController } from './auth-verify.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase-auth.strategy';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
    imports: [
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
        }),
    ],
    controllers: [AuthController, AuthVerifyController, SessionController, AdminSecurityController],
    providers: [
        AuthService,
        JwtStrategy,
        FirebaseAuthStrategy,
        AuditService,
        SessionService,
        RolesGuard,
    ],
    exports: [
        AuthService,
        JwtStrategy,
        FirebaseAuthStrategy,
        AuditService,
        SessionService,
        RolesGuard,
        PassportModule,
    ],
})
export class AuthModule {}
