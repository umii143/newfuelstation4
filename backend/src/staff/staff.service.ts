import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService) {}

    async getStaff(organizationId: string, businessUnit?: string) {
        return this.prisma.user.findMany({
            where: {
                organizationId,
                businessUnit: businessUnit || undefined,
            },
            orderBy: { fullName: 'asc' },
        });
    }

    async getStaffById(id: string) {
        const staff = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!staff) throw new NotFoundException('Staff member not found');
        return staff;
    }

    async addStaff(data: {
        fullName: string;
        email: string;
        phone?: string;
        role: string;
        pin?: string;
        organizationId: string;
        stationId?: string;
        businessUnit?: string;
    }) {
        return this.prisma.user.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }

    async updateStaff(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async deleteStaff(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }

    // ==================== ATTENDANCE ====================

    async getAttendance(
        organizationId: string,
        filters: {
            startDate?: string;
            endDate?: string;
            userId?: string;
            stationId?: string;
        }
    ) {
        const where: any = {
            user: { organizationId },
        };

        if (filters.userId) where.userId = filters.userId;
        if (filters.stationId) where.stationId = filters.stationId;
        if (filters.startDate && filters.endDate) {
            where.date = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return this.prisma.attendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        fullName: true,
                        role: true,
                    },
                },
                station: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { clockIn: 'desc' },
        });
    }

    async clockIn(userId: string, stationId: string, businessUnit: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.attendance.create({
            data: {
                userId,
                stationId,
                date: today,
                clockIn: new Date(),
                status: 'PRESENT',
                businessUnit,
            },
        });
    }

    async clockOut(id: string) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id },
        });

        if (!attendance) throw new NotFoundException('Attendance record not found');

        const clockOut = new Date();
        const clockIn = new Date(attendance.clockIn);
        const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
        const overtimeHours = Math.max(0, totalHours - 8);

        return this.prisma.attendance.update({
            where: { id },
            data: {
                clockOut,
                totalHours,
                overtimeHours,
                updatedAt: new Date(),
            },
        });
    }
}
