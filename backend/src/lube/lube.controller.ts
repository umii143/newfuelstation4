import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LubeService } from './lube.service';

@Controller('lube')
@UseGuards(JwtAuthGuard)
export class LubeController {
    constructor(private lubeService: LubeService) {}

    // ==================== PRODUCTS ====================

    @Get('stations/:stationId/products')
    async getProducts(@Param('stationId') stationId: string) {
        return this.lubeService.getProducts(stationId);
    }

    @Get('products/:productId')
    async getProductById(@Param('productId') productId: string) {
        return this.lubeService.getProductById(productId);
    }

    @Post('stations/:stationId/products')
    async createProduct(
        @Param('stationId') stationId: string,
        @Body()
        body: {
            productId: string;
            name: string;
            brand?: string;
            category?: string;
            unit?: string;
            costPrice: number;
            salePrice: number;
            currentStock: number;
            reorderLevel?: number;
            barcode?: string;
        }
    ) {
        return this.lubeService.createProduct({
            stationId,
            ...body,
        });
    }

    @Put('products/:productId')
    async updateProduct(
        @Param('productId') productId: string,
        @Body()
        body: {
            name?: string;
            brand?: string;
            category?: string;
            costPrice?: number;
            salePrice?: number;
            currentStock?: number;
            reorderLevel?: number;
            barcode?: string;
        }
    ) {
        return this.lubeService.updateProduct(productId, body);
    }

    @Delete('products/:productId')
    async deleteProduct(@Param('productId') productId: string) {
        return this.lubeService.deleteProduct(productId);
    }

    @Get('stations/:stationId/products/low-stock')
    async getLowStockProducts(@Param('stationId') stationId: string) {
        return this.lubeService.getLowStockProducts(stationId);
    }

    @Put('products/:productId/stock')
    async updateProductStock(
        @Param('productId') productId: string,
        @Body() body: { quantity: number }
    ) {
        return this.lubeService.updateProductStock(productId, body.quantity);
    }

    @Post('products/:productId/add-stock')
    async addStock(@Param('productId') productId: string, @Body() body: { quantity: number }) {
        return this.lubeService.addProductStock(productId, body.quantity);
    }

    @Post('products/:productId/deduct-stock')
    async deductStock(@Param('productId') productId: string, @Body() body: { quantity: number }) {
        return this.lubeService.deductProductStock(productId, body.quantity);
    }

    // ==================== SALES ====================

    @Get('stations/:stationId/sales')
    async getSales(
        @Param('stationId') stationId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('take') take?: string
    ) {
        return this.lubeService.getSales(stationId, {
            startDate,
            endDate,
            take: take ? parseInt(take) : 100,
        });
    }

    @Get('sales/:saleId')
    async getSaleById(@Param('saleId') saleId: string) {
        return this.lubeService.getSaleById(saleId);
    }

    @Post('sales')
    async createSale(
        @Body()
        body: {
            stationId: string;
            saleId: string;
            customerId?: string;
            totalAmount: number;
            discountPercent?: number;
            discountAmount?: number;
            netAmount: number;
            paymentMethod: string;
            soldById: string;
            items: Array<{
                productId: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            }>;
        }
    ) {
        return this.lubeService.createSale(body);
    }

    @Get('stations/:stationId/sales/summary')
    async getSalesSummary(
        @Param('stationId') stationId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.lubeService.getSalesSummary(stationId, new Date(startDate), new Date(endDate));
    }

    @Get('products/:productId/sales-report')
    async getProductSalesReport(
        @Param('productId') productId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.lubeService.getProductSalesReport(
            productId,
            new Date(startDate),
            new Date(endDate)
        );
    }
}
