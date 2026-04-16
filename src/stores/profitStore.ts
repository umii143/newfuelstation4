import type { ProfitLedgerEntry } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStationId } from '@/lib/authHelpers';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';

interface ProfitState {
    entries: ProfitLedgerEntry[];
    isLoading: boolean;

    // Actions
    addProfitEntry: (entry: Omit<ProfitLedgerEntry, 'id' | 'timestamp'>) => void;
    getProfitLedger: (startDate?: string, endDate?: string) => ProfitLedgerEntry[];
    getTotalNetProfit: (startDate?: string, endDate?: string) => number;
}

export const useProfitStore = create<ProfitState>()(
    persist(
        (set, get) => ({
            entries: [],
            isLoading: false,

            addProfitEntry: entryData => {
                const newEntry: ProfitLedgerEntry = {
                    ...entryData,
                    id: `PROF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                };

                set(state => ({
                    entries: [newEntry, ...state.entries].sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.PROFIT_ENTRIES, newEntry.id, newEntry);
            },

            getProfitLedger: (startDate, endDate) => {
                let ledger = get().entries;
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
