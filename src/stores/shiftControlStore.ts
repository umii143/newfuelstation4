import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shift, NozzleReading, TankReading } from '@/types';
import { useAuthStore } from './authStore';
import { useStationMasterStore } from './stationMasterStore';
import { useFuelStore } from './fuelStore';

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
                    notes: varianceNotes || activeShift.notes
                };
                
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
