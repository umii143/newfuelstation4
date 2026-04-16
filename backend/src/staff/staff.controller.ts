import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
    constructor(private staffService: StaffService) {}

    @Get('organizations/:organizationId')
    async getStaff(
        @Param('organizationId') organizationId: string,
        @Query('businessUnit') businessUnit?: string
    ) {
        return this.staffService.getStaff(organizationId, businessUnit);
    }

    @Get(':id')
    async getStaffById(@Param('id') id: string) {
        return this.staffService.getStaffById(id);
    }

    @Post('organizations/:organizationId')
    async addStaff(@Param('organizationId') organizationId: string, @Body() data: any) {
        return this.staffService.addStaff({
            ...data,
            organizationId,
        });
    }

    @Put(':id')
    async updateStaff(@Param('id') id: string, @Body() data: any) {
        return this.staffService.updateStaff(id, data);
    }

    @Delete(':id')
    async deleteStaff(@Param('id') id: string) {
        return this.staffService.deleteStaff(id);
    }

    // ==================== ATTENDANCE ====================

    @Get('organizations/:organizationId/attendance')
    async getAttendance(
        @Param('organizationId') organizationId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('userId') userId?: string,
        @Query('stationId') stationId?: string
    ) {
        return this.staffService.getAttendance(organizationId, {
            startDate,
            endDate,
            userId,
            stationId,
        });
    }

    @Post('clock-in')
    async clockIn(@Body() body: { userId: string; stationId: string; businessUnit: string }) {
        return this.staffService.clockIn(body.userId, body.stationId, body.businessUnit);
    }

    @Post('clock-out/:id')
    async clockOut(@Param('id') id: string) {
        return this.staffService.clockOut(id);
    }
}
