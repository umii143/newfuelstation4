/**
 * firestoreService.ts — Generic Firestore CRUD Operations
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

const COLLECTION_DEFAULT_BUSINESS: Partial<Record<string, BusinessUnit>> = {
    [COLLECTIONS.FUEL_SHIFTS]: 'FUEL',
    [COLLECTIONS.FUEL_TANKS]: 'FUEL',
    [COLLECTIONS.NOZZLE_CONFIGS]: 'FUEL',
    [COLLECTIONS.TANK_CONFIGS]: 'FUEL',
    [COLLECTIONS.CNG_SHIFTS]: 'CNG',
    [COLLECTIONS.CNG_CASCADES]: 'CNG',
    [COLLECTIONS.CNG_NOZZLES]: 'CNG',
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

// ── Generic save (upsert by ID) ─────────────────────────────────────────────
export const fsSet = async <T extends DocumentData>(
    stationId: string,
    collectionName: string,
    id: string,
    data: T
): Promise<void> => {
    try {
        const payload = applyBusinessScope(collectionName, data as Record<string, any>);
        await setDoc(stationDoc(stationId, collectionName, id), {
            ...payload,
            _updatedAt: new Date().toISOString(),
        });
        console.log(`[Firestore ✅] Saved ${collectionName}/${id} to station ${stationId}`);
    } catch (err: any) {
        console.error(`[Firestore ❌] FAILED to save ${collectionName}/${id} to station ${stationId}:`, err?.code, err?.message || err);
    }
};

// ── Generic add (auto-ID) ───────────────────────────────────────────────────
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
    } catch (err) {
        console.error(`[Firestore] Failed to add to ${collectionName}:`, err);
        return '';
    }
};

// ── Generic load all ────────────────────────────────────────────────────────
export const fsLoadAll = async <T>(
    stationId: string,
    collectionName: string
): Promise<T[]> => {
    try {
        const snapshot = await getDocs(stationCol(stationId, collectionName));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as T);
    } catch (err) {
        console.error(`[Firestore] Failed to load ${collectionName}:`, err);
        return [];
    }
};

// ── Generic update (partial) ─────────────────────────────────────────────────
export const fsUpdate = async (
    stationId: string,
    collectionName: string,
    id: string,
    data: Partial<DocumentData>
): Promise<void> => {
    try {
        const payload = applyBusinessScope(collectionName, data as Record<string, any>);
        await updateDoc(stationDoc(stationId, collectionName, id), {
            ...payload,
            _updatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error(`[Firestore] Failed to update ${collectionName}/${id}:`, err);
    }
};

// ── Generic delete ──────────────────────────────────────────────────────────
export const fsDelete = async (
    stationId: string,
    collectionName: string,
    id: string
): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'stations', stationId, collectionName, id));
    } catch (err) {
        console.error(`[Firestore] Failed to delete ${collectionName}/${id}:`, err);
    }
};

// ── Named collection loaders (for useFirestoreInit) ──────────────────────────
export const loadAllCollections = async (stationId: string) => {
    // 5-second timeout to prevent indefinite hanging when offline or using dummy credentials
    const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firestore sync timed out')), 5000)
    );

    const [
        shifts, cngShifts, tanks, cngCascades, cngNozzles,
        customers, suppliers, staff, attendance, expenses,
        products, sales, customerLedger, supplierLedger,
        cashBank, cashLedger, staffLedger, auditLogs, profitEntries,
        discounts
    ] = await Promise.race([
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
        ]),
        timeoutPromise
    ]) as any;

    return {
        shifts, cngShifts, tanks, cngCascades, cngNozzles,
        customers, suppliers, staff, attendance, expenses,
        products, sales, customerLedger, supplierLedger,
        cashBank, cashLedger, staffLedger, auditLogs, profitEntries,
        discounts,
    };
};
