import type {
    BankDepositEntry,
    DigitalCashEntry,
    FuelType,
    Nozzle,
    NozzleReading,
    NozzleSale,
    Shift,
    ShiftClosingWizardState,
    ShiftExpenseEntry,
    Tank,
    Transaction,
} from '@/types';
import { getStationId } from '@/lib/authHelpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useCashBankStore, useCustomerLedgerStore, useSupplierLedgerStore } from './ledgerStore';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';
import { auditLogger } from '@/lib/auditLogger';
import { stampBusinessScope } from '@/lib/businessScope';
import { useAntiFraudStore } from './antiFraudStore';
import { useCustomerStore } from './dataStores';

// ============================================
// WIZARD INITIAL STATE
// ============================================

const initialClosingState: ShiftClosingWizardState = {
    step: 1,
    isOpen: false,
    shiftId: '',
    stationId: '',
    startTime: '',
    staffId: '',
    staffName: '',
    staffRole: '',
    shiftType: 'MORNING',
    readings: [],
    nozzleSales: [],
    petrolTestLiters: 0,
    dieselTestLiters: 0,
    actualCash: 0,
    transactions: [],
    totalFuelRevenue: 0,
    totalRecoveries: 0,
    totalCredits: 0,
    totalExpenses: 0,
    totalDigitalPayments: 0,
    totalBankDeposits: 0,
    totalDeductions: 0,
    expectedCash: 0,
    variance: 0,
    variancePercentage: 0,
    cashInHand: 0,
    notes: '',
    isLocked: false,
};

// Default setup for fuel station if none exists
const defaultTanks: Tank[] = [
    {
        tankId: 'TNK-1',
        stationId: 'STN-CONFIGURE',
        name: 'Petrol Tank 1',
        fuelType: 'PETROL_92',
        capacity: 25000,
        currentLevel: 15400,
        costPrice: 260,
        salePrice: 280,
        reorderPoint: 5000,
        lastUpdated: new Date().toISOString(),
        nozzles: ['NZL-1', 'NZL-2'],
        businessUnit: 'FUEL',
    },
    {
        tankId: 'TNK-2',
        stationId: 'STN-CONFIGURE',
        name: 'Diesel Tank 1',
        fuelType: 'DIESEL',
        capacity: 35000,
        currentLevel: 22100,
        costPrice: 275,
        salePrice: 295,
        reorderPoint: 8000,
        lastUpdated: new Date().toISOString(),
        nozzles: ['NZL-3', 'NZL-4'],
        businessUnit: 'FUEL',
    },
];

const defaultNozzles: Nozzle[] = [
    {
        nozzleId: 'NZL-1',
        tankId: 'TNK-1',
        name: 'Dispenser 1 - Petrol',
        number: 1,
        currentReading: 45200.5,
        testVolume: 0,
        status: 'ACTIVE',
        businessUnit: 'FUEL',
    },
    {
        nozzleId: 'NZL-2',
        tankId: 'TNK-1',
        name: 'Dispenser 2 - Petrol',
        number: 2,
        currentReading: 32180.2,
        testVolume: 0,
        status: 'ACTIVE',
        businessUnit: 'FUEL',
    },
    {
        nozzleId: 'NZL-3',
        tankId: 'TNK-2',
        name: 'Dispenser 1 - Diesel',
        number: 3,
        currentReading: 88500.0,
        testVolume: 0,
        status: 'ACTIVE',
        businessUnit: 'FUEL',
    },
    {
        nozzleId: 'NZL-4',
        tankId: 'TNK-2',
        name: 'Dispenser 2 - Diesel',
        number: 4,
        currentReading: 41250.8,
        testVolume: 0,
        status: 'ACTIVE',
        businessUnit: 'FUEL',
    },
];

interface FuelState {
    tanks: Tank[];
    nozzles: Nozzle[];
    shifts: Shift[];
    currentShift: Shift | null;
    closingState: ShiftClosingWizardState;
    currentStep: number;
    isClosingWizardOpen: boolean;

    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTanks: () => Promise<void>;
    fetchNozzles: () => Promise<void>;
    fetchShifts: () => Promise<void>;
    setClosingStep: (step: number) => void;
    updateClosingState: (updates: Partial<ShiftClosingWizardState>) => void;
    completeShiftClosing: () => Promise<Shift | null>;
    openClosingWizard: () => void;
    closeClosingWizard: () => void;

    // Transaction Sync Logic
    syncShiftTransaction: (transaction: Transaction) => Promise<void>;

    // 7-Step Wizard Specific Actions
    addTransaction: (tx: Transaction) => void;
    removeTransaction: (txId: string) => void;
    updateNozzleReading: (nozzleId: string, updates: Partial<NozzleReading>) => void;
    updateNozzleSale: (nozzleId: string, updates: Partial<NozzleSale>) => void;
    calculateTotals: () => void;
    resetWizard: () => void;
    resetClosingState: () => void;

    // Tank/Nozzle Management
    updateTank: (tankId: string, updates: Partial<Tank>) => void;
    updateNozzle: (nozzleId: string, updates: Partial<Nozzle>) => void;
    updateFuelPrice: (tankId: string, costPrice: number, salePrice: number) => void;
    addExpenseEntry: (shiftId: string, entry: Omit<ShiftExpenseEntry, 'id'>) => void;
    addDigitalCashEntry: (shiftId: string, entry: Omit<DigitalCashEntry, 'id'>) => void;
    addBankDepositEntry: (shiftId: string, entry: Omit<BankDepositEntry, 'id'>) => void;

    // Computed
    getTanksByFuelType: (fuelType: FuelType) => Tank[];
    getTankFillPercentage: (tankId: string) => number;
    getNozzlesForTank: (tankId: string) => Nozzle[];
    getCalculatedRevenue: () => number;
    getExpectedCash: () => number;
    getCashVariance: () => number;
    getFilteredShifts: () => Shift[];
}

export const useFuelStore = create<FuelState>()(
    persist(
        (set, get) => ({
            tanks: [],
            nozzles: [],
            shifts: [],
            currentShift: null,
            closingState: initialClosingState,
            currentStep: 1,
            isClosingWizardOpen: false,
            isLoading: false,
            error: null,

            fetchTanks: async () => {
                const { tanks } = get();
                if (tanks.length === 0) {
                    set({ tanks: defaultTanks, isLoading: false, error: null });
                } else {
                    set({ isLoading: false, error: null });
                }
            },

            fetchNozzles: async () => {
                const { nozzles } = get();
                if (nozzles.length === 0) {
                    set({ nozzles: defaultNozzles, isLoading: false, error: null });
                } else {
                    set({ isLoading: false, error: null });
                }
            },

            fetchShifts: async () => {
                set({ isLoading: false, error: null });
            },

            setClosingStep: (step: number) => {
                set(state => ({
                    currentStep: step,
                    closingState: { ...state.closingState, step },
                }));
            },

            openClosingWizard: () => {
                const state = get();
                // Ensure default structure
                const activeTanks = state.tanks.length > 0 ? state.tanks : defaultTanks;
                const activeNozzles = state.nozzles.length > 0 ? state.nozzles : defaultNozzles;

                if (state.tanks.length === 0 || state.nozzles.length === 0) {
                    set({ tanks: activeTanks, nozzles: activeNozzles });
                }

                // Resolve stationId from auth context so Firestore persistence works
                const stationId = getStationId();
                const authState = useAuthStore.getState();
                const staffId = ('userId' in (authState.user || {}) ? (authState.user as any)?.userId : (authState.user as any)?.id) || 'STAFF-UNSET';
                const staffName = (authState.user as any)?.name || (authState.user as any)?.fullName || 'Staff';

                const readings: NozzleReading[] = activeNozzles.map(n => {
                    const tank = activeTanks.find(t => t.tankId === n.tankId);
                    return {
                        nozzleId: n.nozzleId,
                        nozzleName: n.name,
                        fuelType: tank?.fuelType || 'PETROL_92',
                        opening: n.currentReading,
                        closing: n.currentReading,
                        test: 0,
                        rate: tank?.salePrice || 0,
                        costPrice: tank?.costPrice || 0,
                        netLiters: 0,
                        revenue: 0,
                    };
                });

                const nozzleSales: NozzleSale[] = activeNozzles.map(n => {
                    const tank = activeTanks.find(t => t.tankId === n.tankId);
                    const rate = tank?.salePrice || 0;
                    const costPrice = tank?.costPrice || 0;
                    return {
                        nozzleId: n.nozzleId,
                        nozzleName: n.name,
                        fuelType: tank?.fuelType || 'PETROL_92',
                        openingReading: n.currentReading,
                        closingReading: n.currentReading,
                        rate,
                        costPrice,
                        margin: rate - costPrice,
                        testVolume: 0,
                        netSales: 0,
                        revenue: 0,
                    };
                });

                set({
                    isClosingWizardOpen: true,
                    currentStep: 1,
                    closingState: {
                        ...initialClosingState,
                        isOpen: true,
                        shiftId: `SH-${Date.now()}`,
                        stationId,
                        startTime: new Date().toISOString(),
                        staffId,
                        staffName,
                        readings,
                        nozzleSales,
                    },
                });
            },

            closeClosingWizard: () => {
                get().resetWizard();
            },

            updateTank: (tankId, updates) => {
                set(state => {
                    const updatedTanks = state.tanks.map(t => (t.tankId === tankId ? { ...t, ...updates } : t));
                    // Persist to Firestore
                    const sid = getStationId();
                    const updatedTank = updatedTanks.find(t => t.tankId === tankId);
                    if (sid && updatedTank) {
                        fsSet(sid, COLLECTIONS.FUEL_TANKS, tankId, updatedTank);
                        auditLogger.log('FUEL', 'TANK_UPDATE', `Tank ${updatedTank.name} configuration updated.`, tankId);
                    }
                    return { tanks: updatedTanks };
                });
            },

            updateNozzle: (nozzleId, updates) => {
                set(state => {
                    const updatedNozzles = state.nozzles.map(n =>
                        n.nozzleId === nozzleId ? { ...n, ...updates } : n
                    );
                    // Persist to Firestore
                    const sid = getStationId();
                    const updatedNozzle = updatedNozzles.find(n => n.nozzleId === nozzleId);
                    if (sid && updatedNozzle) {
                        fsSet(sid, COLLECTIONS.NOZZLE_CONFIGS, nozzleId, updatedNozzle);
                        auditLogger.log('FUEL', 'NOZZLE_UPDATE', `Nozzle ${updatedNozzle.name} configuration updated.`, nozzleId);
                    }
                    return { nozzles: updatedNozzles };
                });
            },

            updateFuelPrice: (tankId, costPrice, salePrice) => {
                set(state => {
                    const tanks = state.tanks.map(t =>
                        t.tankId === tankId
                            ? {
                                  ...t,
                                  costPrice,
                                  salePrice,
                                  lastUpdated: new Date().toISOString(),
                              }
                            : t
                    );

                    const nozzles = state.nozzles.map(n =>
                        n.tankId === tankId ? { ...n, rate: salePrice } : n
                    );

                    // Persist price changes to Firestore
                    const sid = getStationId();
                    if (sid) {
                        const updatedTank = tanks.find(t => t.tankId === tankId);
                        if (updatedTank) {
                            auditLogger.priceChange(updatedTank.name, state.tanks.find(t => t.tankId === tankId)?.salePrice || 0, salePrice, 'FUEL');
                            fsSet(sid, COLLECTIONS.TANK_CONFIGS, tankId, updatedTank);
                        }
                        // Persist affected nozzles
                        nozzles.filter(n => n.tankId === tankId).forEach(n => {
                            fsSet(sid, COLLECTIONS.NOZZLE_CONFIGS, n.nozzleId, n);
                        });
                    }

                    return { tanks, nozzles };
                });
            },

            addExpenseEntry: (_shiftId, entry) => {
                const authStore = useAuthStore.getState();
                const tenantId = authStore.organization?.id || 'DEFAULT';

                get().addTransaction({
                    id: `EXP-${Date.now()}`,
                    tenantId,
                    businessUnit: 'FUEL',
                    type: 'EXPENSE',
                    amount: entry.amount,
                    description: entry.note || '',
                    expenseCategory: entry.category as any,
                    timestamp: new Date().toISOString(),
                } as Transaction);
            },

            addDigitalCashEntry: (_shiftId, entry) => {
                const authStore = useAuthStore.getState();
                const tenantId = authStore.organization?.id || 'DEFAULT';

                get().addTransaction({
                    id: `DIG-${Date.now()}`,
                    tenantId,
                    businessUnit: 'FUEL',
                    type: 'DIGITAL_PAYMENT',
                    amount: entry.amount,
                    description: entry.method,
                    digitalMethod: entry.method as any,
                    referenceNo: entry.reference,
                    timestamp: new Date().toISOString(),
                } as Transaction);
            },

            addBankDepositEntry: (_shiftId, entry) => {
                const authStore = useAuthStore.getState();
                const tenantId = authStore.organization?.id || 'DEFAULT';

                get().addTransaction({
                    id: `BNK-${Date.now()}`,
                    tenantId,
                    businessUnit: 'FUEL',
                    type: 'BANK_DEPOSIT',
                    amount: entry.amount,
                    description: entry.bankName,
                    accountName: entry.bankName,
                    referenceNo: entry.accountNumber,
                    timestamp: new Date().toISOString(),
                } as Transaction);
            },

            updateClosingState: (updates: Partial<ShiftClosingWizardState>) => {
                set(state => {
                    const newState = { ...state.closingState, ...updates };
                    if ('recoveriesTotal' in updates) {
                        newState.totalRecoveries = (updates as any).recoveriesTotal || 0;
                    }
                    return { closingState: newState };
                });
                get().calculateTotals();
            },

            updateNozzleSale: (nozzleId, updates) => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        nozzleSales: state.closingState.nozzleSales.map(s =>
                            s.nozzleId === nozzleId ? { ...s, ...updates } : s
                        ),
                    },
                }));
                get().calculateTotals();
            },

            addTransaction: (tx: Transaction) => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        transactions: [...state.closingState.transactions, tx],
                    },
                }));
                get().calculateTotals();
            },

            removeTransaction: (txId: string) => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        transactions: state.closingState.transactions.filter(t => t.id !== txId),
                    },
                }));
                get().calculateTotals();
            },

            updateNozzleReading: (nozzleId, updates) => {
                set(state => {
                    const readings = state.closingState.readings.map(n => {
                        if (n.nozzleId === nozzleId) {
                            const updated = { ...n, ...updates };
                            updated.netLiters = Math.max(
                                0,
                                updated.closing - updated.opening - updated.test
                            );
                            updated.revenue = updated.netLiters * updated.rate;
                            return updated;
                        }
                        return n;
                    });
                    return { closingState: { ...state.closingState, readings } };
                });
                get().calculateTotals();
            },

            calculateTotals: () => {
                set(state => {
                    // Inline calculation avoiding cyclic dependencies
                    const { closingState } = state;
                    const { readings, transactions } = closingState;

                    const totalFuelRevenue = readings.reduce((sum, r) => sum + (r.revenue || 0), 0);

                    const totalRecoveries = transactions
                        .filter(t => t.type === 'RECOVERY')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalCredits = transactions
                        .filter(t => t.type === 'CREDIT_SALE')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalExpenses = transactions
                        .filter(t => t.type === 'EXPENSE')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalDigitalPayments = transactions
                        .filter(t => t.type === 'DIGITAL_PAYMENT')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalBankDeposits = transactions
                        .filter(t => t.type === 'BANK_DEPOSIT')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const totalDeductions =
                        totalCredits + totalExpenses + totalDigitalPayments + totalBankDeposits;
                    const expectedCash = totalFuelRevenue + totalRecoveries - totalDeductions;
                    const variance = closingState.actualCash - expectedCash;
                    const variancePercentage =
                        expectedCash > 0 ? (variance / expectedCash) * 100 : 0;

                    return {
                        closingState: {
                            ...closingState,
                            totalFuelRevenue,
                            totalRecoveries,
                            totalCredits,
                            totalExpenses,
                            totalDigitalPayments,
                            totalBankDeposits,
                            totalDeductions,
                            expectedCash,
                            variance,
                            variancePercentage,
                        },
                    };
                });
            },

            resetWizard: () => {
                set({
                    closingState: initialClosingState,
                    currentStep: 1,
                    isClosingWizardOpen: false,
                });
            },

            resetClosingState: () => {
                set({
                    closingState: initialClosingState,
                    currentStep: 1,
                    isClosingWizardOpen: false,
                });
            },

            syncShiftTransaction: async (tx: Transaction) => {
                const { closingState } = get();
                const { processShiftTransaction } = await import('@/lib/shiftLogic');

                const staffName = closingState.staffName || 'System';
                const staffId = closingState.staffId || 'System';
                const shiftId = closingState.shiftId || '';

                await processShiftTransaction(tx, { staffId, staffName, shiftId });
            },

            completeShiftClosing: async () => {
                const { closingState, nozzles, tanks } = get();
                set({ isLoading: true, error: null });

                try {
                    // Update nozzles current reading
                    const updatedNozzles = nozzles.map(n => {
                        const reading = closingState.readings.find(r => r.nozzleId === n.nozzleId);
                        if (reading) {
                            return { ...n, currentReading: reading.closing };
                        }
                        return n;
                    });

                    // Update tank levels
                    const updatedTanks = tanks.map(t => {
                        const tankNozzles = updatedNozzles.filter(n => n.tankId === t.tankId);
                        const totalSoldFromTank = closingState.readings
                            .filter(r => tankNozzles.some(n => n.nozzleId === r.nozzleId))
                            .reduce((sum, r) => sum + (r.netLiters || 0), 0);

                        return {
                            ...t,
                            currentLevel: Math.max(0, t.currentLevel - totalSoldFromTank),
                        };
                    });

                    // Sync depleted levels to configStore to keep A-Z consistency
                    try {
                        import('@/stores/configStore').then(({ useConfigStore }) => {
                            const configStore = useConfigStore.getState();
                            updatedTanks.forEach(t => {
                                configStore.updateTankLevel(t.tankId, t.currentLevel);
                            });
                        });
                    } catch (syncError) {
                        console.error('Failed to sync depleted levels to configStore:', syncError);
                    }

                    // Create Local Shift
                    // Use the date selected in the wizard (Step 1), NOT the current date
                    const shiftDate = closingState.startTime
                        ? new Date(closingState.startTime).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];

                    const closedShift = stampBusinessScope<Shift>({
                        shiftId: closingState.shiftId,
                        stationId: getStationId(),
                        businessUnit: 'FUEL',
                        date: shiftDate,
                        shiftNumber: get().shifts.filter(s => s.date === shiftDate).length + 1,
                        shiftType: closingState.shiftType || 'MORNING',
                        staffId: closingState.staffId,
                        staffName: closingState.staffName,
                        startTime: closingState.startTime || new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        openingReadings: closingState.readings.map(r => ({
                            nozzleId: r.nozzleId,
                            nozzleName: r.nozzleName || '',
                            fuelType: r.fuelType as any,
                            reading: r.opening,
                            timestamp: closingState.startTime || new Date().toISOString(),
                        })),
                        nozzleSales: closingState.readings.map(r => {
                            const netSales = r.netLiters || 0;
                            return {
                                nozzleId: r.nozzleId,
                                nozzleName: r.nozzleName || '',
                                fuelType: r.fuelType as any,
                                openingReading: r.opening,
                                closingReading: r.closing,
                                testVolume: r.test || 0,
                                netSales,
                                rate: r.rate || 0,
                                revenue: r.revenue || 0,
                                costPrice: r.costPrice || 0,
                                margin: (r.rate || 0) - (r.costPrice || 0),
                            };
                        }),
                        totalLitersSold: closingState.readings.reduce(
                            (sum, r) => sum + (r.netLiters || 0),
                            0
                        ),
                        totalRevenue: closingState.totalFuelRevenue,
                        actualCash: closingState.actualCash,
                        expenses: closingState.totalExpenses,
                        recoveries: closingState.totalRecoveries,
                        credits: closingState.totalCredits,
                        digitalCash: closingState.totalDigitalPayments,
                        bankDeposits: closingState.totalBankDeposits,
                        supplierPayments: 0,
                        staffAdvances: 0,
                        discounts: 0,
                        cngRevenue: 0,
                        martCash: 0,
                        variance: closingState.variance,
                        variancePercentage: closingState.variancePercentage,
                        status: 'CLOSED',
                        createdAt: new Date().toISOString(),
                        transactions: closingState.transactions,
                        // Ledger mapping support
                        creditEntries: closingState.transactions
                            .filter(t => t.type === 'CREDIT_SALE')
                            .map(t => ({
                                id: t.id,
                                customerId: t.customerId || '',
                                customerName: t.customerName || 'Customer',
                                amount: t.amount,
                                fuelType: 'PETROL_92',
                                liters: t.liters || t.amount / 280,
                                previousBalance: 0,
                                newBalance: 0,
                                remarks: t.description,
                                shiftId: closingState.shiftId,
                                timestamp: new Date().toISOString(),
                            })),
                        recoveryEntries: closingState.transactions
                            .filter(t => t.type === 'RECOVERY')
                            .map(t => ({
                                id: t.id,
                                customerId: t.customerId || '',
                                customerName: t.customerName || 'Customer',
                                amount: t.amount,
                                previousBalance: 0,
                                newBalance: 0,
                                shiftId: closingState.shiftId,
                                timestamp: new Date().toISOString(),
                            })),
                        expenseEntries: closingState.transactions
                            .filter(t => t.type === 'EXPENSE')
                            .map(t => ({
                                id: t.id,
                                category:
                                    (t.expenseCategory as import('@/types').ShiftExpenseCategory) ||
                                    'OTHER',
                                amount: t.amount,
                                note: t.description,
                                shiftId: closingState.shiftId,
                                timestamp: new Date().toISOString(),
                            })),
                        bankDepositEntries: closingState.transactions
                            .filter(t => t.type === 'BANK_DEPOSIT')
                            .map(t => ({
                                id: t.id,
                                bankName: t.accountName || 'Bank',
                                amount: t.amount,
                                depositSlipNumber: t.referenceNo,
                                shiftId: closingState.shiftId,
                                timestamp: new Date().toISOString(),
                            })),
                        digitalCashEntries: closingState.transactions
                            .filter(t => t.type === 'DIGITAL_PAYMENT')
                            .map(t => ({
                                id: t.id,
                                method: t.digitalMethod || 'OTHER',
                                amount: t.amount,
                                reference: t.referenceNo,
                                shiftId: closingState.shiftId,
                                timestamp: new Date().toISOString(),
                            })),
                    });

                    try {
                        useCustomerLedgerStore.getState().postShiftCredits(closedShift);
                        useCustomerLedgerStore.getState().postShiftRecoveries(closedShift);
                        useSupplierLedgerStore.getState().postShiftPayments(closedShift);
                        useCashBankStore.getState().postShiftExpenses(closedShift);
                        useCashBankStore.getState().postShiftDeposits(closedShift);
                        useCashBankStore.getState().postShiftDigitalCash(closedShift);
                    } catch (syncError) {
                        console.error('Ledger sync failed but shift was closed:', syncError);
                    }

                    // FIRESTORE SYNC (Fire and forget to keep UI instant)
                    if (closingState.stationId) {
                        const sid = closingState.stationId;
                        fsSet(sid, COLLECTIONS.FUEL_SHIFTS, closedShift.shiftId, closedShift);
                        updatedTanks.forEach(tank => {
                            fsSet(sid, COLLECTIONS.FUEL_TANKS, tank.tankId, tank);
                        });
                        updatedNozzles.forEach(nozzle => {
                            fsSet(sid, COLLECTIONS.NOZZLE_CONFIGS, nozzle.nozzleId, nozzle);
                        });
                    }

                    get().resetWizard();

                    set(state => ({
                        isLoading: false,
                        nozzles: updatedNozzles,
                        tanks: updatedTanks,
                        shifts: [closedShift, ...state.shifts],
                    }));

                    auditLogger.log('FUEL', 'SHIFT_CLOSE', `Shift #${closedShift.shiftId} completed by ${closedShift.staffName} with variance ₨${closedShift.variance.toFixed(2)}`, closedShift.shiftId);

                    // ============================================
                    // FORENSIC FRAUD DETECTION (PHASE 7)
                    // ============================================
                    const antiFraud = useAntiFraudStore.getState();
                    const sid = getStationId();

                    // FR-02: Significant Cash Shortage (> ₨500)
                    if (closedShift.variance < -500) {
                        antiFraud.generateFraudAlert(
                            'FR-02',
                            'CRITICAL',
                            `Significant cash shortage in Fuel Shift #${closedShift.shiftId}. Expected: ₨${closedShift.actualCash - closedShift.variance}, Actual: ₨${closedShift.actualCash}. Shortage: ₨${Math.abs(closedShift.variance)}`,
                            Math.abs(closedShift.variance),
                            sid || 'UNKNOWN',
                            closedShift.actualCash - closedShift.variance,
                            closedShift.actualCash,
                            closedShift.shiftId
                        );
                    }

                    // FR-10: High-Value Expense without notes (> 10k)
                    closedShift.expenseEntries?.forEach(exp => {
                        if (exp.amount > 10000 && (!exp.note || exp.note.trim() === '')) {
                            antiFraud.generateFraudAlert(
                                'FR-10',
                                'WARNING',
                                `High-value expense (₨${exp.amount.toLocaleString()}) recorded in shift #${closedShift.shiftId} without description. Category: ${exp.category}`,
                                exp.amount,
                                sid || 'UNKNOWN',
                                0,
                                exp.amount,
                                closedShift.shiftId
                            );
                        }
                    });

                    // FR-11: Credit Limit Exceeded
                    const customerStore = useCustomerStore.getState();
                    closedShift.creditEntries?.forEach(credit => {
                        const available = customerStore.getAvailableCredit(credit.customerId);
                        if (available < 0) {
                            antiFraud.generateFraudAlert(
                                'FR-11',
                                'CRITICAL',
                                `Credit limit exceeded for ${credit.customerName} during shift #${closedShift.shiftId}. Sale Amount: ₨${credit.amount}. Current Over-limit: ₨${Math.abs(available)}`,
                                credit.amount,
                                sid || 'UNKNOWN',
                                available + credit.amount,
                                available,
                                closedShift.shiftId
                            );
                        }
                    });

                    return closedShift;
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    return null;
                }
            },

            getTanksByFuelType: type => {
                const { settings } = useAuthStore.getState();
                return get().tanks.filter(t => t.fuelType === type && t.businessUnit === settings.businessUnit);
            },
            getTankFillPercentage: id => {
                const { settings } = useAuthStore.getState();
                const t = get().tanks.find(tank => tank.tankId === id && tank.businessUnit === settings.businessUnit);
                return t ? (t.currentLevel / t.capacity) * 100 : 0;
            },
            getNozzlesForTank: id => {
                const { settings } = useAuthStore.getState();
                return get().nozzles.filter(n => n.tankId === id && n.businessUnit === settings.businessUnit);
            },
            getCalculatedRevenue: () =>
                get().closingState.readings.reduce((sum, n) => sum + n.revenue, 0),
            getExpectedCash: () => get().closingState.expectedCash,
            getCashVariance: () => get().closingState.variance,

            getFilteredShifts: () => {
                const { settings } = useAuthStore.getState();
                const { shifts } = get();
                return shifts.filter(s => s.businessUnit === settings.businessUnit);
            },
        }),
        {
            name: 'motorway-fuel-store',
            partialize: state => ({
                tanks: state.tanks,
                nozzles: state.nozzles,
                shifts: state.shifts,
            }),
        }
    )
);
