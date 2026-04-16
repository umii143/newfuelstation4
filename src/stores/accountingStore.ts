import type {
    CashAccount,
    CashLedgerEntry,
    CustomerLedgerEntry,
    SupplierLedgerEntry,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSettingsStore } from './authStore';

interface AccountingState {
    // Accounts
    accounts: CashAccount[];

    // Ledgers
    customerLedger: CustomerLedgerEntry[];
    supplierLedger: SupplierLedgerEntry[];
    cashLedger: CashLedgerEntry[];

    // Actions
    addAccount: (account: Omit<CashAccount, 'accountId' | 'createdAt'>) => void;
    updateAccount: (accountId: string, updates: Partial<CashAccount>) => void;

    // Ledger Posting Actions
    postCustomerTransaction: (
        entry: Omit<CustomerLedgerEntry, 'id' | 'balance' | 'timestamp' | 'businessUnit'>
    ) => void;
    postSupplierTransaction: (
        entry: Omit<SupplierLedgerEntry, 'id' | 'balance' | 'timestamp' | 'businessUnit'>
    ) => void;
    postCashTransaction: (
        entry: Omit<CashLedgerEntry, 'id' | 'balance' | 'timestamp' | 'businessUnit'>
    ) => void;

    // Getters/Calculations
    getCustomerBalance: (customerId: string) => number;
    getSupplierBalance: (supplierId: string) => number;
    getAccountBalance: (accountId: string) => number;
    getCustomerLedger: (customerId: string) => CustomerLedgerEntry[];
    getSupplierLedger: (supplierId: string) => SupplierLedgerEntry[];
    getAccountLedger: (accountId: string) => CashLedgerEntry[];
}

export const useAccountingStore = create<AccountingState>()(
    persist(
        (set, get) => ({
            accounts: [],
            customerLedger: [],
            supplierLedger: [],
            cashLedger: [],

            addAccount: accountData => {
                const account: CashAccount = {
                    ...accountData,
                    accountId: `ACC-${String(get().accounts.length + 1).padStart(3, '0')}`,
                    createdAt: new Date().toISOString(),
                };
                set(state => ({ accounts: [...state.accounts, account] }));
            },

            updateAccount: (accountId, updates) => {
                set(state => ({
                    accounts: state.accounts.map(acc =>
                        acc.accountId === accountId ? { ...acc, ...updates } : acc
                    ),
                }));
            },

            postCustomerTransaction: entryData => {
                const { customerLedger } = get();
                const ledger = customerLedger.filter(e => e.customerId === entryData.customerId);
                const currentBalance = ledger.length > 0 ? ledger[0].balance : 0;

                const newBalance = currentBalance + (entryData.debit - entryData.credit);

                const { settings } = useSettingsStore.getState();
                const entry: CustomerLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as any,
                    id: `CLE-${Date.now()}`,
                    balance: newBalance,
                    timestamp: new Date().toISOString(),
                };

                set(state => ({
                    customerLedger: [entry, ...state.customerLedger],
                }));
            },

            postSupplierTransaction: entryData => {
                const { supplierLedger } = get();
                const ledger = supplierLedger.filter(e => e.supplierId === entryData.supplierId);
                const currentBalance = ledger.length > 0 ? ledger[0].balance : 0;

                const newBalance = currentBalance + (entryData.credit - entryData.debit);

                const { settings } = useSettingsStore.getState();
                const entry: SupplierLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as any,
                    id: `SLE-${Date.now()}`,
                    balance: newBalance,
                    timestamp: new Date().toISOString(),
                };

                set(state => ({
                    supplierLedger: [entry, ...state.supplierLedger],
                }));
            },

            postCashTransaction: entryData => {
                const { cashLedger } = get();
                const ledger = cashLedger.filter(e => e.accountId === entryData.accountId);
                const currentAccount = get().accounts.find(
                    a => a.accountId === entryData.accountId
                );
                const currentBalance =
                    ledger.length > 0 ? ledger[0].balance : currentAccount?.openingBalance || 0;

                // Debit = In, Credit = Out for Cash/Asset accounts in this simplified logic
                const newBalance = currentBalance + (entryData.debit - entryData.credit);

                const { settings } = useSettingsStore.getState();
                const entry: CashLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as any,
                    id: `CALE-${Date.now()}`,
                    balance: newBalance,
                    timestamp: new Date().toISOString(),
                };

                set(state => ({
                    cashLedger: [entry, ...state.cashLedger],
                }));
            },

            getCustomerBalance: customerId => {
                const { settings } = useSettingsStore.getState();
                const ledger = get().customerLedger.filter(
                    e => e.customerId === customerId && e.businessUnit === settings.businessUnit
                );
                return ledger.length > 0 ? ledger[0].balance : 0;
            },

            getSupplierBalance: supplierId => {
                const { settings } = useSettingsStore.getState();
                const ledger = get().supplierLedger.filter(
                    e => e.supplierId === supplierId && e.businessUnit === settings.businessUnit
                );
                return ledger.length > 0 ? ledger[0].balance : 0;
            },

            getAccountBalance: accountId => {
                const { settings } = useSettingsStore.getState();
                const ledger = get().cashLedger.filter(
                    e => e.accountId === accountId && e.businessUnit === settings.businessUnit
                );
                if (ledger.length > 0) return ledger[0].balance;

                const account = get().accounts.find(a => a.accountId === accountId);
                return account?.openingBalance || 0;
            },

            getCustomerLedger: customerId => {
                const { settings } = useSettingsStore.getState();
                return get().customerLedger.filter(
                    e => e.customerId === customerId && e.businessUnit === settings.businessUnit
                );
            },

            getSupplierLedger: supplierId => {
                const { settings } = useSettingsStore.getState();
                return get().supplierLedger.filter(
                    e => e.supplierId === supplierId && e.businessUnit === settings.businessUnit
                );
            },

            getAccountLedger: accountId => {
                const { settings } = useSettingsStore.getState();
                return get().cashLedger.filter(
                    e => e.accountId === accountId && e.businessUnit === settings.businessUnit
                );
            },
        }),
        {
            name: 'motorway-accounting',
        }
    )
);
