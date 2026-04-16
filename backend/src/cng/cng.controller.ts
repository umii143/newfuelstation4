import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CngService } from './cng.service';

@Controller('cng')
export class CngController {
    constructor(private readonly cngService: CngService) {}

    @Get('shifts')
    async getShifts(@Query('stationId') stationId: string, @Query('take') take?: string) {
        return this.cngService.getShifts(stationId, take ? parseInt(take) : 50);
    }

    @Get('shifts/:id')
    async getShiftById(@Param('id') id: string) {
        return this.cngService.getShiftById(id);
    }

    @Post('shifts')
    async createShift(@Body() data: any) {
        return this.cngService.createShift(data);
    }

    @Post('shifts/:id/close')
    async closeShift(@Param('id') id: string, @Body() data: any) {
        return this.cngService.closeShift(id, data);
    }

    @Get('nozzles')
    async getNozzles(@Query('stationId') stationId: string) {
        return this.cngService.getNozzles(stationId);
    }

    @Post('nozzles')
    async createNozzle(@Body() data: any) {
        return this.cngService.createNozzle(data);
    }
}
