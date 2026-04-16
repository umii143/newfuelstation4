import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    async register(dto: {
        email: string;
        password: string;
        fullName: string;
        organizationName: string;
        stationName?: string;
    }) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // Create organization (for new signup)
        const organization = await this.prisma.organization.create({
            data: {
                name: dto.organizationName,
                subscriptionPlan: 'starter',
                subscriptionStatus: 'trial',
                trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        // Create default station
        const station = await this.prisma.station.create({
            data: {
                name: dto.stationName || 'Main Station',
                organizationId: organization.id,
                businessType: 'HYBRID', // FUEL, CNG, LUBE, or HYBRID
                isActive: true,
            },
        });

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
                organizationId: organization.id,
                stationId: station.id,
                role: 'admin', // First user is admin
            },
        });

        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            organization,
            station,
            token,
        };
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                organization: {
                    include: {
                        stations: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            organization: user.organization,
            stations: user.organization.stations,
            token,
        };
    }

    async loginWithGoogle(user: any) {
        // User is already validated by FirebaseAuthGuard and findOrCreateUser
        // We just need to fetch the full organization and station data
        const fullUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                organization: {
                    include: {
                        stations: true,
                    },
                },
            },
        });

        if (!fullUser) {
            throw new UnauthorizedException('User not found after Google auth');
        }

        if (!fullUser.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: fullUser.id },
            data: { lastLoginAt: new Date() },
        });

        const token = this.generateToken(fullUser);

        return {
            user: this.sanitizeUser(fullUser),
            organization: fullUser.organization,
            stations: fullUser.organization.stations,
            token,
        };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return this.sanitizeUser(user);
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            stationId: user.stationId,
        };
        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}
