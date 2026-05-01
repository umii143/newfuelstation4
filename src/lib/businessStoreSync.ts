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

export const hydrateBusinessScopedStores = (
    data: FirestoreBusinessData,
    businessUnit: BusinessUnit
) => {
    const localCache = localBusinessCache[businessUnit];
    const fuelTanks = filterByBusinessScope(data.tanks, businessUnit, 'FUEL');
    const tankConfigs = filterByBusinessScope(data.tankConfigs, businessUnit, 'FUEL');
    const nozzleConfigs = filterByBusinessScope(data.nozzleConfigs, businessUnit, 'FUEL');

    useFuelStore.setState({
        shifts: filterByBusinessScope(data.shifts, businessUnit, 'FUEL') as any,
        tanks: (fuelTanks.length > 0 ? fuelTanks : tankConfigs) as any,
        nozzles: (nozzleConfigs.length > 0 ? nozzleConfigs : localCache.nozzleConfigs) as any,
    });

    useCNGStore.setState({
        shifts: filterByBusinessScope(data.cngShifts, businessUnit, 'CNG') as any,
        cascades: filterByBusinessScope(data.cngCascades, businessUnit, 'CNG') as any,
        nozzles: filterByBusinessScope(data.cngNozzles, businessUnit, 'CNG') as any,
    });

    useCustomerStore.setState({
        customers: filterByBusinessScope(data.customers, businessUnit) as any,
    });

    useSupplierStore.setState({
        suppliers: filterByBusinessScope(data.suppliers, businessUnit) as any,
        purchaseOrders: filterByBusinessScope(data.purchaseOrders, businessUnit) as any,
    });

    useStaffStore.setState({
        users: filterByBusinessScope(data.staff, businessUnit) as any,
        attendance: filterByBusinessScope(data.attendance, businessUnit) as any,
    });

    useExpenseStore.setState({
        expenses: filterByBusinessScope(data.expenses, businessUnit) as any,
    });

    useProductStore.setState({
        products: filterByBusinessScope(data.products, businessUnit) as any,
    });

    useSalesStore.setState({
        sales: filterByBusinessScope(data.sales, businessUnit) as any,
    });

    usePOSStore.setState({
        cart: [],
        holdOrders: localCache.holdOrders as any,
        currentCustomerId: null,
        currentCustomerName: null,
        discount: 0,
    });

    useCustomerLedgerStore.setState({
        entries: filterByBusinessScope(data.customerLedger, businessUnit) as any,
    });

    useSupplierLedgerStore.setState({
        entries: filterByBusinessScope(data.supplierLedger, businessUnit) as any,
    });

    useCashBankStore.setState({
        accounts: filterByBusinessScope(data.cashBank, businessUnit) as any,
        entries: filterByBusinessScope(data.cashLedger, businessUnit) as any,
    });

    useStaffLedgerStore.setState({
        entries: filterByBusinessScope(data.staffLedger, businessUnit) as any,
    });

    useAuditStore.setState({
        logs: filterByBusinessScope(data.auditLogs, businessUnit) as any,
    });

    useProfitStore.setState({
        entries: filterByBusinessScope(data.profitEntries, businessUnit) as any,
    });

    useDiscountStore.setState({
        discountEntries: filterByBusinessScope(data.discounts, businessUnit) as any,
    });

    useConfigStore.setState({
        tankConfigs: (tankConfigs.length > 0 ? tankConfigs : localCache.tankConfigs) as any,
        nozzleConfigs: (nozzleConfigs.length > 0 ? nozzleConfigs : localCache.nozzleConfigs) as any,
        rateConfigs: localCache.rateConfigs as any,
        rateChangeHistory: localCache.rateChangeHistory as any,
        systemAlerts: localCache.systemAlerts as any,
        alertConfigs: localCache.alertConfigs as any,
        isLoading: false,
        error: null,
    });
};
