import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '../stores/authStore';
import { useCNGStore } from '../stores/cngStore';
import { useStaffStore } from '../stores/dataStores';
import { useFuelStore } from '../stores/fuelStore';
import { useProductStore, useSalesStore } from '../stores/productStore';

// Mock localStorage for Zustand persist
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Business Unit Data Isolation', () => {
    beforeEach(() => {
        window.localStorage.clear();
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
        });
        useFuelStore.setState({ shifts: [], tanks: [] });
        useCNGStore.setState({ shifts: [], compressors: [], cascades: [], nozzles: [] });
        useProductStore.setState({ products: [], categories: [] });
        useSalesStore.setState({ sales: [] });
        useStaffStore.setState({ users: [], attendance: [] });
    });

    it('should completely isolate Fuel operations from CNG and Lube', () => {
        // 1. Setup in FUEL context
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
        });

        const { addStaff } = useStaffStore.getState();
        addStaff({
            name: 'Fuel Attendant',
            role: 'ATTENDANT',
            phone: '123',
            pin: '1234',
        } as any);

        const { tanks } = useFuelStore.getState();
        void tanks;
        useFuelStore.setState(state => ({
            tanks: [...state.tanks, {
                tankId: 'TANK-1',
                name: 'Tank 1',
                fuelType: 'PETROL_92',
                capacity: 50000,
                currentLevel: 25000,
                status: 'ACTIVE',
            } as any]
        }));

        // Add a mock shift manually to Fuel
        useFuelStore.setState(state => ({
            shifts: [
                ...state.shifts,
                {
                    shiftId: 'SHF-FUEL-1',
                    startTime: new Date().toISOString(),
                    status: 'CLOSED',
                    totalAmount: 50000,
                    businessUnit: 'FUEL',
                } as any,
            ],
        }));

        // Verify Fuel
        expect(useStaffStore.getState().users.length).toBe(1);
        expect(useFuelStore.getState().tanks.length).toBe(1);
        expect(useFuelStore.getState().shifts.length).toBe(1);

        // 2. Switch to CNG context
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'CNG', theme: 'system', currency: 'PKR' },
        });

        // CNG should see ZERO fuel tanks/shifts in its store naturally,
        // but even more importantly, its getFiltered/Active functions should be pure
        expect(useCNGStore.getState().compressors.length).toBe(0);
        expect(useCNGStore.getState().shifts.length).toBe(0);

        // However, staff is global but filtered. In CNG, getActiveStaff should be 0 because the one staff is FUEL.
        const cngStaff = useStaffStore.getState().getActiveStaff();
        expect(cngStaff.length).toBe(0);

        // Let's add CNG staff
        addStaff({
            name: 'CNG Attendant',
            role: 'ATTENDANT',
            phone: '456',
            pin: '4567',
        } as any);

        expect(useStaffStore.getState().getActiveStaff().length).toBe(1); // The CNG attendant
        expect(useStaffStore.getState().getActiveStaff()[0].name).toBe('CNG Attendant');

        // 3. Switch to LUBE context
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'LUBE', theme: 'system', currency: 'PKR' },
        });

        const { addProduct, getFilteredProducts } = useProductStore.getState();
        addProduct({
            name: 'Engine Oil',
            sku: 'EO-001',
            category: 'ENGINE_OIL',
            salePrice: 1500,
            costPrice: 1000,
            taxRate: 0.17,
            currentStock: 50,
            reorderPoint: 10,
            status: 'ACTIVE',
        } as any);

        // The products filter should only show LUBE products.
        const lubeProducts = getFilteredProducts();
        expect(lubeProducts.length).toBe(1);
        expect(lubeProducts[0].name).toBe('Engine Oil');
        expect(lubeProducts[0].businessUnit).toBe('LUBE');

        // Switch back to FUEL and verify Lube products do not appear
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
        });
        const fuelProducts = getFilteredProducts();
        expect(fuelProducts.length).toBe(0);

        // Switch back to CNG and verify staff
        useSettingsStore.setState({
            settings: { language: 'en', businessUnit: 'CNG', theme: 'system', currency: 'PKR' },
        });
        expect(useStaffStore.getState().getActiveStaff().length).toBe(1);
        expect(useStaffStore.getState().getActiveStaff()[0].name).toBe('CNG Attendant');
    });
});
