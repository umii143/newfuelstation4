import type { Nozzle, NozzleReading, Shift, ShiftClosingWizardState, Transaction } from '@/types';
import { getStationId } from '@/lib/authHelpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCashBankStore, useCustomerLedgerStore, useSupplierLedgerStore } from './ledgerStore';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';

// CNG Specific Types
export interface CascadeBank {
    bankId: string;
    name: string;
    pressure: number; // bar
    maxPressure: number;
    status: 'FILLING' | 'DISPENSING' | 'IDLE' | 'MAINTENANCE';
}

export interface CNGCompressor {
    compressorId: string;
    name: string;
    pressure: number;
    maxPressure: number;
    temperature: number;
    operatingHours: number;
    nextMaintenanceHours: number;
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'FAULT';
}

// Decanting / gas receipt record (persisted)
export interface DecantingRecord {
    id: string;
    date: string;
    supplier: string;
    containerId: string;
    totalKG: number;
    carriageCharges: number;
    unloadingPoint: string;
    totalCost: number; // totalKG * ratePerKG + carriageCharges
    supplierId?: string; // for ledger posting
    createdAt: string;
}

interface CNGState {
    cascades: CascadeBank[];
    compressors: CNGCompressor[];
    nozzles: Nozzle[];
    decantingRecords: DecantingRecord[];
    totalCNGStock: number; // KG currently in cascade banks

    closingState: ShiftClosingWizardState;

    shifts: Shift[];
    currentStep: number;
    isClosingWizardOpen: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchNozzles: () => Promise<void>;
    fetchShifts: () => Promise<void>;
    setClosingStep: (step: number) => void;
    updateClosingState: (updates: Partial<ShiftClosingWizardState>) => void;
    openClosingWizard: (staffId: string, staffName: string) => void;
    closeClosingWizard: () => void;
    addTransaction: (tx: Transaction) => void;
    removeTransaction: (txId: string) => void;
    updateReading: (nozzleId: string, updates: Partial<NozzleReading>) => void;
    calculateTotals: () => void;
    completeShiftClosing: () => Promise<Shift | null>;
    updateCascadePressure: (bankId: string, pressure: number) => void;
    updateCompressorStatus: (compressorId: string, updates: Partial<CNGCompressor>) => void;
    addDecantingRecord: (record: Omit<DecantingRecord, 'id' | 'createdAt'>) => void;
    adjustCNGStock: (deltaKG: number) => void;
}

const initialWizardState: ShiftClosingWizardState = {
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

// Initial data for nozzles if empty
const defaultCNGNozzles: Nozzle[] = [
    {
        nozzleId: 'CNG-NZL-1',
        name: 'CNG Dispenser 1 - Hose A',
        number: 1,
        currentReading: 15420.5,
        testVolume: 0,
        status: 'ACTIVE',
        tankId: 'CNG-SOURCE',
        rate: 200,
    },
    {
        nozzleId: 'CNG-NZL-2',
        name: 'CNG Dispenser 1 - Hose B',
        number: 2,
        currentReading: 28910.2,
        testVolume: 0,
        status: 'ACTIVE',
        tankId: 'CNG-SOURCE',
        rate: 200,
    },
];

export const useCNGStore = create<CNGState>()(
    persist(
        (set, get) => ({
            cascades: [],
            compressors: [],
            nozzles: [],
            shifts: [],
            decantingRecords: [],
            totalCNGStock: 0,
            closingState: initialWizardState,
            currentStep: 1,
            isClosingWizardOpen: false,
            isLoading: false,
            error: null,

            addDecantingRecord: record => {
                const newRecord = {
                    ...record,
                    id: `DEC-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                };
                set(state => ({
                    decantingRecords: [newRecord, ...state.decantingRecords],
                    totalCNGStock: state.totalCNGStock + record.totalKG,
                }));
                // Post to supplier ledger if supplierId provided
                if (record.supplierId) {
                    useSupplierLedgerStore.getState().addEntry({
                        supplierId: record.supplierId,
                        supplierName: record.supplier,
                        type: 'PURCHASE',
                        date: record.date || new Date().toISOString(),
                        shiftId: 'CNG-INVENTORY',
                        staffId: 'SYSTEM',
                        staffName: 'System',
                        reference: record.containerId || `DEC-${Date.now()}`,
                        debit: 0,
                        credit: record.totalCost,
                        invoiceNumber: record.containerId,
                        description: `CNG Decanting — ${record.totalKG}KG from ${record.supplier}`,
                        remarks: `Truck: ${record.containerId}, Unloading: ${record.unloadingPoint}`,
                    });
                }
            },

            adjustCNGStock: deltaKG => {
                set(state => ({
                    totalCNGStock: Math.max(0, state.totalCNGStock + deltaKG),
                }));
            },

            fetchNozzles: async () => {
                const { nozzles } = get();
                if (nozzles.length === 0) {
                    set({ nozzles: defaultCNGNozzles, isLoading: false, error: null });
                } else {
                    set({ isLoading: false, error: null });
                }
            },

            fetchShifts: async () => {
                set({ isLoading: false, error: null });
            },

            setClosingStep: step =>
                set(state => ({
                    currentStep: step,
                    closingState: { ...state.closingState, step },
                })),

            updateClosingState: updates => {
                set(state => ({ closingState: { ...state.closingState, ...updates } }));
                get().calculateTotals();
            },

            openClosingWizard: (staffId, staffName) => {
                const { nozzles } = get();
                // Ensure default nozzles exist
                const activeNozzles = nozzles.length > 0 ? nozzles : defaultCNGNozzles;
                if (nozzles.length === 0) {
                    set({ nozzles: activeNozzles });
                }

                const readings: NozzleReading[] = activeNozzles.map(n => ({
                    nozzleId: n.nozzleId,
                    nozzleName: n.name,
                    fuelType: 'CNG' as any,
                    opening: n.currentReading,
                    closing: n.currentReading,
                    test: 0,
                    rate: n.rate || 200,
                    costPrice: n.costPrice || 180,
                    netLiters: 0,
                    revenue: 0,
                }));

                set({
                    currentStep: 1,
                    isClosingWizardOpen: true,
                    closingState: {
                        ...initialWizardState,
                        isOpen: true,
                        shiftId: `CNG-SH-${Date.now()}`,
                        startTime: new Date().toISOString(),
                        staffId,
                        staffName,
                        readings,
                    },
                });
            },

            closeClosingWizard: () =>
                set({
                    isClosingWizardOpen: false,
                    currentStep: 1,
                    closingState: initialWizardState,
                }),

            addTransaction: tx => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        transactions: [...state.closingState.transactions, tx],
                    },
                }));
                get().calculateTotals();
            },

            removeTransaction: txId => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        transactions: state.closingState.transactions.filter(t => t.id !== txId),
                    },
                }));
                get().calculateTotals();
            },

            updateReading: (nozzleId, updates) => {
                set(state => ({
                    closingState: {
                        ...state.closingState,
                        readings: state.closingState.readings.map(r => {
                            if (r.nozzleId === nozzleId) {
                                const updated = { ...r, ...updates };
                                updated.netLiters =
                                    updated.closing - updated.opening - updated.test;
                                updated.revenue = updated.netLiters * updated.rate;
                                return updated;
                            }
                            return r;
                        }),
                    },
                }));
                get().calculateTotals();
            },

            calculateTotals: () => {
                set(state => {
                    // We duplicate the shiftLogic totals here to avoid require loops or async problems if needed
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

            completeShiftClosing: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { closingState, nozzles } = get();

                    // Update nozzles current reading
                    const updatedNozzles = nozzles.map(n => {
                        const reading = closingState.readings.find(r => r.nozzleId === n.nozzleId);
                        if (reading) {
                            return { ...n, currentReading: reading.closing };
                        }
                        return n;
                    });

                    // Ledger updates
                    const closedShift: Shift = {
                        shiftId: closingState.shiftId,
                        stationId: getStationId(),
                        businessUnit: 'CNG',
                        date: new Date().toISOString().split('T')[0],
                        shiftNumber: get().shifts.filter(s => s.date === new Date().toISOString().split('T')[0]).length + 1,
                        shiftType: 'MORNING' as any,
                        staffId: closingState.staffId,
                        staffName: closingState.staffName,
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        openingReadings: closingState.readings.map(r => ({
                            nozzleId: r.nozzleId,
                            nozzleName: r.nozzleName || '',
                            fuelType: 'CNG' as any,
                            reading: r.opening,
                            timestamp: new Date().toISOString(),
                        })),
                        nozzleSales: [],
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
                        cngRevenue: closingState.totalFuelRevenue,
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
                                fuelType: 'CNG',
                                liters: t.liters || t.amount / 200,
                                previousBalance: 0,
                                newBalance: 0,
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
                    };

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
                        fsSet(sid, COLLECTIONS.CNG_SHIFTS, closedShift.shiftId, closedShift);
                        updatedNozzles.forEach(nozzle => {
                            fsSet(sid, COLLECTIONS.CNG_NOZZLES, nozzle.nozzleId, nozzle);
                        });
                    }

                    set(state => ({
                        nozzles: updatedNozzles,
                        totalCNGStock: Math.max(0, state.totalCNGStock - closedShift.totalLitersSold),
                        shifts: [closedShift, ...state.shifts],
                        isClosingWizardOpen: false,
                        currentStep: 1,
                        closingState: initialWizardState,
                        isLoading: false,
                    }));

                    return closedShift;
                } catch (error: any) {
                    console.error('Critical Error in completeShiftClosing (CNG):', error);
                    set({ error: error.message, isLoading: false });
                    return null;
                }
            },

            updateCascadePressure: (bankId, pressure) => {
                set(state => ({
                    cascades: state.cascades.map(c =>
                        c.bankId === bankId ? { ...c, pressure } : c
                    ),
                }));
            },

            updateCompressorStatus: (compressorId, updates) => {
                set(state => ({
                    compressors: state.compressors.map(c =>
                        c.compressorId === compressorId ? { ...c, ...updates } : c
                    ),
                }));
            },
        }),
        {
            name: 'motorway-cng-store',
            partialize: state => ({
                cascades: state.cascades,
                compressors: state.compressors,
                nozzles: state.nozzles,
                shifts: state.shifts,
            }),
        }
    )
);
