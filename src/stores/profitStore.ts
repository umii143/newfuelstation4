import type { ProfitLedgerEntry } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStationId } from '@/lib/authHelpers';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';
import { useSettingsStore } from './authStore';
import { stampBusinessScope } from '@/lib/businessScope';

interface ProfitState {
    entries: ProfitLedgerEntry[];
    isLoading: boolean;

    // Actions
    addProfitEntry: (entry: Omit<ProfitLedgerEntry, 'id' | 'timestamp' | 'businessUnit'>) => void;
    getProfitLedger: (startDate?: string, endDate?: string) => ProfitLedgerEntry[];
    getTotalNetProfit: (startDate?: string, endDate?: string) => number;
}

export const useProfitStore = create<ProfitState>()(
    persist(
        (set, get) => ({
            entries: [],
            isLoading: false,

            addProfitEntry: entryData => {
                const { settings } = useSettingsStore.getState();
                const newEntry = stampBusinessScope<ProfitLedgerEntry>({
                    ...entryData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    id: `PROF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                });

                set(state => ({
                    entries: [newEntry, ...state.entries].sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.PROFIT_ENTRIES, newEntry.id, newEntry);
            },

            getProfitLedger: (startDate, endDate) => {
                const { settings } = useSettingsStore.getState();
                let ledger = get().entries.filter(e => e.businessUnit === settings.businessUnit);
                if (startDate) ledger = ledger.filter(e => e.date >= startDate);
                if (endDate) ledger = ledger.filter(e => e.date <= endDate);
                return ledger;
            },

            getTotalNetProfit: (startDate, endDate) => {
                const ledger = get().getProfitLedger(startDate, endDate);
                return ledger.reduce((sum, e) => sum + e.netProfit, 0);
            },
        }),
        {
            name: 'motorway-profit-ledger',
        }
    )
);
