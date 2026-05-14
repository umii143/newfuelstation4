import { apiClient } from './client';

// Types
export interface FuelTank {
    id: string;
    stationId: string;
    tankNumber: number;
    fuelType: string;
    capacity: number;
    currentStock: number;
    reorderLevel: number | null;
    iotDeviceId: string | null;
    nozzles: FuelNozzle[];
    createdAt: string;
    updatedAt: string;
}

export interface FuelNozzle {
    id: string;
    tankId: string;
    nozzleNumber: number;
    name: string;
    currentReading: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    tank?: FuelTank;
}

export interface FuelReading {
    id: string;
    shiftId: string;
    nozzleId: string;
    readingType: 'OPENING' | 'CLOSING';
    readingValue: number;
    testVolume: number;
    timestamp: string;
    createdAt: string;
    nozzle?: FuelNozzle;
}

export interface FuelShift {
    id: string;
    stationId: string;
    shiftNumber: number;
    startedById: string;
    closedById: string | null;
    startTime: string;
    endTime: string | null;
    openingCash: number;
    closingCash: number | null;
    totalRevenue: number | null;
    expenses: number | null;
    recoveries: number | null;
    credits: number | null;
    digitalCash: number | null;
    bankDeposits: number | null;
    cashVariance: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    sales?: FuelSale[];
    readings?: FuelReading[];
}

export interface FuelSale {
    id: string;
    stationId: string;
    shiftId: string | null;
    pumpId: string | null;
    fuelType: string;
    quantityLiters: number;
    ratePerLiter: number;
    totalAmount: number;
    paymentMethod: string;
    customerId: string | null;
    saleTime: string;
}

export interface CreateShiftRequest {
    shiftNumber: number;
    startedById: string;
    openingCash: number;
    readings?: { nozzleId: string; readingValue: number }[];
}

export interface CloseShiftRequest {
    closingCash: number;
    closedById: string;
    expenses?: number;
    recoveries?: number;
    credits?: number;
    digitalCash?: number;
    bankDeposits?: number;
    readings?: { nozzleId: string; readingValue: number; testVolume?: number }[];
}

export interface CreateFuelSaleRequest {
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

export interface CreateTankRequest {
    tankNumber: number;
    fuelType: string;
    capacity: number;
    currentStock: number;
    reorderLevel?: number;
    iotDeviceId?: string;
}

// Fuel API
export const fuelApi = {
    // Shifts
    async getShifts(stationId: string, take?: number): Promise<FuelShift[]> {
        const query = take ? `?take=${take}` : '';
        return apiClient.get<FuelShift[]>(`/fuel/stations/${stationId}/shifts${query}`);
    },

    async getShiftById(shiftId: string): Promise<FuelShift> {
        return apiClient.get<FuelShift>(`/fuel/shifts/${shiftId}`);
    },

    async createShift(stationId: string, data: CreateShiftRequest): Promise<FuelShift> {
        return apiClient.post<FuelShift>(`/fuel/stations/${stationId}/shifts`, data);
    },

    async closeShift(shiftId: string, data: CloseShiftRequest): Promise<FuelShift> {
        return apiClient.put<FuelShift>(`/fuel/shifts/${shiftId}/close`, data);
    },

    // Sales
    async getSales(
        stationId: string,
        filters?: {
            shiftId?: string;
            fuelType?: string;
            startDate?: string;
            endDate?: string;
            take?: number;
        }
    ): Promise<FuelSale[]> {
        const params = new URLSearchParams();
        if (filters?.shiftId) params.append('shiftId', filters.shiftId);
        if (filters?.fuelType) params.append('fuelType', filters.fuelType);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.take) params.append('take', filters.take.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<FuelSale[]>(`/fuel/stations/${stationId}/sales${query}`);
    },

    async createSale(data: CreateFuelSaleRequest): Promise<FuelSale> {
        return apiClient.post<FuelSale>('/fuel/sales', data);
    },

    async getSalesSummary(stationId: string, startDate: string, endDate: string): Promise<any> {
        return apiClient.get<any>(
            `/fuel/stations/${stationId}/sales/summary?startDate=${startDate}&endDate=${endDate}`
        );
    },

    // Tanks
    async getTanks(stationId: string): Promise<FuelTank[]> {
        return apiClient.get<FuelTank[]>(`/fuel/stations/${stationId}/tanks`);
    },

    async getTankById(tankId: string): Promise<FuelTank> {
        return apiClient.get<FuelTank>(`/fuel/tanks/${tankId}`);
    },

    async createTank(stationId: string, data: CreateTankRequest): Promise<FuelTank> {
        return apiClient.post<FuelTank>(`/fuel/stations/${stationId}/tanks`, data);
    },

    async updateTankStock(tankId: string, currentStock: number): Promise<FuelTank> {
        return apiClient.put<FuelTank>(`/fuel/tanks/${tankId}/stock`, { currentStock });
    },

    async addStock(tankId: string, quantity: number): Promise<FuelTank> {
        return apiClient.post<FuelTank>(`/fuel/tanks/${tankId}/add-stock`, { quantity });
    },

    async deductStock(tankId: string, quantity: number): Promise<FuelTank> {
        return apiClient.post<FuelTank>(`/fuel/tanks/${tankId}/deduct-stock`, { quantity });
    },

    // Nozzles
    async getNozzles(stationId: string): Promise<FuelNozzle[]> {
        return apiClient.get<FuelNozzle[]>(`/fuel/stations/${stationId}/nozzles`);
    },

    async createNozzle(
        tankId: string,
        data: {
            nozzleNumber: number;
            name: string;
            currentReading: number;
        }
    ): Promise<FuelNozzle> {
        return apiClient.post<FuelNozzle>(`/fuel/tanks/${tankId}/nozzles`, data);
    },

    async updateNozzle(nozzleId: string, data: any): Promise<FuelNozzle> {
        return apiClient.put<FuelNozzle>(`/fuel/nozzles/${nozzleId}`, data);
    },
};
