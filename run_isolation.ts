import * as fs from 'fs';
import { useSettingsStore } from './src/stores/authStore';
import { useCNGStore } from './src/stores/cngStore';
import { useStaffStore } from './src/stores/dataStores';
import { useFuelStore } from './src/stores/fuelStore';
import { useProductStore } from './src/stores/productStore';

const logFile = './isolation_eval.txt';
fs.writeFileSync(logFile, '--- STARTING ISOLATION TEST ---\n');

function log(msg: string) {
    fs.appendFileSync(logFile, msg + '\n');
}

// Mock localStorage
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

(global as any).window = { localStorage: localStorageMock };

function assert(condition: boolean, message: string) {
    if (!condition) {
        log('ASSERTION FAILED: ' + message);
        throw new Error('ASSERTION FAILED: ' + message);
    }
    log('OK: ' + message);
}

try {
    // Clear stores
    useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    useFuelStore.setState({ shifts: [], tanks: [], mappedNozzles: [] });
    useCNGStore.setState({ shifts: [], compressors: [], cascades: [], nozzles: [] });
    useProductStore.setState({ products: [], categories: [] });
    useStaffStore.setState({ users: [], attendance: [] });

    // 1. Setup in FUEL context
    useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    useStaffStore
        .getState()
        .addStaff({ name: 'Fuel Attendant', role: 'ATTENDANT', phone: '123' } as any);
    useFuelStore
        .getState()
        .addTank({
            name: 'Tank 1',
            type: 'PETROL',
            capacity: 50000,
            currentLevel: 25000,
            status: 'ACTIVE',
        });
    useFuelStore.setState(state => ({
        shifts: [
            ...state.shifts,
            { shiftId: 'SHF-FUEL-1', status: 'CLOSED', businessUnit: 'FUEL' } as any,
        ],
    }));

    assert(useStaffStore.getState().users.length === 1, 'Fuel staff added globally');
    assert(useStaffStore.getState().getActiveStaff().length === 1, 'Fuel staff active in FUEL bu');
    assert(useFuelStore.getState().tanks.length === 1, 'Fuel tank added');
    assert(useFuelStore.getState().shifts.length === 1, 'Fuel shift added');

    // 2. Switch to CNG context
    useSettingsStore.setState({
        settings: { businessUnit: 'CNG', theme: 'system', currency: 'PKR' },
    });
    assert(
        useCNGStore.getState().compressors.length === 0,
        'CNG store is isolated from Fuel tanks'
    );
    assert(useCNGStore.getState().shifts.length === 0, 'CNG store is isolated from Fuel shifts');
    assert(
        useStaffStore.getState().getActiveStaff().length === 0,
        'CNG context sees zero Fuel staff'
    );

    useStaffStore
        .getState()
        .addStaff({ name: 'CNG Attendant', role: 'ATTENDANT', phone: '456' } as any);
    assert(
        useStaffStore.getState().getActiveStaff().length === 1,
        'CNG context sees its own staff'
    );
    assert(
        useStaffStore.getState().getActiveStaff()[0].name === 'CNG Attendant',
        'CNG staff is CNG Attendant'
    );

    // 3. Switch to LUBE context
    useSettingsStore.setState({
        settings: { businessUnit: 'LUBE', theme: 'system', currency: 'PKR' },
    });
    useProductStore
        .getState()
        .addProduct({
            name: 'Engine Oil',
            category: 'ENGINE_OIL',
            currentStock: 50,
            reorderPoint: 10,
        } as any);

    const lubeProducts = useProductStore.getState().getFilteredProducts();
    assert(lubeProducts.length === 1, 'Lube context sees its products');
    assert(lubeProducts[0].name === 'Engine Oil', 'Lube product correct');

    // 4. Verification back to FUEL
    useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    assert(
        useProductStore.getState().getFilteredProducts().length === 0,
        'Fuel context does not see Lube products'
    );
    assert(
        useStaffStore.getState().getActiveStaff().length === 1,
        'Fuel context sees its own staff'
    );

    log('--- ALL ISOLATION TESTS PASSED ---');
} catch (e: any) {
    log('CRITICAL ERROR: ' + e.message);
}
