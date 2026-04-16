import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from './decorators/roles.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';

@Controller('admin/security')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin', 'manager') // Only Admins and Managers can see system-wide logs
export class AdminSecurityController {
    constructor(private prisma: PrismaService) {}

    @Get('logs')
    async getAllLogs(
        @Query('email') email?: string,
        @Query('action') action?: string,
        @Query('limit') limit: string = '50',
        @Query('offset') offset: string = '0'
    ) {
        return await this.prisma.auditLog.findMany({
            where: {
                email: email ? { contains: email } : undefined,
                action: action || undefined,
            },
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
    }

    @Get('stats')
    async getSecurityStats() {
        const [totalLogs, failedLogins, activeSessions] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.count({ where: { status: 'FAILURE' } }),
            this.prisma.session.count({ where: { isActive: true } }),
        ]);

        return {
            totalLogs,
            failedLogins,
            activeSessions,
        };
    }
}
