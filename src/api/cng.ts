import { apiClient } from './client';

// Types
export interface CngNozzle {
    id: string;
    stationId: string;
    nozzleNumber: number;
    name: string;
    currentReading: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CngReading {
    id: string;
    shiftId: string;
    nozzleId: string;
    readingType: 'OPENING' | 'CLOSING';
    readingValue: number;
    testVolume: number;
    timestamp: string;
    nozzle?: CngNozzle;
}

export interface CngShift {
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
    totalLiters: number | null;
    expenses: number | null;
    recoveries: number | null;
    credits: number | null;
    digitalCash: number | null;
    bankDeposits: number | null;
    cashVariance: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    readings?: CngReading[];
}

export interface CreateCngShiftRequest {
    shiftNumber: number;
    startedById: string;
    openingCash: number;
    readings?: { nozzleId: string; readingValue: number }[];
}

export interface CloseCngShiftRequest {
    closingCash: number;
    closedById: string;
    expenses?: number;
    recoveries?: number;
    credits?: number;
    digitalCash?: number;
    bankDeposits?: number;
    readings?: { nozzleId: string; readingValue: number; testVolume?: number }[];
}

// CNG API
export const cngApi = {
    // Shifts
    async getShifts(stationId: string, take?: number): Promise<CngShift[]> {
        const query = take ? `?take=${take}` : '';
        return apiClient.get<CngShift[]>(`/cng/shifts?stationId=${stationId}${query}`);
    },

    async getShiftById(shiftId: string): Promise<CngShift> {
        return apiClient.get<CngShift>(`/cng/shifts/${shiftId}`);
    },

    async createShift(data: CreateCngShiftRequest): Promise<CngShift> {
        return apiClient.post<CngShift>('/cng/shifts', data);
    },

    async closeShift(shiftId: string, data: CloseCngShiftRequest): Promise<CngShift> {
        return apiClient.post<CngShift>(`/cng/shifts/${shiftId}/close`, data);
    },

    // Nozzles
    async getNozzles(stationId: string): Promise<CngNozzle[]> {
        return apiClient.get<CngNozzle[]>(`/cng/nozzles?stationId=${stationId}`);
    },

    async createNozzle(data: {
        stationId: string;
        nozzleNumber: number;
        name: string;
        currentReading: number;
    }): Promise<CngNozzle> {
        return apiClient.post<CngNozzle>('/cng/nozzles', data);
    },
};
