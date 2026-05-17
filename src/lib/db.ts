/**
 * db.ts - Firestore Database Layer
 * Scopes all collections to /stations/{stationId}/
 * This replaces localStorage as the persistent data store.
 */

import { getApps, initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';

type FirebaseEnvKey =
    | 'VITE_FIREBASE_API_KEY'
    | 'VITE_FIREBASE_AUTH_DOMAIN'
    | 'VITE_FIREBASE_PROJECT_ID'
    | 'VITE_FIREBASE_STORAGE_BUCKET'
    | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
    | 'VITE_FIREBASE_APP_ID';

const getRequiredEnv = (key: FirebaseEnvKey): string => {
    const value = import.meta.env[key];
    if (!value || !value.trim()) {
        throw new Error(`Missing required Firebase environment variable: ${key}`);
    }
    return value;
};

const firebaseConfig = {
    apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const stationCol = (
    stationId: string,
    path: string
): CollectionReference<DocumentData> => collection(db, 'stations', stationId, path);

export const stationDoc = (stationId: string, path: string, docId: string) =>
    doc(db, 'stations', stationId, path, docId);

export const COLLECTIONS = {
    FUEL_SHIFTS: 'shifts',
    CNG_SHIFTS: 'cngShifts',
    FUEL_TANKS: 'tanks',
    CNG_CASCADES: 'cngCascades',
    CNG_NOZZLES: 'cngNozzles',
    CUSTOMERS: 'customers',
    SUPPLIERS: 'suppliers',
    STAFF: 'staff',
    ATTENDANCE: 'attendance',
    EXPENSES: 'expenses',
    PRODUCTS: 'products',
    SALES: 'sales',
    CUSTOMER_LEDGER: 'customerLedger',
    SUPPLIER_LEDGER: 'supplierLedger',
    CASH_BANK: 'cashBank',
    CASH_LEDGER: 'cashLedger',
    STAFF_LEDGER: 'staffLedger',
    AUDIT_LOGS: 'auditLogs',
    ACCESS_REQUESTS: 'accessRequests',
    PROFIT_ENTRIES: 'profitEntries',
    DISCOUNTS: 'discounts',
    RATE_CONFIGS: 'rateConfigs',
    NOZZLE_CONFIGS: 'nozzleConfigs',
    TANK_CONFIGS: 'tankConfigs',
    STATION_PROFILE: 'stationProfile',
    PURCHASE_ORDERS: 'purchaseOrders',
    REPORT_SCHEDULES: 'reportSchedules',
    REPORT_RUN_LOGS: 'reportRunLogs',
} as const;
