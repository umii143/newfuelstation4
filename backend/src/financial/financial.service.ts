import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancialService {
    constructor(private prisma: PrismaService) {}

    // ==================== CUSTOMERS ====================

    async getCustomers(organizationId: string) {
        return this.prisma.customer.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
        });
    }

    async getCustomerById(customerId: string) {
        return this.prisma.customer.findUnique({
            where: { id: customerId },
        });
    }

    async createCustomer(data: {
        organizationId: string;
        customerId: string;
        name: string;
        phone?: string;
        email?: string;
        address?: string;
        creditLimit?: number;
        customerType?: string;
    }) {
        return this.prisma.customer.create({
            data: {
                ...data,
                currentBalance: 0,
            },
        });
    }

    async updateCustomer(
        customerId: string,
        data: {
            name?: string;
            phone?: string;
            email?: string;
            address?: string;
            creditLimit?: number;
            customerType?: string;
        }
    ) {
        return this.prisma.customer.update({
            where: { id: customerId },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async deleteCustomer(customerId: string) {
        return this.prisma.customer.delete({
            where: { id: customerId },
        });
    }

    async updateCustomerBalance(customerId: string, amount: number) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return this.prisma.customer.update({
            where: { id: customerId },
            data: {
                currentBalance: customer.currentBalance + amount,
                updatedAt: new Date(),
            },
        });
    }

    async getCustomersWithCredit(organizationId: string) {
        return this.prisma.customer.findMany({
            where: {
                organizationId,
                currentBalance: { gt: 0 },
            },
            orderBy: { currentBalance: 'desc' },
        });
    }

    // ==================== SUPPLIERS ====================

    async getSuppliers(organizationId: string) {
        return this.prisma.supplier.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
        });
    }

    async getSupplierById(supplierId: string) {
        return this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
    }

    async createSupplier(data: {
        organizationId: string;
        supplierId: string;
        name: string;
        phone?: string;
        email?: string;
        address?: string;
        paymentTerms?: string;
    }) {
        return this.prisma.supplier.create({
            data: {
                ...data,
                currentBalance: 0,
            },
        });
    }

    async updateSupplier(
        supplierId: string,
        data: {
            name?: string;
            phone?: string;
            email?: string;
            address?: string;
            paymentTerms?: string;
        }
    ) {
        return this.prisma.supplier.update({
            where: { id: supplierId },
            data: { ...data, updatedAt: new Date() },
        });
    }

    async deleteSupplier(supplierId: string) {
        return this.prisma.supplier.delete({
            where: { id: supplierId },
        });
    }

    async updateSupplierBalance(supplierId: string, amount: number) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        return this.prisma.supplier.update({
            where: { id: supplierId },
            data: {
                currentBalance: supplier.currentBalance + amount,
                updatedAt: new Date(),
            },
        });
    }

    async getSuppliersWithBalance(organizationId: string) {
        return this.prisma.supplier.findMany({
            where: {
                organizationId,
                currentBalance: { gt: 0 },
            },
            orderBy: { currentBalance: 'desc' },
        });
    }

    // ==================== EXPENSES ====================

    async getExpenses(stationId: string, filters?: any) {
        const where: any = { stationId };

        if (filters?.category) where.category = filters.category;
        if (filters?.startDate && filters?.endDate) {
            where.expenseDate = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        return this.prisma.expense.findMany({
            where,
            orderBy: { expenseDate: 'desc' },
            take: filters?.take || 100,
            include: {
                station: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async getExpenseById(expenseId: string) {
        return this.prisma.expense.findUnique({
            where: { id: expenseId },
            include: {
                station: true,
            },
        });
    }

    async createExpense(data: {
        stationId: string;
        expenseId: string;
        category: string;
        amount: number;
        description?: string;
        paymentMethod?: string;
        paidTo?: string;
        expenseDate: Date;
        approvedById?: string;
    }) {
        return this.prisma.expense.create({ data });
    }

    async updateExpense(
        expenseId: string,
        data: {
            category?: string;
            amount?: number;
            description?: string;
            paymentMethod?: string;
            paidTo?: string;
            expenseDate?: Date;
            approvedById?: string;
        }
    ) {
        return this.prisma.expense.update({
            where: { id: expenseId },
            data,
        });
    }

    async deleteExpense(expenseId: string) {
        return this.prisma.expense.delete({
            where: { id: expenseId },
        });
    }

    async getExpensesSummary(stationId: string, startDate: Date, endDate: Date) {
        // Total expenses
        const totalExpenses = await this.prisma.expense.aggregate({
            where: {
                stationId,
                expenseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: { amount: true },
            _count: true,
        });

        // Expenses by category
        const byCategory = await this.prisma.expense.groupBy({
            by: ['category'],
            where: {
                stationId,
                expenseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: { amount: true },
            _count: true,
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
        });

        // Expenses by payment method
        const byPaymentMethod = await this.prisma.expense.groupBy({
            by: ['paymentMethod'],
            where: {
                stationId,
                expenseDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: { amount: true },
            _count: true,
        });

        return {
            total: totalExpenses,
            byCategory,
            byPaymentMethod,
        };
    }
}
