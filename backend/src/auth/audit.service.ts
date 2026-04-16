import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    LOGOUT = 'LOGOUT',
    SESSION_TERMINATED = 'SESSION_TERMINATED',
    PASSWORD_CHANGE = 'PASSWORD_CHANGE',
    OAUTH_LINK = 'OAUTH_LINK',
}

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) {}

    async log(data: {
        userId?: string;
        email?: string;
        action: AuditAction | string;
        status: 'SUCCESS' | 'FAILURE' | 'INFO';
        ipAddress?: string;
        userAgent?: string;
        metadata?: any;
    }) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    email: data.email,
                    action: data.action,
                    status: data.status,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    metadata: data.metadata || {},
                },
            });
        } catch (error) {
            // We don't want audit logging failures to crash the application,
            // but we should definitely log the error to the console.
            console.error('Failed to create audit log:', error);
        }
    }
}
