import type {
    AlertConfiguration,
    AlertType,
    FuelType,
    NozzleConfiguration,
    NozzleMaintenanceRecord,
    RateChange,
    RateChangeReason,
    RateConfiguration,
    Station,
    SystemAlert,
    TankConfiguration,
    TankMaintenanceRecord,
    UserRole,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useFuelStore } from './fuelStore';
import { useSettingsStore } from './authStore';

// ============================================
// CONFIGURATION STORE
// Handles Tank, Nozzle, Rate, and Alert configuration
// As per mandatory specification Section 2
// ============================================

// Store State Interface
interface ConfigState {
    // Data
    stationConfig: Station | null;
    tankConfigs: TankConfiguration[];
    nozzleConfigs: NozzleConfiguration[];
    rateConfigs: RateConfiguration[];
    alertConfigs: AlertConfiguration[];
    systemAlerts: SystemAlert[];
    rateChangeHistory: RateChange[];
    isLoading: boolean;
    error: string | null;

    // Station Actions
    updateStationConfig: (updates: Partial<Station>) => void;

    // Tank Actions
    addTank: (tank: Omit<TankConfiguration, 'tankId' | 'maintenanceHistory' | 'businessUnit'>) => void;
    updateTank: (tankId: string, updates: Partial<TankConfiguration>) => void;
    deleteTank: (tankId: string) => void;
    updateTankLevel: (tankId: string, level: number) => void;
    addTankMaintenance: (tankId: string, record: Omit<TankMaintenanceRecord, 'id'>) => void;

    // Nozzle Actions
    addNozzle: (
        nozzle: Omit<NozzleConfiguration, 'nozzleId' | 'maintenanceHistory' | 'performanceMetrics' | 'businessUnit'>
    ) => void;
    updateNozzle: (nozzleId: string, updates: Partial<NozzleConfiguration>) => void;
    deleteNozzle: (nozzleId: string) => void;
    reassignNozzleToTank: (nozzleId: string, newTankId: string) => void;
    resetMeter: (nozzleId: string, newReading: number, performedBy: string) => void;
    addNozzleMaintenance: (nozzleId: string, record: Omit<NozzleMaintenanceRecord, 'id'>) => void;

    // Rate Actions
    changeRate: (
        fuelType: FuelType,
        newRate: number,
        changedBy: string,
        changedByName: string,
        reason: RateChangeReason,
        reasonNote?: string
    ) => RateChange;
    getCurrentRate: (fuelType: FuelType) => number;
    getRateHistory: (fuelType: FuelType) => RateChange[];

    // Alert Actions
    updateAlertConfig: (alertId: string, updates: Partial<AlertConfiguration>) => void;
    createSystemAlert: (
        type: AlertType,
        severity: 'INFO' | 'WARNING' | 'CRITICAL',
        title: string,
        message: string,
        relatedEntityType?: string,
        relatedEntityId?: string
    ) => void;
    dismissAlert: (alertId: string, dismissedBy: string) => void;
    markAlertRead: (alertId: string) => void;
    getUnreadAlerts: () => SystemAlert[];
    getActiveAlerts: () => SystemAlert[];

    // Getters
    getTankById: (tankId: string) => TankConfiguration | undefined;
    getNozzleById: (nozzleId: string) => NozzleConfiguration | undefined;
    getNozzlesForTank: (tankId: string) => NozzleConfiguration[];
    getActiveNozzles: () => NozzleConfiguration[];
    getTankFillPercentage: (tankId: string) => number;
    getLowInventoryTanks: () => TankConfiguration[];
    calculateDaysUntilRefill: (tankId: string) => number;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            // Initial State — fully populated defaults so settings pages always render
            stationConfig: {
                stationId: 'STN-DEFAULT',
                name: 'Motorway Oil Station',
                address: {
                    street: '123 Main Highway',
                    city: 'Metropolis',
                    state: 'Capital Region',
                    country: 'Pakistan',
                    postalCode: '00000',
                },
                settings: {
                    currency: 'PKR',
                    timezone: 'Asia/Karachi',
                    theme: 'system',
                    language: 'en',
                    taxRate: 0,
                },
                createdAt: new Date().toISOString(),
            } as Station,
            tankConfigs: [],
            nozzleConfigs: [],
            rateConfigs: [
                { fuelType: 'PETROL_92' as FuelType, currentRate: 0, previousRate: 0, effectiveFrom: new Date().toISOString(), lastChangedBy: 'SYSTEM', lastChangedAt: new Date().toISOString(), rateHistory: [] },
                { fuelType: 'PETROL_95' as FuelType, currentRate: 0, previousRate: 0, effectiveFrom: new Date().toISOString(), lastChangedBy: 'SYSTEM', lastChangedAt: new Date().toISOString(), rateHistory: [] },
                { fuelType: 'DIESEL' as FuelType, currentRate: 0, previousRate: 0, effectiveFrom: new Date().toISOString(), lastChangedBy: 'SYSTEM', lastChangedAt: new Date().toISOString(), rateHistory: [] },
                { fuelType: 'PREMIUM_DIESEL' as FuelType, currentRate: 0, previousRate: 0, effectiveFrom: new Date().toISOString(), lastChangedBy: 'SYSTEM', lastChangedAt: new Date().toISOString(), rateHistory: [] },
                { fuelType: 'CNG' as FuelType, currentRate: 0, previousRate: 0, effectiveFrom: new Date().toISOString(), lastChangedBy: 'SYSTEM', lastChangedAt: new Date().toISOString(), rateHistory: [] },
            ] as RateConfiguration[],
            alertConfigs: [
                { id: 'ALERT-1', stationId: 'STN-DEFAULT', type: 'LOW_INVENTORY' as AlertType, isEnabled: true, threshold: 25, notifyRoles: ['OWNER', 'MANAGER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 'ALERT-2', stationId: 'STN-DEFAULT', type: 'RATE_CHANGE' as AlertType, isEnabled: true, threshold: 0, notifyRoles: ['OWNER', 'MANAGER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 'ALERT-3', stationId: 'STN-DEFAULT', type: 'MAINTENANCE_DUE' as AlertType, isEnabled: true, threshold: 0, notifyRoles: ['OWNER', 'MANAGER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 'ALERT-4', stationId: 'STN-DEFAULT', type: 'CASH_VARIANCE' as AlertType, isEnabled: true, threshold: 5, notifyRoles: ['OWNER', 'MANAGER', 'CASHIER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 'ALERT-5', stationId: 'STN-DEFAULT', type: 'CREDIT_LIMIT_EXCEEDED' as AlertType, isEnabled: true, threshold: 0, notifyRoles: ['OWNER', 'MANAGER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 'ALERT-6', stationId: 'STN-DEFAULT', type: 'SHIFT_VARIANCE_HIGH' as AlertType, isEnabled: true, threshold: 2, notifyRoles: ['OWNER', 'MANAGER'] as UserRole[], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ] as AlertConfiguration[],
            systemAlerts: [],
            rateChangeHistory: [],
            isLoading: false,
            error: null,

            // Station Actions — creates config from scratch if null
            updateStationConfig: updates => {
                set(state => {
                    const defaultConfig: Station = {
                        stationId: 'STN-DEFAULT',
                        name: 'Motorway Oil Station',
                        address: { street: '', city: '', state: '', country: 'Pakistan', postalCode: '' },
                        settings: { currency: 'PKR', timezone: 'Asia/Karachi', theme: 'system', language: 'en', taxRate: 0 },
                        createdAt: new Date().toISOString(),
                    };

                    return {
                        stationConfig: { ...(state.stationConfig || defaultConfig), ...updates },
                    };
                });
            },

            // Tank Actions
            addTank: tankData => {
                const { settings } = useSettingsStore.getState();
                const newTank: TankConfiguration = {
                    ...tankData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    tankId: `TK-${Date.now()}`,
                    maintenanceHistory: [],
                    lastUpdated: new Date().toISOString(),
                };
                set(state => ({
                    tankConfigs: [...state.tankConfigs, newTank],
                }));
            },

            updateTank: (tankId, updates) => {
                set(state => ({
                    tankConfigs: state.tankConfigs.map(t =>
                        t.tankId === tankId
                            ? { ...t, ...updates, lastUpdated: new Date().toISOString() }
                            : t
                    ),
                }));
            },

            deleteTank: tankId => {
                // Also update nozzles to remove tank reference
                set(state => ({
                    tankConfigs: state.tankConfigs.filter(t => t.tankId !== tankId),
                    nozzleConfigs: state.nozzleConfigs.filter(n => n.tankId !== tankId),
                }));
            },

            updateTankLevel: (tankId, level) => {
                const state = get();
                const tank = state.tankConfigs.find(t => t.tankId === tankId);

                set(s => ({
                    tankConfigs: s.tankConfigs.map(t =>
                        t.tankId === tankId
                            ? {
                                  ...t,
                                  currentLevel: level,
                                  lastUpdated: new Date().toISOString(),
                                  daysUntilRefill: state.calculateDaysUntilRefill(tankId),
                              }
                            : t
                    ),
                }));

                // Sync level to fuel store to keep inventory in harmony
                try {
                    const fuelStore = useFuelStore.getState();
                    fuelStore.updateTank(tankId, { currentLevel: level });
                } catch (e) {
                    console.warn('Could not sync tank level with fuel store:', e);
                }

                // Check for low inventory alert
                if (tank && level <= tank.minimumThresholdLevel) {
                    const alertConfig = state.alertConfigs.find(
                        a => a.type === 'LOW_INVENTORY' && a.isEnabled
                    );
                    if (alertConfig) {
                        get().createSystemAlert(
                            'LOW_INVENTORY',
                            level <= tank.minimumThresholdLevel * 0.5 ? 'CRITICAL' : 'WARNING',
                            `Low Fuel Level: ${tank.name}`,
                            `${tank.name} is at ${level.toLocaleString()}L (${((level / tank.capacity) * 100).toFixed(1)}%). Refill required.`,
                            'TANK',
                            tankId
                        );
                    }
                }
            },

            addTankMaintenance: (tankId, record) => {
                const newRecord: TankMaintenanceRecord = {
                    ...record,
                    id: `TMR-${Date.now()}`,
                };
                set(state => ({
                    tankConfigs: state.tankConfigs.map(t =>
                        t.tankId === tankId
                            ? {
                                  ...t,
                                  maintenanceHistory: [...t.maintenanceHistory, newRecord],
                                  lastCalibrationDate:
                                      record.type === 'CALIBRATION'
                                          ? record.date
                                          : t.lastCalibrationDate,
                              }
                            : t
                    ),
                }));
            },

            // Nozzle Actions
            addNozzle: nozzleData => {
                const { settings } = useSettingsStore.getState();
                const newNozzle: NozzleConfiguration = {
                    ...nozzleData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    nozzleId: `NOZ-${Date.now()}`,
                    performanceMetrics: {
                        totalLitersDispensed: 0,
                        averageDailyDispense: 0,
                        accuracyScore: 100,
                        lastShiftDispense: 0,
                    },
                    maintenanceHistory: [],
                };
                set(state => ({
                    nozzleConfigs: [...state.nozzleConfigs, newNozzle],
                    tankConfigs: state.tankConfigs.map(t =>
                        t.tankId === nozzleData.tankId
                            ? { ...t, nozzles: [...t.nozzles, newNozzle.nozzleId] }
                            : t
                    ),
                }));
            },

            updateNozzle: (nozzleId, updates) => {
                set(state => ({
                    nozzleConfigs: state.nozzleConfigs.map(n =>
                        n.nozzleId === nozzleId ? { ...n, ...updates } : n
                    ),
                }));
            },

            deleteNozzle: nozzleId => {
                const nozzle = get().nozzleConfigs.find(n => n.nozzleId === nozzleId);
                set(state => ({
                    nozzleConfigs: state.nozzleConfigs.filter(n => n.nozzleId !== nozzleId),
                    tankConfigs: state.tankConfigs.map(t =>
                        t.tankId === nozzle?.tankId
                            ? { ...t, nozzles: t.nozzles.filter(id => id !== nozzleId) }
                            : t
                    ),
                }));
            },

            reassignNozzleToTank: (nozzleId, newTankId) => {
                const nozzle = get().nozzleConfigs.find(n => n.nozzleId === nozzleId);
                if (!nozzle) return;

                const oldTankId = nozzle.tankId;
                const newTank = get().tankConfigs.find(t => t.tankId === newTankId);

                set(state => ({
                    nozzleConfigs: state.nozzleConfigs.map(n =>
                        n.nozzleId === nozzleId ? { ...n, tankId: newTankId } : n
                    ),
                    tankConfigs: state.tankConfigs.map(t => {
                        if (t.tankId === oldTankId) {
                            return { ...t, nozzles: t.nozzles.filter(id => id !== nozzleId) };
                        }
                        if (t.tankId === newTankId) {
                            return { ...t, nozzles: [...t.nozzles, nozzleId] };
                        }
                        return t;
                    }),
                }));

                // Update nozzle fuel type based on new tank
                if (newTank) {
                    get().updateNozzle(nozzleId, { tankId: newTankId });
                }
            },

            resetMeter: (nozzleId, newReading, performedBy) => {
                const nozzle = get().nozzleConfigs.find(n => n.nozzleId === nozzleId);
                if (!nozzle) return;

                const oldReading = nozzle.currentReading;
                const timestamp = new Date().toISOString();

                // 1. Update nozzle reading
                get().updateNozzle(nozzleId, { currentReading: newReading });

                // 2. Add maintenance record for the reset
                get().addNozzleMaintenance(nozzleId, {
                    nozzleId,
                    date: timestamp,
                    type: 'METER_REPAIR', // Using existing type for reset
                    performedBy,
                    notes: `Manual Meter Reset. Previous: ${oldReading.toLocaleString()}L, New: ${newReading.toLocaleString()}L.`,
                });

                // 3. Create system alert
                get().createSystemAlert(
                    'MAINTENANCE_DUE', // Reusing this for tracking
                    'INFO',
                    `Meter Reset: ${nozzle.name}`,
                    `Meter was reset from ${oldReading.toLocaleString()}L to ${newReading.toLocaleString()}L by ${performedBy}.`,
                    'NOZZLE',
                    nozzleId
                );
            },

            addNozzleMaintenance: (nozzleId, record) => {
                const newRecord: NozzleMaintenanceRecord = {
                    ...record,
                    id: `NMR-${Date.now()}`,
                };
                set(state => ({
                    nozzleConfigs: state.nozzleConfigs.map(n =>
                        n.nozzleId === nozzleId
                            ? {
                                  ...n,
                                  maintenanceHistory: [...n.maintenanceHistory, newRecord],
                                  lastCalibrationDate:
                                      record.type === 'CALIBRATION'
                                          ? record.date
                                          : n.lastCalibrationDate,
                                  calibrationStatus:
                                      record.type === 'CALIBRATION'
                                          ? 'CALIBRATED'
                                          : n.calibrationStatus,
                              }
                            : n
                    ),
                }));
            },

            // Rate Actions
            changeRate: (fuelType, newRate, changedBy, changedByName, reason, reasonNote) => {
                const currentConfig = get().rateConfigs.find(r => r.fuelType === fuelType);
                const oldRate = currentConfig?.currentRate || 0;
                const timestamp = new Date().toISOString();

                // Create rate change record
                const rateChange: RateChange = {
                    id: `RC-${Date.now()}`,
                    fuelType,
                    oldRate,
                    newRate,
                    rateDifference: newRate - oldRate,
                    changePercentage: oldRate > 0 ? ((newRate - oldRate) / oldRate) * 100 : 0,
                    effectiveDate: timestamp.split('T')[0],
                    effectiveTime: timestamp.split('T')[1].split('.')[0],
                    changedBy,
                    changedByName,
                    reason,
                    reasonNote,
                    timestamp,
                };

                set(state => ({
                    tankConfigs: state.tankConfigs.map(tank =>
                        tank.fuelType === fuelType
                            ? {
                                  ...tank,
                                  salePrice: newRate,
                                  lastUpdated: timestamp,
                              }
                            : tank
                    ),
                    rateConfigs: state.rateConfigs.map(r =>
                        r.fuelType === fuelType
                            ? {
                                  ...r,
                                  previousRate: oldRate,
                                  currentRate: newRate,
                                  effectiveFrom: timestamp,
                                  lastChangedBy: changedBy,
                                  lastChangedAt: timestamp,
                                  rateHistory: [...r.rateHistory, rateChange],
                              }
                            : r
                    ),
                    rateChangeHistory: [...state.rateChangeHistory, rateChange],
                }));

                // Create system alert for rate change
                const alertConfig = get().alertConfigs.find(
                    a => a.type === 'RATE_CHANGE' && a.isEnabled
                );
                if (alertConfig) {
                    get().createSystemAlert(
                        'RATE_CHANGE',
                        'INFO',
                        `Rate Changed: ${fuelType.replace('_', ' ')}`,
                        `Rate changed from PKR ${oldRate.toFixed(2)} to PKR ${newRate.toFixed(2)} (${rateChange.changePercentage >= 0 ? '+' : ''}${rateChange.changePercentage.toFixed(2)}%)`,
                        'RATE',
                        rateChange.id
                    );
                }

                // Sync with fuel store - update SALE price for all tanks of this fuel type (BU-scoped)
                try {
                    const { settings: syncSettings } = useSettingsStore.getState();
                    const fuelStore = useFuelStore.getState();
                    get().tankConfigs
                        .filter(tank => tank.businessUnit === syncSettings.businessUnit)
                        .forEach(tank => {
                            if (tank.fuelType === fuelType) {
                                fuelStore.updateFuelPrice(tank.tankId, tank.costPrice, newRate);
                            }
                        });
                } catch (e) {
                    console.warn('Could not sync rate change with fuel store:', e);
                }

                return rateChange;
            },

            getCurrentRate: fuelType => {
                const config = get().rateConfigs.find(r => r.fuelType === fuelType);
                return config?.currentRate || 0;
            },

            getRateHistory: fuelType => {
                const config = get().rateConfigs.find(r => r.fuelType === fuelType);
                return config?.rateHistory || [];
            },

            // Alert Actions
            updateAlertConfig: (alertId, updates) => {
                set(state => ({
                    alertConfigs: state.alertConfigs.map(a =>
                        a.id === alertId
                            ? { ...a, ...updates, updatedAt: new Date().toISOString() }
                            : a
                    ),
                }));
            },

            createSystemAlert: (
                type,
                severity,
                title,
                message,
                relatedEntityType,
                relatedEntityId
            ) => {
                const newAlert: SystemAlert = {
                    id: `SA-${Date.now()}`,
                    type,
                    severity,
                    title,
                    message,
                    relatedEntityType,
                    relatedEntityId,
                    isRead: false,
                    isDismissed: false,
                    createdAt: new Date().toISOString(),
                };
                set(state => ({
                    systemAlerts: [newAlert, ...state.systemAlerts],
                }));
            },

            dismissAlert: (alertId, dismissedBy) => {
                set(state => ({
                    systemAlerts: state.systemAlerts.map(a =>
                        a.id === alertId
                            ? {
                                  ...a,
                                  isDismissed: true,
                                  dismissedAt: new Date().toISOString(),
                                  dismissedBy,
                              }
                            : a
                    ),
                }));
            },

            markAlertRead: alertId => {
                set(state => ({
                    systemAlerts: state.systemAlerts.map(a =>
                        a.id === alertId ? { ...a, isRead: true } : a
                    ),
                }));
            },

            getUnreadAlerts: () => {
                return get().systemAlerts.filter(a => !a.isRead && !a.isDismissed);
            },

            getActiveAlerts: () => {
                return get().systemAlerts.filter(a => !a.isDismissed);
            },

            // Getters — ALL scoped to active businessUnit
            getTankById: tankId => {
                const { settings } = useSettingsStore.getState();
                return get().tankConfigs.find(
                    t => t.tankId === tankId && t.businessUnit === settings.businessUnit
                );
            },

            getNozzleById: nozzleId => {
                const { settings } = useSettingsStore.getState();
                return get().nozzleConfigs.find(
                    n => n.nozzleId === nozzleId && n.businessUnit === settings.businessUnit
                );
            },

            getNozzlesForTank: tankId => {
                const { settings } = useSettingsStore.getState();
                return get().nozzleConfigs.filter(
                    n => n.tankId === tankId && n.businessUnit === settings.businessUnit
                );
            },

            getActiveNozzles: () => {
                const { settings } = useSettingsStore.getState();
                return get().nozzleConfigs.filter(
                    n => n.isActive && n.status === 'ACTIVE' && n.businessUnit === settings.businessUnit
                );
            },

            getTankFillPercentage: tankId => {
                const { settings } = useSettingsStore.getState();
                const tank = get().tankConfigs.find(
                    t => t.tankId === tankId && t.businessUnit === settings.businessUnit
                );
                if (!tank) return 0;
                return (tank.currentLevel / tank.capacity) * 100;
            },

            getLowInventoryTanks: () => {
                const { settings } = useSettingsStore.getState();
                return get().tankConfigs.filter(
                    t => t.currentLevel <= t.minimumThresholdLevel && t.businessUnit === settings.businessUnit
                );
            },

            calculateDaysUntilRefill: tankId => {
                const { settings } = useSettingsStore.getState();
                const tank = get().tankConfigs.find(
                    t => t.tankId === tankId && t.businessUnit === settings.businessUnit
                );
                if (!tank) return 0;

                // Get average daily consumption from nozzle metrics
                const nozzles = get().getNozzlesForTank(tankId);
                const avgDailyConsumption = nozzles.reduce(
                    (sum, n) => sum + n.performanceMetrics.averageDailyDispense,
                    0
                );

                if (avgDailyConsumption <= 0) return 999; // No consumption data

                const availableFuel = tank.currentLevel - tank.reorderPoint;
                return Math.max(0, Math.floor(availableFuel / avgDailyConsumption));
            },
        }),
        {
            name: 'motorway-config',
            partialize: state => ({
                stationConfig: state.stationConfig,
                tankConfigs: state.tankConfigs,
                nozzleConfigs: state.nozzleConfigs,
                rateConfigs: state.rateConfigs,
                alertConfigs: state.alertConfigs,
                systemAlerts: state.systemAlerts.slice(0, 100), // Keep last 100 alerts
                rateChangeHistory: state.rateChangeHistory.slice(-50), // Keep last 50 rate changes
            }),
            // Migrate old localStorage where stationConfig/rateConfigs/alertConfigs were null/empty
            merge: (persistedState: any, currentState: ConfigState) => {
                const merged = { ...currentState, ...(persistedState || {}) };
                // If persisted stationConfig is null, use the fresh default from currentState
                if (!merged.stationConfig) {
                    merged.stationConfig = currentState.stationConfig;
                }
                // If persisted rateConfigs is empty, use defaults
                if (!merged.rateConfigs || merged.rateConfigs.length === 0) {
                    merged.rateConfigs = currentState.rateConfigs;
                }
                // If persisted alertConfigs is empty, use defaults
                if (!merged.alertConfigs || merged.alertConfigs.length === 0) {
                    merged.alertConfigs = currentState.alertConfigs;
                }
                return merged;
            },
        }
    )
);
