import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
    StockPurchase, 
    StockDispatch, 
    FraudAlert, 
    FraudRuleId, 
    FuelType, 
    AlertSeverity 
} from '@/types';
import { useAuthStore } from './authStore';
import { getCurrentUserId } from '@/lib/authHelpers';

interface AntiFraudState {
    // State
    ownerStockPool: Record<FuelType, number>;
    purchases: StockPurchase[];
    dispatches: StockDispatch[];
    alerts: FraudAlert[];
    
    // Actions - Stock
    createStockPurchase: (purchase: Omit<StockPurchase, 'purchaseId' | 'createdAt' | 'createdBy'>) => void;
    createStockDispatch: (dispatch: Omit<StockDispatch, 'dispatchId' | 'status' | 'createdAt' | 'createdBy'>) => void;
    confirmStockReceipt: (
        dispatchId: string, 
        managerId: string, 
        receivedQty: number, 
        beforeDip: number, 
        afterDip: number,
        tankerSealIntact: boolean,
        notes?: string
    ) => void;
    
    // Actions - Alerts
    generateFraudAlert: (
        ruleId: FraudRuleId, 
        severity: AlertSeverity, 
        details: string,
        financialImpact: number,
        stationId?: string,
        expectedValue?: number,
        actualValue?: number,
        triggeredByRecord?: string
    ) => void;
    resolveFraudAlert: (alertId: string, ownerId: string, resolutionNote: string, status: 'RESOLVED' | 'FALSE_ALARM') => void;
}

export const useAntiFraudStore = create<AntiFraudState>()(
    persist(
        (set, get) => ({
            ownerStockPool: {
                PETROL_92: 0,
                PETROL_95: 0,
                DIESEL: 0,
                PREMIUM_DIESEL: 0,
                CNG: 0
            },
            purchases: [],
            dispatches: [],
            alerts: [],
            
            createStockPurchase: (purchase) => {
                const user = useAuthStore.getState().user;
                if (!user || user.role !== 'OWNER') {
                    console.error("Only OWNER can create stock purchases.");
                    return;
                }
                
                const newPurchase: StockPurchase = {
                    ...purchase,
                    purchaseId: `PUR-${Date.now()}`,
                    createdBy: getCurrentUserId(),
                    createdAt: new Date().toISOString()
                };
                
                set(state => {
                    const newPool = { ...state.ownerStockPool };
                    if (newPurchase.fuelType in newPool) {
                        newPool[newPurchase.fuelType] += newPurchase.quantityLiters;
                    }
                    return {
                        purchases: [newPurchase, ...state.purchases],
                        ownerStockPool: newPool
                    };
                });
            },
            
            createStockDispatch: (dispatch) => {
                const user = useAuthStore.getState().user;
                if (!user || user.role !== 'OWNER') {
                    console.error("Only OWNER can create stock dispatches.");
                    return;
                }
                
                const state = get();
                // Check if owner has enough stock
                if ((state.ownerStockPool[dispatch.fuelType] || 0) < dispatch.quantityDispatched) {
                    console.error("Insufficient stock in Owner Pool.");
                    return;
                }
                
                const newDispatch: StockDispatch = {
                    ...dispatch,
                    dispatchId: `DSP-${Date.now()}`,
                    status: 'IN_TRANSIT',
                    createdBy: getCurrentUserId(),
                    createdAt: new Date().toISOString()
                };
                
                set(state => {
                    const newPool = { ...state.ownerStockPool };
                    newPool[dispatch.fuelType] -= dispatch.quantityDispatched;
                    return {
                        dispatches: [newDispatch, ...state.dispatches],
                        ownerStockPool: newPool
                    };
                });
            },
            
            confirmStockReceipt: (dispatchId, managerId, receivedQty, beforeDip, afterDip, tankerSealIntact, notes) => {
                const state = get();
                const dispatchIndex = state.dispatches.findIndex(d => d.dispatchId === dispatchId);
                
                if (dispatchIndex === -1) return;
                const dispatch = state.dispatches[dispatchIndex];
                
                if (dispatch.status !== 'IN_TRANSIT') return; // Cannot confirm already confirmed
                
                // Variance calculation (FR-01 Rule)
                const expectedQty = dispatch.quantityDispatched;
                const variance = expectedQty - receivedQty;
                const variancePercent = (variance / expectedQty) * 100;
                
                let newStatus: 'CONFIRMED' | 'DISPUTED' = 'CONFIRMED';
                
                // Trigger FR-01 if variance > 2% OR if seal is broken (FR-17)
                if (variancePercent > 2 || !tankerSealIntact) {
                    newStatus = 'DISPUTED';
                    const financialImpact = variance > 0 ? variance * dispatch.costPricePerLiter : 0;
                    
                    const ruleId = !tankerSealIntact ? 'FR-17' : 'FR-01';
                    const details = !tankerSealIntact 
                        ? `Tanker seal reported broken for Dispatch ${dispatchId}.`
                        : `Shortage detected. Dispatched: ${expectedQty}L, Received: ${receivedQty}L. Variance: ${variancePercent.toFixed(2)}%`;
                        
                    get().generateFraudAlert(
                        ruleId, 
                        'CRITICAL', 
                        details, 
                        financialImpact, 
                        dispatch.toStationId,
                        expectedQty,
                        receivedQty,
                        dispatchId
                    );
                }
                
                const updatedDispatch: StockDispatch = {
                    ...dispatch,
                    status: newStatus,
                    managerId,
                    receivedAt: new Date().toISOString(),
                    beforeDipLiters: beforeDip,
                    afterDipLiters: afterDip,
                    quantityReceived: receivedQty,
                    tankerSealIntact,
                    receiptNotes: notes
                };
                
                const newDispatches = [...state.dispatches];
                newDispatches[dispatchIndex] = updatedDispatch;
                
                set({ dispatches: newDispatches });
                
                // The actual addition to the station's tank will be handled by the caller 
                // IF AND ONLY IF status === 'CONFIRMED'.
            },
            
            generateFraudAlert: (ruleId, severity, details, financialImpact, stationId, expectedValue, actualValue, triggeredByRecord) => {
                const newAlert: FraudAlert = {
                    alertId: `FRD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                    ruleId,
                    severity,
                    details,
                    financialImpact,
                    stationId,
                    expectedValue,
                    actualValue,
                    variance: (expectedValue && actualValue) ? (expectedValue - actualValue) : undefined,
                    triggeredByRecord,
                    triggeredAt: new Date().toISOString(),
                    status: 'OPEN',
                    permanent: true
                };
                
                // Security Logging
                auditLogger.log('SECURITY', 'FRAUD_ALERT_GENERATED', `Alert ${ruleId} triggered: ${details}`, newAlert.alertId);

                set(state => ({
                    alerts: [newAlert, ...state.alerts]
                }));
            },
            
            resolveFraudAlert: (alertId, ownerId, resolutionNote, status) => {
                const user = useAuthStore.getState().user;
                if (!user || user.role !== 'OWNER') {
                    console.warn(`[SECURITY] Unauthorized attempt to resolve fraud alert ${alertId} by user ${user?.name}`);
                    auditLogger.log('SECURITY', 'UNAUTHORIZED_ACCESS', `Unauthorized attempt to resolve fraud alert ${alertId}`, alertId);
                    return;
                }

                set(state => ({
                    alerts: state.alerts.map(a => 
                        a.alertId === alertId 
                            ? { ...a, status, resolutionNote, resolvedBy: ownerId, resolvedAt: new Date().toISOString() } 
                            : a
                    )
                }));
                
                auditLogger.log('SECURITY', 'FRAUD_ALERT_RESOLVED', `Alert ${alertId} resolved as ${status}. Note: ${resolutionNote}`, alertId);
            }
        }),
        { name: 'motorway-antifraud-store' }
    )
);
