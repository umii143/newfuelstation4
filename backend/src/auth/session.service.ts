import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
    constructor(private prisma: PrismaService) {}

    async createOrUpdateSession(data: { userId: string; userAgent?: string; ipAddress?: string }) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

        // For simplicity, we'll update the session based on userAgent + userId
        // In a production app, you might want more granular session IDs
        const existingSession = await this.prisma.session.findFirst({
            where: {
                userId: data.userId,
                userAgent: data.userAgent,
                isActive: true,
            },
        });

        if (existingSession) {
            return await this.prisma.session.update({
                where: { id: existingSession.id },
                data: {
                    ipAddress: data.ipAddress,
                    lastActiveAt: new Date(),
                    expiresAt,
                },
            });
        }

        return await this.prisma.session.create({
            data: {
                userId: data.userId,
                userAgent: data.userAgent,
                ipAddress: data.ipAddress,
                expiresAt,
            },
        });
    }

    async deactivateSession(sessionId: string) {
        return await this.prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
    }

    async getUserSessions(userId: string) {
        return await this.prisma.session.findMany({
            where: { userId, isActive: true },
            orderBy: { lastActiveAt: 'desc' },
        });
    }

    async getActiveSessionCount(userId: string) {
        return await this.prisma.session.count({
            where: { userId, isActive: true },
        });
    }
}
