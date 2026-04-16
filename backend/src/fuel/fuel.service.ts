import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FuelService {
    constructor(private prisma: PrismaService) {}

    // ==================== FUEL SHIFTS ====================

    async getShifts(stationId: string, take: number = 50) {
        return this.prisma.fuelShift.findMany({
            where: { stationId },
            orderBy: { startTime: 'desc' },
            take,
            include: {
                readings: {
                    include: {
                        nozzle: true,
                    },
                },
                sales: {
                    select: {
                        id: true,
                        totalAmount: true,
                        quantityLiters: true,
                        fuelType: true,
                    },
                },
            },
        });
    }

    async getShiftById(shiftId: string) {
        return this.prisma.fuelShift.findUnique({
            where: { id: shiftId },
            include: {
                sales: true,
                readings: {
                    include: {
                        nozzle: true,
                    },
                },
                station: {
                    select: {
                        id: true,
                        name: true,
                        organizationId: true,
                    },
                },
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
            const shift = await tx.fuelShift.create({
                data: {
                    ...shiftData,
                    startTime: new Date(),
                    status: 'open',
                },
            });

            if (readings && readings.length > 0) {
                await tx.fuelReading.createMany({
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
            // 1. Record closing readings and update nozzle current readings
            if (data.readings && data.readings.length > 0) {
                for (const r of data.readings) {
                    await tx.fuelReading.create({
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
                    await tx.fuelNozzle.update({
                        where: { id: r.nozzleId },
                        data: { currentReading: r.readingValue },
                    });
                }
            }

            // 2. Calculate total revenue for this shift from sales
            const sales = await tx.fuelSale.aggregate({
                where: { shiftId },
                _sum: { totalAmount: true },
            });
            const totalRevenue = sales._sum.totalAmount || 0;

            // 3. Get shift opening cash
            const shift = await tx.fuelShift.findUnique({
                where: { id: shiftId },
            });

            if (!shift) {
                throw new Error('Shift not found');
            }

            // 4. Calculate variance using Total Value Captured approach
            // Expected = Opening + Revenue + Recoveries
            const opening = shift.openingCash || 0;
            const revenue = totalRevenue || 0;
            const recoveries = data.recoveries || 0;
            const expectedTotal = opening + revenue + recoveries;

            // Actual = Closing Cash + Digital + Bank + Credits + Expenses
            const actualTotal =
                (data.closingCash || 0) +
                (data.digitalCash || 0) +
                (data.bankDeposits || 0) +
                (data.credits || 0) +
                (data.expenses || 0);

            const cashVariance = actualTotal - expectedTotal;

            return tx.fuelShift.update({
                where: { id: shiftId },
                data: {
                    closingCash: data.closingCash,
                    closedById: data.closedById,
                    endTime: new Date(),
                    totalRevenue,
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

    // ==================== FUEL SALES ====================

    async getSales(stationId: string, filters?: any) {
        const where: any = { stationId };

        if (filters?.shiftId) where.shiftId = filters.shiftId;
        if (filters?.fuelType) where.fuelType = filters.fuelType;
        if (filters?.startDate && filters?.endDate) {
            where.saleTime = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return this.prisma.fuelSale.findMany({
            where,
            orderBy: { saleTime: 'desc' },
            take: filters?.take || 100,
            include: {
                shift: {
                    select: {
                        id: true,
                        shiftNumber: true,
                    },
                },
            },
        });
    }

    async createSale(data: {
        stationId: string;
        shiftId?: string;
        pumpId?: string;
        fuelType: string;
        quantityLiters: number;
        ratePerLiter: number;
        totalAmount: number;
        paymentMethod: string;
        customerId?: string;
    }) {
        return this.prisma.fuelSale.create({
            data: {
                ...data,
                saleTime: new Date(),
            },
        });
    }

    async getSalesSummary(stationId: string, startDate: Date, endDate: Date) {
        const sales = await this.prisma.fuelSale.groupBy({
            by: ['fuelType', 'paymentMethod'],
            where: {
                stationId,
                saleTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                totalAmount: true,
                quantityLiters: true,
            },
            _count: true,
        });

        return sales;
    }

    // ==================== FUEL TANKS ====================

    async getTanks(stationId: string) {
        return this.prisma.fuelTank.findMany({
            where: { stationId },
            include: {
                nozzles: true,
            },
            orderBy: { tankNumber: 'asc' },
        });
    }

    async getTankById(tankId: string) {
        return this.prisma.fuelTank.findUnique({
            where: { id: tankId },
            include: {
                nozzles: true,
            },
        });
    }

    async createTank(data: {
        stationId: string;
        tankNumber: number;
        fuelType: string;
        capacity: number;
        currentStock: number;
        reorderLevel?: number;
        iotDeviceId?: string;
    }) {
        return this.prisma.fuelTank.create({ data });
    }

    async updateTankStock(tankId: string, currentStock: number) {
        return this.prisma.fuelTank.update({
            where: { id: tankId },
            data: { currentStock, updatedAt: new Date() },
        });
    }

    async addStockToTank(tankId: string, quantity: number) {
        const tank = await this.prisma.fuelTank.findUnique({
            where: { id: tankId },
        });

        if (!tank) {
            throw new Error('Tank not found');
        }

        const newStock = tank.currentStock + quantity;

        return this.prisma.fuelTank.update({
            where: { id: tankId },
            data: { currentStock: newStock, updatedAt: new Date() },
        });
    }

    async deductStockFromTank(tankId: string, quantity: number) {
        const tank = await this.prisma.fuelTank.findUnique({
            where: { id: tankId },
        });

        if (!tank) {
            throw new Error('Tank not found');
        }

        const newStock = tank.currentStock - quantity;

        if (newStock < 0) {
            throw new Error('Insufficient stock in tank');
        }

        return this.prisma.fuelTank.update({
            where: { id: tankId },
            data: { currentStock: newStock, updatedAt: new Date() },
        });
    }

    // ==================== FUEL NOZZLES ====================

    async getNozzles(stationId: string) {
        return this.prisma.fuelNozzle.findMany({
            where: {
                tank: {
                    stationId,
                },
            },
            include: {
                tank: true,
            },
            orderBy: { nozzleNumber: 'asc' },
        });
    }

    async createNozzle(data: {
        tankId: string;
        nozzleNumber: number;
        name: string;
        currentReading: number;
    }) {
        return this.prisma.fuelNozzle.create({ data });
    }

    async updateNozzle(nozzleId: string, data: any) {
        return this.prisma.fuelNozzle.update({
            where: { id: nozzleId },
            data: { ...data, updatedAt: new Date() },
        });
    }
}
