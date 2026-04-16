import { apiClient } from './client';

// Types
export interface Customer {
    id: string;
    organizationId: string;
    customerId: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    creditLimit: number;
    currentBalance: number;
    customerType: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Supplier {
    id: string;
    organizationId: string;
    supplierId: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    paymentTerms: string | null;
    currentBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface Expense {
    id: string;
    stationId: string;
    expenseId: string;
    category: string;
    amount: number;
    description: string | null;
    paymentMethod: string | null;
    paidTo: string | null;
    expenseDate: string;
    approvedById: string | null;
    createdAt: string;
}

// Financial API
export const financialApi = {
    // Customers
    async getCustomers(organizationId: string): Promise<Customer[]> {
        return apiClient.get<Customer[]>(`/financial/organizations/${organizationId}/customers`);
    },

    async getCustomerById(customerId: string): Promise<Customer> {
        return apiClient.get<Customer>(`/financial/customers/${customerId}`);
    },

    async createCustomer(
        organizationId: string,
        data: Omit<Customer, 'id' | 'organizationId' | 'currentBalance' | 'createdAt' | 'updatedAt'>
    ): Promise<Customer> {
        return apiClient.post<Customer>(
            `/financial/organizations/${organizationId}/customers`,
            data
        );
    },

    async updateCustomer(customerId: string, data: Partial<Customer>): Promise<Customer> {
        return apiClient.put<Customer>(`/financial/customers/${customerId}`, data);
    },

    async deleteCustomer(customerId: string): Promise<void> {
        return apiClient.delete<void>(`/financial/customers/${customerId}`);
    },

    async updateCustomerBalance(customerId: string, amount: number): Promise<Customer> {
        return apiClient.put<Customer>(`/financial/customers/${customerId}/balance`, { amount });
    },

    async getCustomersWithCredit(organizationId: string): Promise<Customer[]> {
        return apiClient.get<Customer[]>(
            `/financial/organizations/${organizationId}/customers/with-credit`
        );
    },

    // Suppliers
    async getSuppliers(organizationId: string): Promise<Supplier[]> {
        return apiClient.get<Supplier[]>(`/financial/organizations/${organizationId}/suppliers`);
    },

    async getSupplierById(supplierId: string): Promise<Supplier> {
        return apiClient.get<Supplier>(`/financial/suppliers/${supplierId}`);
    },

    async createSupplier(
        organizationId: string,
        data: Omit<Supplier, 'id' | 'organizationId' | 'currentBalance' | 'createdAt' | 'updatedAt'>
    ): Promise<Supplier> {
        return apiClient.post<Supplier>(
            `/financial/organizations/${organizationId}/suppliers`,
            data
        );
    },

    async updateSupplier(supplierId: string, data: Partial<Supplier>): Promise<Supplier> {
        return apiClient.put<Supplier>(`/financial/suppliers/${supplierId}`, data);
    },

    async deleteSupplier(supplierId: string): Promise<void> {
        return apiClient.delete<void>(`/financial/suppliers/${supplierId}`);
    },

    async updateSupplierBalance(supplierId: string, amount: number): Promise<Supplier> {
        return apiClient.put<Supplier>(`/financial/suppliers/${supplierId}/balance`, { amount });
    },

    async getSuppliersWithBalance(organizationId: string): Promise<Supplier[]> {
        return apiClient.get<Supplier[]>(
            `/financial/organizations/${organizationId}/suppliers/with-balance`
        );
    },

    // Expenses
    async getExpenses(
        stationId: string,
        filters?: {
            category?: string;
            startDate?: string;
            endDate?: string;
            take?: number;
        }
    ): Promise<Expense[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.take) params.append('take', filters.take.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<Expense[]>(`/financial/stations/${stationId}/expenses${query}`);
    },

    async getExpenseById(expenseId: string): Promise<Expense> {
        return apiClient.get<Expense>(`/financial/expenses/${expenseId}`);
    },

    async createExpense(
        stationId: string,
        data: Omit<Expense, 'id' | 'stationId' | 'createdAt'>
    ): Promise<Expense> {
        return apiClient.post<Expense>(`/financial/stations/${stationId}/expenses`, data);
    },

    async updateExpense(expenseId: string, data: Partial<Expense>): Promise<Expense> {
        return apiClient.put<Expense>(`/financial/expenses/${expenseId}`, data);
    },

    async deleteExpense(expenseId: string): Promise<void> {
        return apiClient.delete<void>(`/financial/expenses/${expenseId}`);
    },

    async getExpensesSummary(stationId: string, startDate: string, endDate: string): Promise<any> {
        return apiClient.get<any>(
            `/financial/stations/${stationId}/expenses/summary?startDate=${startDate}&endDate=${endDate}`
        );
    },
};
