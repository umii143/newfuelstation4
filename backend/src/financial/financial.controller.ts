import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialService } from './financial.service';

@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
    constructor(private financialService: FinancialService) {}

    // ==================== CUSTOMERS ====================

    @Get('organizations/:organizationId/customers')
    async getCustomers(@Param('organizationId') organizationId: string) {
        return this.financialService.getCustomers(organizationId);
    }

    @Get('customers/:customerId')
    async getCustomerById(@Param('customerId') customerId: string) {
        return this.financialService.getCustomerById(customerId);
    }

    @Post('organizations/:organizationId/customers')
    async createCustomer(
        @Param('organizationId') organizationId: string,
        @Body()
        body: {
            customerId: string;
            name: string;
            phone?: string;
            email?: string;
            address?: string;
            creditLimit?: number;
            customerType?: string;
        }
    ) {
        return this.financialService.createCustomer({
            organizationId,
            ...body,
        });
    }

    @Put('customers/:customerId')
    async updateCustomer(
        @Param('customerId') customerId: string,
        @Body()
        body: {
            name?: string;
            phone?: string;
            email?: string;
            address?: string;
            creditLimit?: number;
            customerType?: string;
        }
    ) {
        return this.financialService.updateCustomer(customerId, body);
    }

    @Delete('customers/:customerId')
    async deleteCustomer(@Param('customerId') customerId: string) {
        return this.financialService.deleteCustomer(customerId);
    }

    @Put('customers/:customerId/balance')
    async updateCustomerBalance(
        @Param('customerId') customerId: string,
        @Body() body: { amount: number }
    ) {
        return this.financialService.updateCustomerBalance(customerId, body.amount);
    }

    @Get('organizations/:organizationId/customers/with-credit')
    async getCustomersWithCredit(@Param('organizationId') organizationId: string) {
        return this.financialService.getCustomersWithCredit(organizationId);
    }

    // ==================== SUPPLIERS ====================

    @Get('organizations/:organizationId/suppliers')
    async getSuppliers(@Param('organizationId') organizationId: string) {
        return this.financialService.getSuppliers(organizationId);
    }

    @Get('suppliers/:supplierId')
    async getSupplierById(@Param('supplierId') supplierId: string) {
        return this.financialService.getSupplierById(supplierId);
    }

    @Post('organizations/:organizationId/suppliers')
    async createSupplier(
        @Param('organizationId') organizationId: string,
        @Body()
        body: {
            supplierId: string;
            name: string;
            phone?: string;
            email?: string;
            address?: string;
            paymentTerms?: string;
        }
    ) {
        return this.financialService.createSupplier({
            organizationId,
            ...body,
        });
    }

    @Put('suppliers/:supplierId')
    async updateSupplier(
        @Param('supplierId') supplierId: string,
        @Body()
        body: {
            name?: string;
            phone?: string;
            email?: string;
            address?: string;
            paymentTerms?: string;
        }
    ) {
        return this.financialService.updateSupplier(supplierId, body);
    }

    @Delete('suppliers/:supplierId')
    async deleteSupplier(@Param('supplierId') supplierId: string) {
        return this.financialService.deleteSupplier(supplierId);
    }

    @Put('suppliers/:supplierId/balance')
    async updateSupplierBalance(
        @Param('supplierId') supplierId: string,
        @Body() body: { amount: number }
    ) {
        return this.financialService.updateSupplierBalance(supplierId, body.amount);
    }

    @Get('organizations/:organizationId/suppliers/with-balance')
    async getSuppliersWithBalance(@Param('organizationId') organizationId: string) {
        return this.financialService.getSuppliersWithBalance(organizationId);
    }

    // ==================== EXPENSES ====================

    @Get('stations/:stationId/expenses')
    async getExpenses(
        @Param('stationId') stationId: string,
        @Query('category') category?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('take') take?: string
    ) {
        return this.financialService.getExpenses(stationId, {
            category,
            startDate,
            endDate,
            take: take ? parseInt(take) : 100,
        });
    }

    @Get('expenses/:expenseId')
    async getExpenseById(@Param('expenseId') expenseId: string) {
        return this.financialService.getExpenseById(expenseId);
    }

    @Post('stations/:stationId/expenses')
    async createExpense(
        @Param('stationId') stationId: string,
        @Body()
        body: {
            expenseId: string;
            category: string;
            amount: number;
            description?: string;
            paymentMethod?: string;
            paidTo?: string;
            expenseDate: string;
            approvedById?: string;
        }
    ) {
        return this.financialService.createExpense({
            stationId,
            ...body,
            expenseDate: new Date(body.expenseDate),
        });
    }

    @Put('expenses/:expenseId')
    async updateExpense(
        @Param('expenseId') expenseId: string,
        @Body()
        body: {
            category?: string;
            amount?: number;
            description?: string;
            paymentMethod?: string;
            paidTo?: string;
            expenseDate?: string;
            approvedById?: string;
        }
    ) {
        return this.financialService.updateExpense(expenseId, {
            ...body,
            expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
        });
    }

    @Delete('expenses/:expenseId')
    async deleteExpense(@Param('expenseId') expenseId: string) {
        return this.financialService.deleteExpense(expenseId);
    }

    @Get('stations/:stationId/expenses/summary')
    async getExpensesSummary(
        @Param('stationId') stationId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.financialService.getExpensesSummary(
            stationId,
            new Date(startDate),
            new Date(endDate)
        );
    }
}
