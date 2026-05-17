/**
 * useFirestoreInit.ts
 * Loads only the active business into in-memory state and rehydrates on
 * business toggle so cross-business data never remains on screen.
 */

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useCashBankStore, useCustomerLedgerStore, useStaffLedgerStore, useSupplierLedgerStore, useAuditStore } from '@/stores/ledgerStore';
import { useCustomerStore, useExpenseStore, useStaffStore, useSupplierStore } from '@/stores/dataStores';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useCNGStore } from '@/stores/cngStore';
import { useProfitStore } from '@/stores/profitStore';
import { useDiscountStore } from '@/stores/discountStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { COLLECTIONS, db } from '@/lib/db';
import { hydrateBusinessScopedStores, type FirestoreBusinessData } from '@/lib/businessStoreSync';
import { filterByBusinessScope, normalizeBusinessUnit, type BusinessUnit } from '@/lib/businessScope';
import { loadAllCollections } from '@/services/firestoreService';

export const useFirestoreInit = () => {
    const { user } = useAuthStore();
    const activeBusiness = useSettingsStore(state =>
        normalizeBusinessUnit(state.settings.businessUnit)
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribes: Array<() => void> = [];

        const setupListener = (
            stationId: string,
            collectionName: string,
            storeUpdater: (docs: any[]) => void,
            fallbackUnit?: BusinessUnit
        ) => {
            const q = query(collection(db, 'stations', stationId, collectionName));

            return onSnapshot(
                q,
                snapshot => {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    storeUpdater(filterByBusinessScope(docs, activeBusiness, fallbackUnit));
                },
                err => {
                    console.error(`[Firestore Sync] Failed for ${collectionName}:`, err);
                }
            );
        };

        const initFirestore = async () => {
            if (!user?.stationId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const stationId = user.stationId;
                console.log(
                    `[Firestore] Hydrating station ${stationId} for ${activeBusiness}...`
                );

                const data = (await loadAllCollections(stationId)) as FirestoreBusinessData;
                hydrateBusinessScopedStores(data, activeBusiness);
                useScheduleStore.getState().setSchedules((data.reportSchedules as any) || []);
                useScheduleStore.getState().setRunLogs((data.reportRunLogs as any) || []);

                unsubscribes.push(
                    setupListener(
                        stationId,
                        COLLECTIONS.FUEL_TANKS,
                        docs => useFuelStore.setState({ tanks: docs as any }),
                        'FUEL'
                    )
                );
                unsubscribes.push(
                    setupListener(
                        stationId,
                        COLLECTIONS.FUEL_SHIFTS,
                        docs => useFuelStore.setState({ shifts: docs as any }),
                        'FUEL'
                    )
                );

                unsubscribes.push(
                    setupListener(
                        stationId,
                        COLLECTIONS.CNG_CASCADES,
                        docs => useCNGStore.setState({ cascades: docs as any }),
                        'CNG'
                    )
                );
                unsubscribes.push(
                    setupListener(
                        stationId,
                        COLLECTIONS.CNG_NOZZLES,
                        docs => useCNGStore.setState({ nozzles: docs as any }),
                        'CNG'
                    )
                );
                unsubscribes.push(
                    setupListener(
                        stationId,
                        COLLECTIONS.CNG_SHIFTS,
                        docs => useCNGStore.setState({ shifts: docs as any }),
                        'CNG'
                    )
                );

                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.CUSTOMERS, docs =>
                        useCustomerStore.setState({ customers: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.SUPPLIERS, docs =>
                        useSupplierStore.setState({ suppliers: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.STAFF, docs =>
                        useStaffStore.setState({ users: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.ATTENDANCE, docs =>
                        useStaffStore.setState({ attendance: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.EXPENSES, docs =>
                        useExpenseStore.setState({ expenses: docs as any })
                    )
                );

                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.PRODUCTS, docs =>
                        useProductStore.setState({ products: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.SALES, docs =>
                        useSalesStore.setState({ sales: docs as any })
                    )
                );

                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.CUSTOMER_LEDGER, docs =>
                        useCustomerLedgerStore.setState({ entries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.SUPPLIER_LEDGER, docs =>
                        useSupplierLedgerStore.setState({ entries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.CASH_BANK, docs =>
                        useCashBankStore.setState({ accounts: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.CASH_LEDGER, docs =>
                        useCashBankStore.setState({ entries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.STAFF_LEDGER, docs =>
                        useStaffLedgerStore.setState({ entries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.AUDIT_LOGS, docs =>
                        useAuditStore.setState({ logs: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.PROFIT_ENTRIES, docs =>
                        useProfitStore.setState({ entries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.DISCOUNTS, docs =>
                        useDiscountStore.setState({ discountEntries: docs as any })
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.REPORT_SCHEDULES, docs =>
                        useScheduleStore.getState().setSchedules(docs as any)
                    )
                );
                unsubscribes.push(
                    setupListener(stationId, COLLECTIONS.REPORT_RUN_LOGS, docs =>
                        useScheduleStore.getState().setRunLogs(docs as any)
                    )
                );

                setIsLoading(false);
            } catch (err: any) {
                console.error('[Firestore Init Error]:', err);
                setError(err.message || 'Failed to sync with cloud database');
                setIsLoading(false);
            }
        };

        initFirestore();

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [activeBusiness, user?.stationId]);

    return { isLoading, error };
};



