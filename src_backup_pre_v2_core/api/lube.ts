import { apiClient } from './client';

// Types
export interface LubeProduct {
    id: string;
    stationId: string;
    productId: string;
    name: string;
    brand: string | null;
    category: string | null;
    unit: string;
    costPrice: number;
    salePrice: number;
    currentStock: number;
    reorderLevel: number | null;
    barcode: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LubeSale {
    id: string;
    stationId: string;
    saleId: string;
    customerId: string | null;
    totalAmount: number;
    discountPercent: number | null;
    discountAmount: number | null;
    netAmount: number;
    paymentMethod: string;
    soldById: string;
    saleTime: string;
    items?: LubeSaleItem[];
}

export interface LubeSaleItem {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: LubeProduct;
}

export interface CreateProductRequest {
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

export interface UpdateProductRequest {
    name?: string;
    brand?: string;
    category?: string;
    costPrice?: number;
    salePrice?: number;
    currentStock?: number;
    reorderLevel?: number;
    barcode?: string;
}

export interface CreateLubeSaleRequest {
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

// Lube API
export const lubeApi = {
    // Products
    async getProducts(stationId: string): Promise<LubeProduct[]> {
        return apiClient.get<LubeProduct[]>(`/lube/stations/${stationId}/products`);
    },

    async getProductById(productId: string): Promise<LubeProduct> {
        return apiClient.get<LubeProduct>(`/lube/products/${productId}`);
    },

    async createProduct(stationId: string, data: CreateProductRequest): Promise<LubeProduct> {
        return apiClient.post<LubeProduct>(`/lube/stations/${stationId}/products`, data);
    },

    async updateProduct(productId: string, data: UpdateProductRequest): Promise<LubeProduct> {
        return apiClient.put<LubeProduct>(`/lube/products/${productId}`, data);
    },

    async deleteProduct(productId: string): Promise<void> {
        return apiClient.delete<void>(`/lube/products/${productId}`);
    },

    async getLowStockProducts(stationId: string): Promise<LubeProduct[]> {
        return apiClient.get<LubeProduct[]>(`/lube/stations/${stationId}/products/low-stock`);
    },

    async updateProductStock(productId: string, quantity: number): Promise<LubeProduct> {
        return apiClient.put<LubeProduct>(`/lube/products/${productId}/stock`, { quantity });
    },

    async addStock(productId: string, quantity: number): Promise<LubeProduct> {
        return apiClient.post<LubeProduct>(`/lube/products/${productId}/add-stock`, { quantity });
    },

    async deductStock(productId: string, quantity: number): Promise<LubeProduct> {
        return apiClient.post<LubeProduct>(`/lube/products/${productId}/deduct-stock`, {
            quantity,
        });
    },

    // Sales
    async getSales(
        stationId: string,
        filters?: {
            startDate?: string;
            endDate?: string;
            take?: number;
        }
    ): Promise<LubeSale[]> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.take) params.append('take', filters.take.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<LubeSale[]>(`/lube/stations/${stationId}/sales${query}`);
    },

    async getSaleById(saleId: string): Promise<LubeSale> {
        return apiClient.get<LubeSale>(`/lube/sales/${saleId}`);
    },

    async createSale(data: CreateLubeSaleRequest): Promise<LubeSale> {
        return apiClient.post<LubeSale>('/lube/sales', data);
    },

    async getSalesSummary(stationId: string, startDate: string, endDate: string): Promise<any> {
        return apiClient.get<any>(
            `/lube/stations/${stationId}/sales/summary?startDate=${startDate}&endDate=${endDate}`
        );
    },

    async getProductSalesReport(
        productId: string,
        startDate: string,
        endDate: string
    ): Promise<any> {
        return apiClient.get<any>(
            `/lube/products/${productId}/sales-report?startDate=${startDate}&endDate=${endDate}`
        );
    },
};
