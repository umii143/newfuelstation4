import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, AuditService } from './audit.service';
import { firebaseAuth } from './firebase-admin.config';
import { SessionService } from './session.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase') {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private sessionService: SessionService
    ) {
        super();
    }

    async validate(request: any): Promise<any> {
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            // Verify Firebase ID token
            const decodedToken = await firebaseAuth.verifyIdToken(token);

            // Get or create user in database
            const user = await this.findOrCreateUser({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email || '',
                fullName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
                photoURL: decodedToken.picture,
            });

            // PHASE 2: Create/Update session and Audit Log
            const ipAddress = request.ip || request.headers['x-forwarded-for'];
            const userAgent = request.headers['user-agent'];

            await this.sessionService.createOrUpdateSession({
                userId: user.id,
                ipAddress,
                userAgent,
            });

            await this.auditService.log({
                userId: user.id,
                email: user.email,
                action: AuditAction.LOGIN_SUCCESS,
                status: 'SUCCESS',
                ipAddress,
                userAgent,
            });

            return user;
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            throw new UnauthorizedException('Invalid authentication token');
        }
    }

    private extractToken(request: any): string | null {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }

    private async findOrCreateUser(data: {
        firebaseUid: string;
        email: string;
        fullName: string;
        photoURL?: string;
    }) {
        // Try to find existing user by Firebase UID
        let user = await this.prisma.user.findUnique({
            where: { firebaseUid: data.firebaseUid },
        });

        if (!user) {
            // Check if user exists by email (migration case)
            user = await this.prisma.user.findUnique({
                where: { email: data.email },
            });

            if (user) {
                // Link existing user to Firebase
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid: data.firebaseUid,
                        authMethod: 'firebase',
                        photoURL: data.photoURL,
                    },
                });
            } else {
                // Create new user
                user = await this.prisma.user.create({
                    data: {
                        firebaseUid: data.firebaseUid,
                        email: data.email,
                        fullName: data.fullName,
                        photoURL: data.photoURL,
                        authMethod: 'firebase',
                        role: 'user',
                    },
                });
            }
        }

        return user;
    }
}
