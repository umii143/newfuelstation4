/**
 * useFirestoreInit.ts — Firestore Hydration Hook
 * Called once when the user logs in.
 * Loads all data from Firestore into Zustand stores.
 * Sets up real-time listeners for multi-terminal sync.
 */

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import {
    useCashBankStore,
    useCustomerLedgerStore,
    useStaffLedgerStore,
    useSupplierLedgerStore,
    useAuditStore,
} from '@/stores/ledgerStore';
import {
    useCustomerStore,
    useSupplierStore,
    useStaffStore,
    useExpenseStore,
} from '@/stores/dataStores';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { useCNGStore } from '@/stores/cngStore';
import { useProfitStore } from '@/stores/profitStore';
import { useDiscountStore } from '@/stores/discountStore';
import { COLLECTIONS, db } from '@/lib/db';
import { loadAllCollections } from '@/services/firestoreService';

export const useFirestoreInit = () => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribes: (() => void)[] = [];

        const initFirestore = async () => {
            if (!user?.stationId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const stationId = user.stationId;

                // 1. Initial Load (Hydration)
                console.log(`[Firestore] Hydrating station ${stationId}...`);
                const data = await loadAllCollections(stationId);

                // Populate Zustand stores
                useFuelStore.setState({ shifts: data.shifts as any, tanks: data.tanks as any });
                useCNGStore.setState({ shifts: data.cngShifts as any, cascades: data.cngCascades as any, nozzles: data.cngNozzles as any });
                
                useCustomerStore.setState({ customers: data.customers as any });
                useSupplierStore.setState({ suppliers: data.suppliers as any });
                useStaffStore.setState({ users: data.staff as any, attendance: data.attendance as any });
                useExpenseStore.setState({ expenses: data.expenses as any });

                useProductStore.setState({ products: data.products as any });
                useSalesStore.setState({ sales: data.sales as any });

                (useCustomerLedgerStore as any).setState({ entries: data.customerLedger as any });
                (useSupplierLedgerStore as any).setState({ entries: data.supplierLedger as any });
                (useCashBankStore as any).setState({ entries: data.cashBank as any });
                (useStaffLedgerStore as any).setState({ entries: data.staffLedger as any });
                useAuditStore.setState({ logs: data.auditLogs as any });
                useProfitStore.setState({ entries: data.profitEntries as any });
                useDiscountStore.setState({ discountEntries: data.discounts as any });

                console.log('[Firestore] Hydration complete.');

                // 2. Setup Real-time Listeners (Multi-terminal sync)
                const setupListener = (collectionName: string, storeUpdater: (docs: any[]) => void) => {
                    const q = query(collection(db, 'stations', stationId, collectionName));
                    return onSnapshot(q, (snapshot) => {
                        // We only process if there are actual changes (not just latency compensation)
                        if (!snapshot.metadata.hasPendingWrites) {
                            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            storeUpdater(docs);
                        }
                    }, (err) => {
                        console.error(`[Firestore Sync] Failed for ${collectionName}:`, err);
                    });
                };

                // Example: Sync tanks in real-time
                unsubscribes.push(
                    setupListener(COLLECTIONS.FUEL_TANKS, (docs) => {
                        useFuelStore.setState({ tanks: docs as any });
                    })
                );
                
                // Example: Sync expenses in real-time
                unsubscribes.push(
                    setupListener(COLLECTIONS.EXPENSES, (docs) => {
                        useExpenseStore.setState({ expenses: docs as any });
                    })
                );

                setIsLoading(false);
            } catch (err: any) {
                console.error('[Firestore Init Error]:', err);
                setError(err.message || 'Failed to sync with cloud database');
                setIsLoading(false);
            }
        };

        if (!user?.stationId) {
            setIsLoading(false);
            return;
        }

        initFirestore();

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user?.stationId]);

    return { isLoading, error };
};
