import { fuelApi, type FuelSale, type FuelShift, type FuelTank } from '@/api';
import { create } from 'zustand';

/**
 * Backend-integrated Fuel Store
 * This store replaces local state with real API calls to the backend
 */

interface BackendFuelState {
    // Tanks
    tanks: FuelTank[];
    tanksLoading: boolean;
    tanksError: string | null;

    // Shifts
    shifts: FuelShift[];
    currentShift: FuelShift | null;
    shiftsLoading: boolean;
    shiftsError: string | null;

    // Sales
    sales: FuelSale[];
    salesLoading: boolean;
    salesError: string | null;

    // Tank Methods
    fetchTanks: (stationId: string) => Promise<void>;
    createTank: (
        stationId: string,
        data: {
            tankNumber: number;
            fuelType: string;
            capacity: number;
            currentStock: number;
            reorderLevel?: number;
            iotDeviceId?: string;
        }
    ) => Promise<void>;
    updateTankStock: (tankId: string, currentStock: number) => Promise<void>;
    addStock: (tankId: string, quantity: number) => Promise<void>;
    deductStock: (tankId: string, quantity: number) => Promise<void>;

    // Shift Methods
    fetchShifts: (stationId: string, take?: number) => Promise<void>;
    getShiftById: (shiftId: string) => Promise<FuelShift | undefined>;
    createShift: (
        stationId: string,
        data: {
            shiftNumber: number;
            startedById: string;
            openingCash: number;
        }
    ) => Promise<void>;
    closeShift: (
        shiftId: string,
        data: {
            closingCash: number;
            closedById: string;
        }
    ) => Promise<void>;
    setCurrentShift: (shift: FuelShift | null) => void;

    // Sales Methods
    fetchSales: (
        stationId: string,
        filters?: {
            shiftId?: string;
            fuelType?: string;
            startDate?: string;
            endDate?: string;
            take?: number;
        }
    ) => Promise<void>;
    createSale: (data: {
        stationId: string;
        shiftId?: string;
        pumpId?: string;
        fuelType: string;
        quantityLiters: number;
        ratePerLiter: number;
        totalAmount: number;
        paymentMethod: string;
        customerId?: string;
    }) => Promise<void>;
    getSalesSummary: (stationId: string, startDate: string, endDate: string) => Promise<any>;

    // Utility Methods
    clearErrors: () => void;
}

export const useBackendFuelStore = create<BackendFuelState>((set) => ({
    // Initial state
    tanks: [],
    tanksLoading: false,
    tanksError: null,

    shifts: [],
    currentShift: null,
    shiftsLoading: false,
    shiftsError: null,

    sales: [],
    salesLoading: false,
    salesError: null,

    // ==================== TANK METHODS ====================

    fetchTanks: async (stationId: string) => {
        try {
            set({ tanksLoading: true, tanksError: null });
            const tanks = await fuelApi.getTanks(stationId);
            set({ tanks, tanksLoading: false });
        } catch (error: any) {
            set({ tanksError: error.message, tanksLoading: false });
            throw error;
        }
    },

    createTank: async (stationId: string, data) => {
        try {
            set({ tanksLoading: true, tanksError: null });
            const newTank = await fuelApi.createTank(stationId, data);
            set(state => ({
                tanks: [...state.tanks, newTank],
                tanksLoading: false,
            }));
        } catch (error: any) {
            set({ tanksError: error.message, tanksLoading: false });
            throw error;
        }
    },

    updateTankStock: async (tankId: string, currentStock: number) => {
        try {
            set({ tanksLoading: true, tanksError: null });
            const updatedTank = await fuelApi.updateTankStock(tankId, currentStock);
            set(state => ({
                tanks: state.tanks.map(t => (t.id === tankId ? updatedTank : t)),
                tanksLoading: false,
            }));
        } catch (error: any) {
            set({ tanksError: error.message, tanksLoading: false });
            throw error;
        }
    },

    addStock: async (tankId: string, quantity: number) => {
        try {
            set({ tanksLoading: true, tanksError: null });
            const updatedTank = await fuelApi.addStock(tankId, quantity);
            set(state => ({
                tanks: state.tanks.map(t => (t.id === tankId ? updatedTank : t)),
                tanksLoading: false,
            }));
        } catch (error: any) {
            set({ tanksError: error.message, tanksLoading: false });
            throw error;
        }
    },

    deductStock: async (tankId: string, quantity: number) => {
        try {
            set({ tanksLoading: true, tanksError: null });
            const updatedTank = await fuelApi.deductStock(tankId, quantity);
            set(state => ({
                tanks: state.tanks.map(t => (t.id === tankId ? updatedTank : t)),
                tanksLoading: false,
            }));
        } catch (error: any) {
            set({ tanksError: error.message, tanksLoading: false });
            throw error;
        }
    },

    // ==================== SHIFT METHODS ====================

    fetchShifts: async (stationId: string, take?: number) => {
        try {
            set({ shiftsLoading: true, shiftsError: null });
            const shifts = await fuelApi.getShifts(stationId, take);
            set({ shifts, shiftsLoading: false });
        } catch (error: any) {
            set({ shiftsError: error.message, shiftsLoading: false });
            throw error;
        }
    },

    getShiftById: async (shiftId: string) => {
        try {
            const shift = await fuelApi.getShiftById(shiftId);
            return shift;
        } catch (error: any) {
            set({ shiftsError: error.message });
            throw error;
        }
    },

    createShift: async (stationId: string, data) => {
        try {
            set({ shiftsLoading: true, shiftsError: null });
            const newShift = await fuelApi.createShift(stationId, data);
            set(state => ({
                shifts: [newShift, ...state.shifts],
                currentShift: newShift,
                shiftsLoading: false,
            }));
        } catch (error: any) {
            set({ shiftsError: error.message, shiftsLoading: false });
            throw error;
        }
    },

    closeShift: async (shiftId: string, data) => {
        try {
            set({ shiftsLoading: true, shiftsError: null });
            const closedShift = await fuelApi.closeShift(shiftId, data);
            set(state => ({
                shifts: state.shifts.map(s => (s.id === shiftId ? closedShift : s)),
                currentShift: state.currentShift?.id === shiftId ? null : state.currentShift,
                shiftsLoading: false,
            }));
        } catch (error: any) {
            set({ shiftsError: error.message, shiftsLoading: false });
            throw error;
        }
    },

    setCurrentShift: (shift: FuelShift | null) => {
        set({ currentShift: shift });
    },

    // ==================== SALES METHODS ====================

    fetchSales: async (stationId: string, filters?) => {
        try {
            set({ salesLoading: true, salesError: null });
            const sales = await fuelApi.getSales(stationId, filters);
            set({ sales, salesLoading: false });
        } catch (error: any) {
            set({ salesError: error.message, salesLoading: false });
            throw error;
        }
    },

    createSale: async data => {
        try {
            set({ salesLoading: true, salesError: null });
            const newSale = await fuelApi.createSale(data);
            set(state => ({
                sales: [newSale, ...state.sales],
                salesLoading: false,
            }));
        } catch (error: any) {
            set({ salesError: error.message, salesLoading: false });
            throw error;
        }
    },

    getSalesSummary: async (stationId: string, startDate: string, endDate: string) => {
        try {
            return await fuelApi.getSalesSummary(stationId, startDate, endDate);
        } catch (error: any) {
            set({ salesError: error.message });
            throw error;
        }
    },

    // ==================== UTILITY METHODS ====================

    clearErrors: () => {
        set({
            tanksError: null,
            shiftsError: null,
            salesError: null,
        });
    },
}));
