import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shift, NozzleReading, TankReading } from '@/types';
import { useAuthStore } from './authStore';
import { useStationMasterStore } from './stationMasterStore';
import { useFuelStore } from './fuelStore';
import { useAntiFraudStore } from './antiFraudStore';
import { useCustomerStore } from './dataStores';
import { useCustomerLedgerStore } from './ledgerStore';

interface ShiftControlState {
    activeShift: Shift | null;
    isShiftWizardOpen: boolean;
    wizardMode: 'OPEN' | 'CLOSE' | null;
    wizardStep: number;
    
    // Manual reading states for the wizard
    pendingNozzleReadings: NozzleReading[];
    pendingTankReadings: TankReading[];
    cashInHand: number; // Cash carried over from previous shift or float
    
    // Actions
    openShiftWizard: (mode: 'OPEN' | 'CLOSE') => void;
    closeShiftWizard: () => void;
    setWizardStep: (step: number) => void;
    
    updateNozzleReading: (nozzleId: string, updates: Partial<NozzleReading>) => void;
    updateTankReading: (tankId: string, updates: Partial<TankReading>) => void;
    setCashInHand: (amount: number) => void;
    
    startShift: () => void;
    completeShift: (actualCash: number, varianceNotes?: string) => Promise<void>;
}

export const useShiftControlStore = create<ShiftControlState>()(
    persist(
        (set, get) => ({
            activeShift: null,
            isShiftWizardOpen: false,
            wizardMode: null,
            wizardStep: 1,
            pendingNozzleReadings: [],
            pendingTankReadings: [],
            cashInHand: 0,
            
            openShiftWizard: (mode) => {
                const { tanks, nozzles } = useFuelStore.getState();
                
                // Initialize readings based on current system state
                const pendingNozzleReadings: NozzleReading[] = nozzles.map(n => ({
                    nozzleId: n.nozzleId,
                    nozzleName: n.name,
                    fuelType: n.fuelType || 'PETROL_92',
                    opening: n.currentReading,
                    closing: n.currentReading,
                    test: 0,
                    rate: n.rate || 0,
                    costPrice: n.costPrice || 0,
                    netLiters: 0,
                    revenue: 0
                }));
                
                const pendingTankReadings: TankReading[] = tanks.map(t => ({
                    tankId: t.tankId,
                    tankName: t.name,
                    fuelType: t.fuelType,
                    openingDip: t.currentLevel,
                    closingDip: t.currentLevel
                }));
                
                set({
                    isShiftWizardOpen: true,
                    wizardMode: mode,
                    wizardStep: 1,
                    pendingNozzleReadings,
                    pendingTankReadings,
                    cashInHand: 0
                });
            },
            
            closeShiftWizard: () => {
                set({ isShiftWizardOpen: false, wizardMode: null, wizardStep: 1 });
            },
            
            setWizardStep: (step) => set({ wizardStep: step }),
            
            updateNozzleReading: (nozzleId, updates) => {
                set(state => {
                    const pendingNozzleReadings = state.pendingNozzleReadings.map(n => {
                        if (n.nozzleId === nozzleId) {
                            const updated = { ...n, ...updates };
                            updated.netLiters = Math.max(0, updated.closing - updated.opening - updated.test);
                            updated.revenue = updated.netLiters * updated.rate;
                            return updated;
                        }
                        return n;
                    });
                    return { pendingNozzleReadings };
                });
            },
            
            updateTankReading: (tankId, updates) => {
                set(state => ({
                    pendingTankReadings: state.pendingTankReadings.map(t => 
                        t.tankId === tankId ? { ...t, ...updates } : t
                    )
                }));
            },
            
            setCashInHand: (amount) => set({ cashInHand: amount }),
            
            startShift: () => {
                const { pendingNozzleReadings, pendingTankReadings, cashInHand } = get();
                const user = useAuthStore.getState().user;
                const stationId = useStationMasterStore.getState().activeStationId || 'STN-1';
                
                const newShift: Shift = {
                    shiftId: `SH-${Date.now()}`,
                    stationId,
                    businessUnit: 'FUEL',
                    date: new Date().toISOString().split('T')[0],
                    shiftNumber: 1, // Calculate dynamically later
                    shiftType: 'MORNING',
                    staffId: (user as any)?.userId || (user as any)?.id || 'Unknown',
                    staffName: (user as any)?.name || 'Unknown',
                    startTime: new Date().toISOString(),
                    openingReadings: pendingNozzleReadings.map(r => ({
                        nozzleId: r.nozzleId,
                        nozzleName: r.nozzleName,
                        fuelType: r.fuelType,
                        reading: r.opening,
                        timestamp: new Date().toISOString()
                    })),
                    tankReadings: pendingTankReadings,
                    cashInHand: cashInHand,
                    status: 'OPEN',
                    nozzleSales: [],
                    totalLitersSold: 0,
                    totalRevenue: 0,
                    actualCash: 0,
                    expenses: 0,
                    recoveries: 0,
                    credits: 0,
                    digitalCash: 0,
                    bankDeposits: 0,
                    supplierPayments: 0,
                    staffAdvances: 0,
                    discounts: 0,
                    cngRevenue: 0,
                    martCash: 0,
                    variance: 0,
                    variancePercentage: 0,
                    createdAt: new Date().toISOString(),
                    transactions: []
                };
                
                set({ activeShift: newShift, isShiftWizardOpen: false });
                
                // Also update nozzles in fuelStore to reflect new baseline
                const { updateNozzle, updateTank } = useFuelStore.getState();
                pendingNozzleReadings.forEach(n => updateNozzle(n.nozzleId, { currentReading: n.opening }));
                pendingTankReadings.forEach(t => updateTank(t.tankId, { currentLevel: t.openingDip }));
            },
            
            completeShift: async (actualCash, varianceNotes) => {
                const { activeShift, pendingNozzleReadings, pendingTankReadings } = get();
                if (!activeShift) return;
                
                const totalLitersSold = pendingNozzleReadings.reduce((sum, n) => sum + n.netLiters, 0);
                const totalRevenue = pendingNozzleReadings.reduce((sum, n) => sum + n.revenue, 0);
                
                // Calculate expected cash (simple version for Phase 1)
                const expectedCash = totalRevenue + (activeShift.cashInHand || 0);
                const variance = actualCash - expectedCash;
                const variancePercentage = expectedCash > 0 ? (variance / expectedCash) * 100 : 0;
                
                // --- ANTI-FRAUD INTEGRATION: Phase 2 ---
                
                // Rule FR-02: Cash Shortage (Tolerance: 0.5%)
                if (variancePercentage < -0.5) {
                    useAntiFraudStore.getState().generateFraudAlert(
                        'FR-02',
                        'CRITICAL',
                        `Cash shortage detected during shift closure. Expected: Rs ${expectedCash.toLocaleString()}, Actual: Rs ${actualCash.toLocaleString()}`,
                        Math.abs(variance),
                        activeShift.stationId,
                        expectedCash,
                        actualCash,
                        activeShift.shiftId
                    );
                }
                
                // Rule FR-04: Dip Variance (Tolerance: 0.5%)
                const salesByFuelType = pendingNozzleReadings.reduce((acc, n) => {
                    acc[n.fuelType] = (acc[n.fuelType] || 0) + n.netLiters;
                    return acc;
                }, {} as Record<string, number>);
                
                let hasDiscrepancy = variancePercentage < -0.5;
                
                pendingTankReadings.forEach(tank => {
                    const sold = salesByFuelType[tank.fuelType] || 0;
                    const expectedDip = tank.openingDip - sold;
                    const difference = expectedDip - tank.closingDip; // Positive if manual dip is less than expected
                    
                    if (expectedDip > 0) {
                        const diffPercent = (difference / expectedDip) * 100;
                        if (diffPercent > 0.5) {
                            hasDiscrepancy = true;
                            // Estimate financial impact using an average rate of 250 per liter for now
                            const financialImpact = difference * 250; 
                            useAntiFraudStore.getState().generateFraudAlert(
                                'FR-04',
                                'WARNING',
                                `Electronic vs Manual Dip mismatch for ${tank.tankName}. Expected: ${expectedDip.toFixed(1)}L, Entered: ${tank.closingDip.toFixed(1)}L`,
                                financialImpact,
                                activeShift.stationId,
                                expectedDip,
                                tank.closingDip,
                                activeShift.shiftId
                            );
                        }
                    }
                });
                
                // Rule FR-10: Expense Without Receipt (> 10k)
                const expenses = activeShift.expenseEntries || [];
                expenses.forEach(exp => {
                    if (exp.amount > 10000 && !exp.note) {
                        hasDiscrepancy = true;
                        useAntiFraudStore.getState().generateFraudAlert(
                            'FR-10',
                            'WARNING',
                            `Large expense (₨${exp.amount.toLocaleString()}) recorded without a receipt or explanatory note. Category: ${exp.category}`,
                            exp.amount,
                            activeShift.stationId,
                            0,
                            exp.amount,
                            activeShift.shiftId
                        );
                    }
                });
                
                // Rule FR-11: Credit Limit Exceeded
                const credits = activeShift.creditEntries || [];
                const customers = useCustomerStore.getState().customers;
                const getCustomerBalance = useCustomerLedgerStore.getState().getCustomerBalance;
                
                credits.forEach(credit => {
                    const customer = customers.find(c => c.customerId === credit.customerId);
                    if (customer) {
                        const currentBalance = getCustomerBalance(customer.customerId);
                        const newBalance = currentBalance + credit.amount;
                        // Use custom limit if set, otherwise 0 means no limit check or a default check? 
                        // The user said "custom limit", so we'll check against customer.creditLimit.
                        if (customer.creditLimit > 0 && newBalance > customer.creditLimit) {
                            hasDiscrepancy = true;
                            useAntiFraudStore.getState().generateFraudAlert(
                                'FR-11',
                                'WARNING',
                                `Credit sale pushed customer ${customer.name} over their assigned credit limit of ₨${customer.creditLimit.toLocaleString()}. Outstanding Balance: ₨${newBalance.toLocaleString()}`,
                                newBalance - customer.creditLimit,
                                activeShift.stationId,
                                customer.creditLimit,
                                newBalance,
                                activeShift.shiftId
                            );
                        }
                    }
                });
                
                const closedShift: Shift = {
                    ...activeShift,
                    endTime: new Date().toISOString(),
                    status: 'CLOSED',
                    closedAt: new Date().toISOString(),
                    nozzleSales: pendingNozzleReadings.map(r => ({
                        nozzleId: r.nozzleId,
                        nozzleName: r.nozzleName,
                        fuelType: r.fuelType,
                        openingReading: r.opening,
                        closingReading: r.closing,
                        testVolume: r.test,
                        netSales: r.netLiters,
                        rate: r.rate,
                        revenue: r.revenue,
                        costPrice: r.costPrice,
                        margin: r.rate - r.costPrice
                    })),
                    tankReadings: pendingTankReadings,
                    totalLitersSold,
                    totalRevenue,
                    actualCash,
                    variance,
                    variancePercentage,
                    notes: varianceNotes || activeShift.notes,
                    // If discrepancies exist, we can optionally flag the shift itself 
                    // (Note: `hasDiscrepancy` is calculated above)
                };
                
                if (hasDiscrepancy) {
                    closedShift.notes = (closedShift.notes ? closedShift.notes + '\n' : '') + 
                        '[SYSTEM] Shift flagged for mathematical discrepancies (Cash/Dip). Alerts generated for Owner review.';
                }
                
                set({ activeShift: null, isShiftWizardOpen: false });
                
                // Persist the closed shift
                useFuelStore.getState().shifts.push(closedShift);
                
                // Update final baselines
                const { updateNozzle, updateTank } = useFuelStore.getState();
                pendingNozzleReadings.forEach(n => updateNozzle(n.nozzleId, { currentReading: n.closing }));
                pendingTankReadings.forEach(t => updateTank(t.tankId, { currentLevel: t.closingDip }));
            }
        }),
        { name: 'motorway-shift-control' }
    )
);
