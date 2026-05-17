/**
 * firestoreService.ts - Generic Firestore CRUD Operations
 * All operations are scoped to the station's collection.
 * Zustand updates instantly; Firestore writes happen async in background.
 */

import {
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    type DocumentData,
} from 'firebase/firestore';
import { stampBusinessScope, type BusinessUnit } from '@/lib/businessScope';
import { COLLECTIONS, db, stationCol, stationDoc } from '@/lib/db';
import { useToastStore } from '@/stores/toastStore';

const COLLECTION_DEFAULT_BUSINESS: Partial<Record<string, BusinessUnit>> = {
    [COLLECTIONS.FUEL_SHIFTS]: 'FUEL',
    [COLLECTIONS.FUEL_TANKS]: 'FUEL',
    [COLLECTIONS.NOZZLE_CONFIGS]: 'FUEL',
    [COLLECTIONS.TANK_CONFIGS]: 'FUEL',
    [COLLECTIONS.CNG_SHIFTS]: 'CNG',
    [COLLECTIONS.CNG_CASCADES]: 'CNG',
    [COLLECTIONS.CNG_NOZZLES]: 'CNG',
};

const getPermissionMessage = (collectionName: string): string => {
    switch (collectionName) {
        case COLLECTIONS.STAFF:
            return 'Only authorized managers can change staff records.';
        case COLLECTIONS.CASH_BANK:
            return 'This cash and bank setup action requires a finance role.';
        case COLLECTIONS.DISCOUNTS:
            return 'This discount change requires a manager, owner, or cashier role.';
        case COLLECTIONS.AUDIT_LOGS:
            return 'Audit records are append-only and cannot be changed.';
        case COLLECTIONS.PURCHASE_ORDERS:
            return 'Only authorized managers can change purchase orders.';
        case COLLECTIONS.PROFIT_ENTRIES:
            return 'Profit intelligence entries are restricted to privileged roles.';
        default:
            return 'You do not have permission to change this station data.';
    }
};

const notifyPermissionDenied = (collectionName: string) => {
    useToastStore
        .getState()
        .error('Access denied', getPermissionMessage(collectionName));
};

const handleFirestoreError = (collectionName: string, error: unknown) => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'permission-denied'
    ) {
        notifyPermissionDenied(collectionName);
    }
};

const applyBusinessScope = (
    collectionName: string,
    data: Record<string, any>
): Record<string, any> => {
    const hasExplicitScope =
        typeof data.businessUnit === 'string' || typeof data.business_id === 'string';
    const defaultBusiness = COLLECTION_DEFAULT_BUSINESS[collectionName];

    if (!hasExplicitScope && !defaultBusiness) {
        return data;
    }

    return stampBusinessScope(data, data.businessUnit || defaultBusiness);
};

export const fsSet = async <T extends DocumentData>(
    stationId: string,
    collectionName: string,
    id: string,
    data: T
): Promise<boolean> => {
    try {
        const payload = applyBusinessScope(collectionName, data as Record<string, any>);
        await setDoc(stationDoc(stationId, collectionName, id), {
            ...payload,
            _updatedAt: new Date().toISOString(),
        });
        console.log(`[Firestore] Saved ${collectionName}/${id} to station ${stationId}`);
        return true;
    } catch (error) {
        handleFirestoreError(collectionName, error);
        console.error(
            `[Firestore] Failed to save ${collectionName}/${id} to station ${stationId}:`,
            error
        );
        return false;
    }
};

export const fsAdd = async <T extends DocumentData>(
    stationId: string,
    collectionName: string,
    data: T
): Promise<string> => {
    try {
        const payload = applyBusinessScope(collectionName, data as Record<string, any>);
        const ref = await addDoc(stationCol(stationId, collectionName), {
            ...payload,
            _createdAt: new Date().toISOString(),
        });
        return ref.id;
    } catch (error) {
        handleFirestoreError(collectionName, error);
        console.error(`[Firestore] Failed to add to ${collectionName}:`, error);
        return '';
    }
};

export const fsLoadAll = async <T>(
    stationId: string,
    collectionName: string
): Promise<T[]> => {
    try {
        const snapshot = await getDocs(stationCol(stationId, collectionName));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as T);
    } catch (error) {
        console.error(`[Firestore] Failed to load ${collectionName}:`, error);
        return [];
    }
};

export const fsUpdate = async (
    stationId: string,
    collectionName: string,
    id: string,
    data: Partial<DocumentData>
): Promise<boolean> => {
    try {
        const payload = applyBusinessScope(collectionName, data as Record<string, any>);
        await updateDoc(stationDoc(stationId, collectionName, id), {
            ...payload,
            _updatedAt: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        handleFirestoreError(collectionName, error);
        console.error(`[Firestore] Failed to update ${collectionName}/${id}:`, error);
        return false;
    }
};

export const fsDelete = async (
    stationId: string,
    collectionName: string,
    id: string
): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, 'stations', stationId, collectionName, id));
        return true;
    } catch (error) {
        handleFirestoreError(collectionName, error);
        console.error(`[Firestore] Failed to delete ${collectionName}/${id}:`, error);
        return false;
    }
};

export const loadAllCollections = async (stationId: string) => {
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore sync timed out')), 5000)
    );

    const [
        shifts,
        cngShifts,
        tanks,
        cngCascades,
        cngNozzles,
        customers,
        suppliers,
        staff,
        attendance,
        expenses,
        products,
        sales,
        customerLedger,
        supplierLedger,
        cashBank,
        cashLedger,
        staffLedger,
        auditLogs,
        profitEntries,
        discounts,
        reportSchedules,
        reportRunLogs,
    ] = (await Promise.race([
        Promise.all([
            fsLoadAll(stationId, COLLECTIONS.FUEL_SHIFTS),
            fsLoadAll(stationId, COLLECTIONS.CNG_SHIFTS),
            fsLoadAll(stationId, COLLECTIONS.FUEL_TANKS),
            fsLoadAll(stationId, COLLECTIONS.CNG_CASCADES),
            fsLoadAll(stationId, COLLECTIONS.CNG_NOZZLES),
            fsLoadAll(stationId, COLLECTIONS.CUSTOMERS),
            fsLoadAll(stationId, COLLECTIONS.SUPPLIERS),
            fsLoadAll(stationId, COLLECTIONS.STAFF),
            fsLoadAll(stationId, COLLECTIONS.ATTENDANCE),
            fsLoadAll(stationId, COLLECTIONS.EXPENSES),
            fsLoadAll(stationId, COLLECTIONS.PRODUCTS),
            fsLoadAll(stationId, COLLECTIONS.SALES),
            fsLoadAll(stationId, COLLECTIONS.CUSTOMER_LEDGER),
            fsLoadAll(stationId, COLLECTIONS.SUPPLIER_LEDGER),
            fsLoadAll(stationId, COLLECTIONS.CASH_BANK),
            fsLoadAll(stationId, COLLECTIONS.CASH_LEDGER),
            fsLoadAll(stationId, COLLECTIONS.STAFF_LEDGER),
            fsLoadAll(stationId, COLLECTIONS.AUDIT_LOGS),
            fsLoadAll(stationId, COLLECTIONS.PROFIT_ENTRIES),
            fsLoadAll(stationId, COLLECTIONS.DISCOUNTS),
            fsLoadAll(stationId, COLLECTIONS.REPORT_SCHEDULES),
            fsLoadAll(stationId, COLLECTIONS.REPORT_RUN_LOGS),
        ]),
        timeoutPromise,
    ])) as any;

    return {
        shifts,
        cngShifts,
        tanks,
        cngCascades,
        cngNozzles,
        customers,
        suppliers,
        staff,
        attendance,
        expenses,
        products,
        sales,
        customerLedger,
        supplierLedger,
        cashBank,
        cashLedger,
        staffLedger,
        auditLogs,
        profitEntries,
        discounts,
        reportSchedules,
        reportRunLogs,
    };
};
