import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LubeService {
    constructor(private prisma: PrismaService) {}

    // ==================== PRODUCTS ====================

    async getProducts(stationId: string) {
        return this.prisma.lubeProduct.findMany({
            where: { stationId },
            orderBy: { name: 'asc' },
        });
    }

    async getProductById(productId: string) {
        return this.prisma.lubeProduct.findUnique({
            where: { id: productId },
        });
    }

    async createProduct(data: {
        stationId: string;
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
    }) {
        return this.prisma.lubeProduct.create({ data });
    }

    async updateProduct(
        productId: string,
        data: {
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
        return this.prisma.lubeProduct.update({
            where: { id: productId },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async deleteProduct(productId: string) {
        return this.prisma.lubeProduct.delete({
            where: { id: productId },
        });
    }

    async getLowStockProducts(stationId: string) {
        return this.prisma.lubeProduct.findMany({
            where: {
                stationId,
                currentStock: {
                    lte: this.prisma.lubeProduct.fields.reorderLevel,
                },
            },
            orderBy: { currentStock: 'asc' },
        });
    }

    async updateProductStock(productId: string, quantity: number) {
        return this.prisma.lubeProduct.update({
            where: { id: productId },
            data: { currentStock: quantity, updatedAt: new Date() },
        });
    }

    async addProductStock(productId: string, quantity: number) {
        const product = await this.prisma.lubeProduct.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return this.prisma.lubeProduct.update({
            where: { id: productId },
            data: {
                currentStock: product.currentStock + quantity,
                updatedAt: new Date(),
            },
        });
    }

    async deductProductStock(productId: string, quantity: number) {
        const product = await this.prisma.lubeProduct.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        if (product.currentStock < quantity) {
            throw new Error('Insufficient stock');
        }

        return this.prisma.lubeProduct.update({
            where: { id: productId },
            data: {
                currentStock: product.currentStock - quantity,
                updatedAt: new Date(),
            },
        });
    }

    // ==================== SALES ====================

    async getSales(stationId: string, filters?: any) {
        const where: any = { stationId };

        if (filters?.startDate && filters?.endDate) {
            where.saleTime = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return this.prisma.lubeSale.findMany({
            where,
            orderBy: { saleTime: 'desc' },
            take: filters?.take || 100,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                brand: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async getSaleById(saleId: string) {
        return this.prisma.lubeSale.findUnique({
            where: { id: saleId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                station: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async createSale(data: {
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
    }) {
        // Create sale with items in a transaction
        return this.prisma.$transaction(async tx => {
            // Create the sale
            const sale = await tx.lubeSale.create({
                data: {
                    stationId: data.stationId,
                    saleId: data.saleId,
                    customerId: data.customerId,
                    totalAmount: data.totalAmount,
                    discountPercent: data.discountPercent,
                    discountAmount: data.discountAmount,
                    netAmount: data.netAmount,
                    paymentMethod: data.paymentMethod,
                    soldById: data.soldById,
                    saleTime: new Date(),
                },
            });

            // Create sale items and deduct stock
            for (const item of data.items) {
                // Create sale item
                await tx.lubeSaleItem.create({
                    data: {
                        saleId: sale.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                    },
                });

                // Deduct stock
                const product = await tx.lubeProduct.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                if (product.currentStock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`
                    );
                }

                await tx.lubeProduct.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: product.currentStock - item.quantity,
                        updatedAt: new Date(),
                    },
                });
            }

            // Return sale with items
            return tx.lubeSale.findUnique({
                where: { id: sale.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });
    }

    async getSalesSummary(stationId: string, startDate: Date, endDate: Date) {
        const sales = await this.prisma.lubeSale.aggregate({
            where: {
                stationId,
                saleTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                totalAmount: true,
                netAmount: true,
                discountAmount: true,
            },
            _count: true,
        });

        // Get top selling products
        const topProducts = await this.prisma.lubeSaleItem.groupBy({
            by: ['productId'],
            where: {
                sale: {
                    stationId,
                    saleTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            _sum: {
                quantity: true,
                totalPrice: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 10,
        });

        // Get product details for top products
        const topProductDetails = await Promise.all(
            topProducts.map(async tp => {
                const product = await this.prisma.lubeProduct.findUnique({
                    where: { id: tp.productId },
                    select: { id: true, name: true, brand: true },
                });
                return {
                    product,
                    quantitySold: tp._sum.quantity,
                    revenue: tp._sum.totalPrice,
                };
            })
        );

        return {
            summary: sales,
            topProducts: topProductDetails,
        };
    }

    async getProductSalesReport(productId: string, startDate: Date, endDate: Date) {
        const sales = await this.prisma.lubeSaleItem.findMany({
            where: {
                productId,
                sale: {
                    saleTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            include: {
                sale: {
                    select: {
                        saleId: true,
                        saleTime: true,
                        paymentMethod: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const summary = await this.prisma.lubeSaleItem.aggregate({
            where: {
                productId,
                sale: {
                    saleTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            _sum: {
                quantity: true,
                totalPrice: true,
            },
            _count: true,
        });

        return {
            sales,
            summary,
        };
    }
}
