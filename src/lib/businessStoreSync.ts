import { useSettingsStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useConfigStore } from '@/stores/configStore';
import { useCustomerStore, useExpenseStore, useStaffStore, useSupplierStore } from '@/stores/dataStores';
import { useDiscountStore } from '@/stores/discountStore';
import { useFuelStore } from '@/stores/fuelStore';
import {
    useAuditStore,
    useCashBankStore,
    useCustomerLedgerStore,
    useStaffLedgerStore,
    useSupplierLedgerStore,
} from '@/stores/ledgerStore';
import { usePOSStore, useProductStore, useSalesStore } from '@/stores/productStore';
import { useProfitStore } from '@/stores/profitStore';
import {
    filterByBusinessScope,
    matchesBusinessScope,
    normalizeBusinessUnit,
    stampBusinessScope,
    type BusinessUnit,
} from './businessScope';

export interface FirestoreBusinessData {
    shifts?: any[];
    cngShifts?: any[];
    tanks?: any[];
    tankConfigs?: any[];
    nozzleConfigs?: any[];
    cngCascades?: any[];
    cngNozzles?: any[];
    customers?: any[];
    suppliers?: any[];
    purchaseOrders?: any[];
    staff?: any[];
    attendance?: any[];
    expenses?: any[];
    products?: any[];
    sales?: any[];
    customerLedger?: any[];
    supplierLedger?: any[];
    cashBank?: any[];
    cashLedger?: any[];
    staffLedger?: any[];
    auditLogs?: any[];
    profitEntries?: any[];
    discounts?: any[];
    reportSchedules?: any[];
    reportRunLogs?: any[];
}

interface LocalBusinessCache {
    holdOrders: any[];
    tankConfigs: any[];
    nozzleConfigs: any[];
    rateConfigs: any[];
    alertConfigs: any[];
    systemAlerts: any[];
    rateChangeHistory: any[];
}

const BUSINESS_UNITS: BusinessUnit[] = ['FUEL', 'CNG', 'LUBE'];

const createEmptyLocalCache = (): LocalBusinessCache => ({
    holdOrders: [],
    tankConfigs: [],
    nozzleConfigs: [],
    rateConfigs: [],
    alertConfigs: [],
    systemAlerts: [],
    rateChangeHistory: [],
});

const localBusinessCache: Record<BusinessUnit, LocalBusinessCache> = {
    FUEL: createEmptyLocalCache(),
    CNG: createEmptyLocalCache(),
    LUBE: createEmptyLocalCache(),
};

const scopeLocalRecords = (
    records: any[] | undefined,
    businessUnit: BusinessUnit,
    activeBusiness: BusinessUnit
) => {
    if (!Array.isArray(records)) {
        return [];
    }

    return records
        .filter(record => matchesBusinessScope(record, businessUnit, activeBusiness))
        .map(record => stampBusinessScope(record, activeBusiness));
};

const snapshotLocalBusinessState = () => {
    const activeBusiness = normalizeBusinessUnit(useSettingsStore.getState().settings.businessUnit);
    const { holdOrders } = usePOSStore.getState();
    const {
        tankConfigs,
        nozzleConfigs,
        rateConfigs,
        alertConfigs,
        systemAlerts,
        rateChangeHistory,
    } = useConfigStore.getState();

    BUSINESS_UNITS.forEach(unit => {
        localBusinessCache[unit] = {
            holdOrders: scopeLocalRecords(holdOrders, unit, activeBusiness),
            tankConfigs: scopeLocalRecords(tankConfigs, unit, activeBusiness),
            nozzleConfigs: scopeLocalRecords(nozzleConfigs, unit, activeBusiness),
            rateConfigs: scopeLocalRecords(rateConfigs, unit, activeBusiness),
            alertConfigs: scopeLocalRecords(alertConfigs, unit, activeBusiness),
            systemAlerts: scopeLocalRecords(systemAlerts, unit, activeBusiness),
            rateChangeHistory: scopeLocalRecords(rateChangeHistory, unit, activeBusiness),
        };
    });
};

export const clearBusinessScopedStores = () => {
    snapshotLocalBusinessState();

    useFuelStore.getState().resetWizard();
    useFuelStore.setState({
        tanks: [],
        nozzles: [],
        shifts: [],
        currentShift: null,
        isLoading: false,
        error: null,
    });

    useCNGStore.getState().closeClosingWizard();
    useCNGStore.setState({
        cascades: [],
        compressors: [],
        nozzles: [],
        shifts: [],
        decantingRecords: [],
        totalCNGStock: 0,
        isLoading: false,
        error: null,
    });

    useCustomerStore.setState({ customers: [], transactions: [], isLoading: false, error: null });
    useSupplierStore.setState({
        suppliers: [],
        purchaseOrders: [],
        isLoading: false,
        error: null,
    });
    useStaffStore.setState({ users: [], attendance: [], isLoading: false, error: null });
    useExpenseStore.setState({ expenses: [], isLoading: false, error: null });

    useProductStore.setState({
        products: [],
        isLoading: false,
        error: null,
        searchQuery: '',
        selectedCategory: 'ALL',
    });
    useSalesStore.setState({ sales: [], isLoading: false });
    usePOSStore.setState({
        cart: [],
        holdOrders: [],
        currentCustomerId: null,
        currentCustomerName: null,
        discount: 0,
    });

    useCustomerLedgerStore.setState({ entries: [], isLoading: false });
    useSupplierLedgerStore.setState({ entries: [], isLoading: false });
    useCashBankStore.setState({ accounts: [], entries: [], isLoading: false });
    useStaffLedgerStore.setState({ entries: [], isLoading: false });
    useAuditStore.setState({ logs: [], isLoading: false });
    useProfitStore.setState({ entries: [], isLoading: false });
    useDiscountStore.setState({ discountEntries: [], isLoading: false, error: null });

    useConfigStore.setState({
        tankConfigs: [],
        nozzleConfigs: [],
        rateConfigs: [],
        rateChangeHistory: [],
        systemAlerts: [],
        alertConfigs: [],
        isLoading: false,
        error: null,
    });
};

const DEMO_DATA = {
    staff: [{
        userId: 'DEMO-USR-1',
        name: 'System Administrator',
        role: 'MANAGER',
        status: 'ACTIVE',
        businessUnit: 'FUEL',
        stationId: 'STN-DEFAULT',
        email: 'admin@motorway.com',
        phone: '0300-1112233',
        joinedAt: new Date().toISOString(),
    }],
    suppliers: [{
        supplierId: 'DEMO-SUP-1',
        name: 'PSO Main Terminal',
        type: 'FUEL_SUPPLIER',
        contactPerson: 'Zubair Ahmed',
        phone: '042-35556677',
        email: 'info@pso.com.pk',
        address: 'Terminal 1, Karachi',
        currentPayable: 0,
        businessUnit: 'FUEL',
        stationId: 'STN-DEFAULT',
        createdAt: new Date().toISOString(),
    }],
    tanks: [{
        tankId: 'DEMO-TNK-1',
        name: 'Petrol Super (92)',
        fuelType: 'PETROL_92',
        capacity: 25000,
        currentLevel: 12000,
        salePrice: 280,
        costPrice: 265,
        minimumThresholdLevel: 5000,
        reorderPoint: 7000,
        isActive: true,
        businessUnit: 'FUEL',
        stationId: 'STN-DEFAULT',
        lastUpdated: new Date().toISOString(),
        nozzles: ['DEMO-NZL-1'],
    }],
    nozzles: [{
        nozzleId: 'DEMO-NZL-1',
        tankId: 'DEMO-TNK-1',
        name: 'Dispenser 01 - Nozzle A',
        number: 1,
        currentReading: 154000.50,
        status: 'ACTIVE',
        isActive: true,
        businessUnit: 'FUEL',
        stationId: 'STN-DEFAULT',
        performanceMetrics: {
            totalLitersDispensed: 0,
            averageDailyDispense: 1200,
            accuracyScore: 99.8,
            lastShiftDispense: 0,
        },
    }]
};

export const hydrateBusinessScopedStores = (
    data: FirestoreBusinessData,
    businessUnit: BusinessUnit
) => {
    const localCache = localBusinessCache[businessUnit];
    
    // Resilient update: Pre-existing > Firestore > Demo Fallback
    const updateStore = (store: any, key: string, newData: any[] | undefined, demoData?: any[]) => {
        const currentStoreState = store.getState();
        const existingData = currentStoreState[key];

        // 1. If Firestore has data, it wins
        if (newData && newData.length > 0) {
            store.setState({ [key]: newData });
        } 
        // 2. If Firestore is empty but we have existing local data, KEEP it
        else if (existingData && existingData.length > 0) {
            // No action needed
        }
        // 3. If everything is empty, inject Demo Data for A-Z Testing
        else if (demoData && demoData.length > 0) {
            store.setState({ [key]: demoData });
        }
    };

    const fuelTanks = filterByBusinessScope(data.tanks, businessUnit, 'FUEL');
    const tankConfigs = filterByBusinessScope(data.tankConfigs, businessUnit, 'FUEL');
    const nozzleConfigs = filterByBusinessScope(data.nozzleConfigs, businessUnit, 'FUEL');

    // Fuel Store
    updateStore(useFuelStore, 'shifts', filterByBusinessScope(data.shifts, businessUnit, 'FUEL'));
    updateStore(useFuelStore, 'tanks', fuelTanks.length > 0 ? fuelTanks : tankConfigs, DEMO_DATA.tanks);
    updateStore(useFuelStore, 'nozzles', nozzleConfigs, DEMO_DATA.nozzles);

    // CNG Store
    updateStore(useCNGStore, 'shifts', filterByBusinessScope(data.cngShifts, businessUnit, 'CNG'));
    updateStore(useCNGStore, 'cascades', filterByBusinessScope(data.cngCascades, businessUnit, 'CNG'));
    updateStore(useCNGStore, 'nozzles', filterByBusinessScope(data.cngNozzles, businessUnit, 'CNG'));

    // Data Stores
    updateStore(useCustomerStore, 'customers', filterByBusinessScope(data.customers, businessUnit));
    updateStore(useSupplierStore, 'suppliers', filterByBusinessScope(data.suppliers, businessUnit), DEMO_DATA.suppliers);
    updateStore(useSupplierStore, 'purchaseOrders', filterByBusinessScope(data.purchaseOrders, businessUnit));
    updateStore(useStaffStore, 'users', filterByBusinessScope(data.staff, businessUnit), DEMO_DATA.staff);
    updateStore(useStaffStore, 'attendance', filterByBusinessScope(data.attendance, businessUnit));
    updateStore(useExpenseStore, 'expenses', filterByBusinessScope(data.expenses, businessUnit));

    // Product Stores
    updateStore(useProductStore, 'products', filterByBusinessScope(data.products, businessUnit));
    updateStore(useSalesStore, 'sales', filterByBusinessScope(data.sales, businessUnit));

    // Ledger Stores
    updateStore(useCustomerLedgerStore, 'entries', filterByBusinessScope(data.customerLedger, businessUnit));
    updateStore(useSupplierLedgerStore, 'entries', filterByBusinessScope(data.supplierLedger, businessUnit));
    updateStore(useCashBankStore, 'accounts', filterByBusinessScope(data.cashBank, businessUnit));
    updateStore(useCashBankStore, 'entries', filterByBusinessScope(data.cashLedger, businessUnit));
    updateStore(useStaffLedgerStore, 'entries', filterByBusinessScope(data.staffLedger, businessUnit));
    updateStore(useAuditStore, 'logs', filterByBusinessScope(data.auditLogs, businessUnit));
    updateStore(useProfitStore, 'entries', filterByBusinessScope(data.profitEntries, businessUnit));
    updateStore(useDiscountStore, 'discountEntries', filterByBusinessScope(data.discounts, businessUnit));

    // Config Store - preserve local/demo if cloud is empty
    const currentConfig = useConfigStore.getState();
    useConfigStore.setState({
        tankConfigs: tankConfigs.length > 0 ? tankConfigs : (currentConfig.tankConfigs.length > 0 ? currentConfig.tankConfigs : (localCache.tankConfigs.length > 0 ? localCache.tankConfigs : DEMO_DATA.tanks)),
        nozzleConfigs: nozzleConfigs.length > 0 ? nozzleConfigs : (currentConfig.nozzleConfigs.length > 0 ? currentConfig.nozzleConfigs : (localCache.nozzleConfigs.length > 0 ? localCache.nozzleConfigs : DEMO_DATA.nozzles)),
        rateConfigs: currentConfig.rateConfigs.length > 0 ? currentConfig.rateConfigs : localCache.rateConfigs,
        rateChangeHistory: currentConfig.rateChangeHistory.length > 0 ? currentConfig.rateChangeHistory : localCache.rateChangeHistory,
        systemAlerts: currentConfig.systemAlerts.length > 0 ? currentConfig.systemAlerts : localCache.systemAlerts,
        alertConfigs: currentConfig.alertConfigs.length > 0 ? currentConfig.alertConfigs : localCache.alertConfigs,
        isLoading: false,
        error: null,
    });
};
