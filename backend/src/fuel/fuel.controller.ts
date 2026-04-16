import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FuelService } from './fuel.service';

@Controller('fuel')
@UseGuards(JwtAuthGuard)
export class FuelController {
    constructor(private fuelService: FuelService) {}

    // ==================== SHIFTS ====================

    @Get('stations/:stationId/shifts')
    async getShifts(@Param('stationId') stationId: string, @Query('take') take?: string) {
        return this.fuelService.getShifts(stationId, take ? parseInt(take) : 50);
    }

    @Get('shifts/:shiftId')
    async getShiftById(@Param('shiftId') shiftId: string) {
        return this.fuelService.getShiftById(shiftId);
    }

    @Post('stations/:stationId/shifts')
    async createShift(
        @Param('stationId') stationId: string,
        @Body()
        body: {
            shiftNumber: number;
            startedById: string;
            openingCash: number;
            readings?: { nozzleId: string; readingValue: number }[];
        }
    ) {
        return this.fuelService.createShift({
            stationId,
            ...body,
        });
    }

    @Put('shifts/:shiftId/close')
    async closeShift(
        @Param('shiftId') shiftId: string,
        @Body()
        body: {
            closingCash: number;
            closedById: string;
            expenses?: number;
            recoveries?: number;
            credits?: number;
            readings?: { nozzleId: string; readingValue: number; testVolume?: number }[];
        }
    ) {
        return this.fuelService.closeShift(shiftId, body);
    }

    // ==================== SALES ====================

    @Get('stations/:stationId/sales')
    async getSales(
        @Param('stationId') stationId: string,
        @Query('shiftId') shiftId?: string,
        @Query('fuelType') fuelType?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('take') take?: string
    ) {
        return this.fuelService.getSales(stationId, {
            shiftId,
            fuelType,
            startDate,
            endDate,
            take: take ? parseInt(take) : 100,
        });
    }

    @Post('sales')
    async createSale(
        @Body()
        body: {
            stationId: string;
            shiftId?: string;
            pumpId?: string;
            fuelType: string;
            quantityLiters: number;
            ratePerLiter: number;
            totalAmount: number;
            paymentMethod: string;
            customerId?: string;
        }
    ) {
        return this.fuelService.createSale(body);
    }

    @Get('stations/:stationId/sales/summary')
    async getSalesSummary(
        @Param('stationId') stationId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.fuelService.getSalesSummary(stationId, new Date(startDate), new Date(endDate));
    }

    // ==================== TANKS ====================

    @Get('stations/:stationId/tanks')
    async getTanks(@Param('stationId') stationId: string) {
        return this.fuelService.getTanks(stationId);
    }

    @Get('tanks/:tankId')
    async getTankById(@Param('tankId') tankId: string) {
        return this.fuelService.getTankById(tankId);
    }

    @Post('stations/:stationId/tanks')
    async createTank(
        @Param('stationId') stationId: string,
        @Body()
        body: {
            tankNumber: number;
            fuelType: string;
            capacity: number;
            currentStock: number;
            reorderLevel?: number;
            iotDeviceId?: string;
        }
    ) {
        return this.fuelService.createTank({
            stationId,
            ...body,
        });
    }

    @Put('tanks/:tankId/stock')
    async updateTankStock(@Param('tankId') tankId: string, @Body() body: { currentStock: number }) {
        return this.fuelService.updateTankStock(tankId, body.currentStock);
    }

    @Post('tanks/:tankId/add-stock')
    async addStock(@Param('tankId') tankId: string, @Body() body: { quantity: number }) {
        return this.fuelService.addStockToTank(tankId, body.quantity);
    }

    @Post('tanks/:tankId/deduct-stock')
    async deductStock(@Param('tankId') tankId: string, @Body() body: { quantity: number }) {
        return this.fuelService.deductStockFromTank(tankId, body.quantity);
    }

    // ==================== NOZZLES ====================

    @Get('stations/:stationId/nozzles')
    async getNozzles(@Param('stationId') stationId: string) {
        return this.fuelService.getNozzles(stationId);
    }

    @Post('tanks/:tankId/nozzles')
    async createNozzle(
        @Param('tankId') tankId: string,
        @Body()
        body: {
            nozzleNumber: number;
            name: string;
            currentReading: number;
        }
    ) {
        return this.fuelService.createNozzle({
            tankId,
            ...body,
        });
    }

    @Put('nozzles/:nozzleId')
    async updateNozzle(@Param('nozzleId') nozzleId: string, @Body() body: any) {
        return this.fuelService.updateNozzle(nozzleId, body);
    }
}
