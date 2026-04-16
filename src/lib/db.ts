/**
 * db.ts — Firestore Database Layer
 * Scopes all collections to /stations/{stationId}/
 * This replaces localStorage as the persistent data store.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
    collection,
    doc,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    type CollectionReference,
    type DocumentData,
} from 'firebase/firestore';

// ── Firebase config (reads from .env, falls back to hardcoded for dev) ──────
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'motorway-oil.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'motorway-oil',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'motorway-oil.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Avoid re-initializing if already done (HMR safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// ── Station-scoped collection helper ────────────────────────────────────────
// All data is scoped under /stations/{stationId}/ for multi-tenancy

export const stationCol = (stationId: string, path: string): CollectionReference<DocumentData> =>
    collection(db, 'stations', stationId, path);

export const stationDoc = (stationId: string, path: string, docId: string) =>
    doc(db, 'stations', stationId, path, docId);

// ── Collection name constants ───────────────────────────────────────────────
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
    PROFIT_ENTRIES: 'profitEntries',
    DISCOUNTS: 'discounts',
    RATE_CONFIGS: 'rateConfigs',
    NOZZLE_CONFIGS: 'nozzleConfigs',
    TANK_CONFIGS: 'tankConfigs',
    STATION_PROFILE: 'stationProfile',
} as const;
