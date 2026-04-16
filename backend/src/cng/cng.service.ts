import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CngService {
    constructor(private prisma: PrismaService) {}

    async getShifts(stationId: string, take: number = 50) {
        return this.prisma.cngShift.findMany({
            where: { stationId },
            orderBy: { startTime: 'desc' },
            take,
            include: {
                readings: {
                    include: {
                        nozzle: true,
                    },
                },
            },
        });
    }

    async getShiftById(shiftId: string) {
        return this.prisma.cngShift.findUnique({
            where: { id: shiftId },
            include: {
                readings: {
                    include: {
                        nozzle: true,
                    },
                },
                station: true,
            },
        });
    }

    async createShift(data: {
        stationId: string;
        shiftNumber: number;
        startedById: string;
        openingCash: number;
        readings?: { nozzleId: string; readingValue: number }[];
    }) {
        const { readings, ...shiftData } = data;
        return this.prisma.$transaction(async tx => {
            const shift = await tx.cngShift.create({
                data: {
                    ...shiftData,
                    startTime: new Date(),
                    status: 'open',
                },
            });

            if (readings && readings.length > 0) {
                await tx.cngReading.createMany({
                    data: readings.map(r => ({
                        shiftId: shift.id,
                        nozzleId: r.nozzleId,
                        readingType: 'OPENING',
                        readingValue: r.readingValue,
                        timestamp: new Date(),
                    })),
                });
            }

            return shift;
        });
    }

    async closeShift(
        shiftId: string,
        data: {
            closingCash: number;
            closedById: string;
            expenses?: number;
            recoveries?: number;
            credits?: number;
            digitalCash?: number;
            bankDeposits?: number;
            readings?: { nozzleId: string; readingValue: number; testVolume?: number }[];
        }
    ) {
        return this.prisma.$transaction(async tx => {
            // 1. Get shift data
            const shift = await tx.cngShift.findUnique({
                where: { id: shiftId },
            });

            if (!shift) throw new Error('Shift not found');

            // 2. Record closing readings and calculate revenue
            let totalRevenue = 0;
            if (data.readings && data.readings.length > 0) {
                for (const r of data.readings) {
                    await tx.cngReading.create({
                        data: {
                            shiftId,
                            nozzleId: r.nozzleId,
                            readingType: 'CLOSING',
                            readingValue: r.readingValue,
                            testVolume: r.testVolume || 0,
                            timestamp: new Date(),
                        },
                    });

                    // Update the master nozzle reading
                    await tx.cngNozzle.update({
                        where: { id: r.nozzleId },
                        data: { currentReading: r.readingValue },
                    });

                    // Calculate revenue for this nozzle
                    const openingReading = await tx.cngReading.findFirst({
                        where: { shiftId, nozzleId: r.nozzleId, readingType: 'OPENING' },
                    });

                    if (openingReading) {
                        const netQty =
                            r.readingValue - openingReading.readingValue - (r.testVolume || 0);
                        totalRevenue += netQty * 200; // Standard CNG Rate @ 200
                    }
                }
            }

            // 3. Calculate variance
            const opening = shift.openingCash || 0;
            const recoveries = data.recoveries || 0;
            const expectedTotal = opening + totalRevenue + recoveries;

            const actualTotal =
                (data.closingCash || 0) +
                (data.digitalCash || 0) +
                (data.bankDeposits || 0) +
                (data.credits || 0) +
                (data.expenses || 0);

            const cashVariance = actualTotal - expectedTotal;

            // 4. Update shift record
            return tx.cngShift.update({
                where: { id: shiftId },
                data: {
                    closingCash: data.closingCash,
                    closedById: data.closedById,
                    endTime: new Date(),
                    totalRevenue: totalRevenue,
                    expenses: data.expenses || 0,
                    recoveries: data.recoveries || 0,
                    credits: data.credits || 0,
                    digitalCash: data.digitalCash || 0,
                    bankDeposits: data.bankDeposits || 0,
                    cashVariance,
                    status: 'closed',
                },
            });
        });
    }

    async getNozzles(stationId: string) {
        return this.prisma.cngNozzle.findMany({
            where: { stationId },
            orderBy: { nozzleNumber: 'asc' },
        });
    }

    async createNozzle(data: {
        stationId: string;
        nozzleNumber: number;
        name: string;
        currentReading: number;
    }) {
        return this.prisma.cngNozzle.create({ data });
    }
}
