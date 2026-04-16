// ============================================
// LEDGER STORE - Unified Accounting System
// Master Principle: Balances are CALCULATED, never stored
// ============================================

import type {
    AccountType,
    AgingBucket,
    AuditLog,
    CashAccount,
    CashLedgerEntry,
    CustomerLedgerEntry,
    Shift,
    StaffLedgerEntry,
    SupplierLedgerEntry,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSettingsStore } from './authStore';
import { useDiscountStore } from './discountStore';
import { getStationId } from '@/lib/authHelpers';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';

// ============================================
// CUSTOMER LEDGER STORE
// ============================================

interface CustomerLedgerState {
    entries: CustomerLedgerEntry[];
    isLoading: boolean;

    // Ledger Operations
    addEntry: (
        entry: Omit<CustomerLedgerEntry, 'id' | 'timestamp' | 'balance' | 'businessUnit'>
    ) => void;
    getCustomerLedger: (customerId: string, filters?: LedgerFilters) => CustomerLedgerEntry[];

    // Balance Calculations (NEVER STORED)
    getCustomerBalance: (customerId: string) => number;
    getCustomerAging: (customerId: string) => AgingBucket;

    // Bulk Operations
    postShiftCredits: (shift: Shift) => void;
    postShiftRecoveries: (shift: Shift) => void;
}

interface LedgerFilters {
    startDate?: string;
    endDate?: string;
    type?: string;
    shiftId?: string;
}

export const useCustomerLedgerStore = create<CustomerLedgerState>()(
    persist(
        (set, get) => ({
            entries: [],
            isLoading: false,

            addEntry: entryData => {
                const entries = get().entries;
                const customerEntries = entries.filter(e => e.customerId === entryData.customerId);
                const lastBalance =
                    customerEntries.length > 0
                        ? customerEntries[customerEntries.length - 1].balance
                        : 0;

                // Calculate new balance: Debits increase, Credits decrease
                const newBalance = lastBalance + entryData.debit - entryData.credit;

                const { settings } = useSettingsStore.getState();
                const newEntry: CustomerLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    id: `CLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    balance: newBalance,
                };

                set(state => ({
                    entries: [...state.entries, newEntry].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.CUSTOMER_LEDGER, newEntry.id, newEntry);
            },

            getCustomerLedger: (customerId, filters) => {
                const { settings } = useSettingsStore.getState();
                let ledger = get().entries.filter(
                    e => e.customerId === customerId && e.businessUnit === settings.businessUnit
                );

                if (filters?.startDate) {
                    ledger = ledger.filter(e => e.date >= filters.startDate!);
                }
                if (filters?.endDate) {
                    ledger = ledger.filter(e => e.date <= filters.endDate!);
                }
                if (filters?.type) {
                    ledger = ledger.filter(e => e.type === filters.type);
                }
                if (filters?.shiftId) {
                    ledger = ledger.filter(e => e.shiftId === filters.shiftId);
                }

                return ledger.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            },

            getCustomerBalance: customerId => {
                const { settings } = useSettingsStore.getState();
                const ledger = get().entries.filter(
                    e => e.customerId === customerId && e.businessUnit === settings.businessUnit
                );
                if (ledger.length === 0) return 0;

                // Sum all debits and credits
                const totalDebit = ledger.reduce((sum, e) => sum + e.debit, 0);
                const totalCredit = ledger.reduce((sum, e) => sum + e.credit, 0);

                return totalDebit - totalCredit;
            },

            getCustomerAging: customerId => {
                const { settings } = useSettingsStore.getState();
                const entries = get().entries.filter(
                    e =>
                        e.customerId === customerId &&
                        e.type === 'CREDIT_SALE' &&
                        e.businessUnit === settings.businessUnit
                );
                const now = new Date();

                const aging: AgingBucket = {
                    current: 0,
                    days30: 0,
                    days60: 0,
                    days90: 0,
                    total: 0,
                };

                entries.forEach(entry => {
                    const entryDate = new Date(entry.date);
                    const daysDiff = Math.floor(
                        (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const amount = entry.debit - entry.credit;

                    if (daysDiff <= 30) {
                        aging.current += amount;
                    } else if (daysDiff <= 60) {
                        aging.days30 += amount;
                    } else if (daysDiff <= 90) {
                        aging.days60 += amount;
                    } else {
                        aging.days90 += amount;
                    }
                });

                aging.total = aging.current + aging.days30 + aging.days60 + aging.days90;
                return aging;
            },

            postShiftCredits: shift => {
                const { addEntry } = get();

                shift.creditEntries?.forEach(credit => {
                    addEntry({
                        customerId: credit.customerId,
                        customerName: credit.customerName,
                        date: shift.date,
                        shiftId: shift.shiftId,
                        staffId: shift.staffId,
                        staffName: shift.staffName,
                        type: 'CREDIT_SALE',
                        reference: `SHIFT-${shift.shiftId}`,
                        debit: credit.amount,
                        credit: 0,
                        fuelType: credit.fuelType,
                        liters: credit.liters,
                        remarks: `Credit sale during ${shift.shiftType} shift`,
                    });
                });
            },

            postShiftRecoveries: shift => {
                const { addEntry } = get();

                shift.recoveryEntries?.forEach(recovery => {
                    addEntry({
                        customerId: recovery.customerId,
                        customerName: recovery.customerName,
                        date: shift.date,
                        shiftId: shift.shiftId,
                        staffId: shift.staffId,
                        staffName: shift.staffName,
                        type: 'RECOVERY',
                        reference: `REC-${shift.shiftId}`,
                        debit: 0,
                        credit: recovery.amount,
                        remarks: `Recovery during ${shift.shiftType} shift`,
                    });
                });
            },
        }),
        {
            name: 'motorway-customer-ledger',
            partialize: state => ({ entries: state.entries }),
        }
    )
);

// ============================================
// SUPPLIER LEDGER STORE
// ============================================

interface SupplierLedgerState {
    entries: SupplierLedgerEntry[];
    isLoading: boolean;

    addEntry: (
        entry: Omit<SupplierLedgerEntry, 'id' | 'timestamp' | 'balance' | 'businessUnit'>
    ) => void;
    getSupplierLedger: (supplierId: string, filters?: LedgerFilters) => SupplierLedgerEntry[];
    getSupplierPayable: (supplierId: string) => number;
    getSupplierAging: (supplierId: string) => AgingBucket;
    postShiftPayments: (shift: Shift) => void;
}

export const useSupplierLedgerStore = create<SupplierLedgerState>()(
    persist(
        (set, get) => ({
            entries: [],
            isLoading: false,

            addEntry: entryData => {
                const entries = get().entries;
                const supplierEntries = entries.filter(e => e.supplierId === entryData.supplierId);
                const lastBalance =
                    supplierEntries.length > 0
                        ? supplierEntries[supplierEntries.length - 1].balance
                        : 0;

                // Payable: Credits increase (purchases), Debits decrease (payments)
                const newBalance = lastBalance + entryData.credit - entryData.debit;

                const { settings } = useSettingsStore.getState();
                const newEntry: SupplierLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    id: `SLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    balance: newBalance,
                };

                set(state => ({
                    entries: [...state.entries, newEntry].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.SUPPLIER_LEDGER, newEntry.id, newEntry);
            },

            getSupplierLedger: (supplierId, filters) => {
                const { settings } = useSettingsStore.getState();
                let ledger = get().entries.filter(
                    e => e.supplierId === supplierId && e.businessUnit === settings.businessUnit
                );

                if (filters?.startDate) {
                    ledger = ledger.filter(e => e.date >= filters.startDate!);
                }
                if (filters?.endDate) {
                    ledger = ledger.filter(e => e.date <= filters.endDate!);
                }
                if (filters?.type) {
                    ledger = ledger.filter(e => e.type === filters.type);
                }

                return ledger.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            },

            getSupplierPayable: supplierId => {
                const { settings } = useSettingsStore.getState();
                const ledger = get().entries.filter(
                    e => e.supplierId === supplierId && e.businessUnit === settings.businessUnit
                );
                if (ledger.length === 0) return 0;

                const totalCredit = ledger.reduce((sum, e) => sum + e.credit, 0);
                const totalDebit = ledger.reduce((sum, e) => sum + e.debit, 0);

                return totalCredit - totalDebit;
            },

            getSupplierAging: supplierId => {
                const { settings } = useSettingsStore.getState();
                const entries = get().entries.filter(
                    e =>
                        e.supplierId === supplierId &&
                        e.type === 'PURCHASE' &&
                        e.businessUnit === settings.businessUnit
                );
                const now = new Date();

                const aging: AgingBucket = {
                    current: 0,
                    days30: 0,
                    days60: 0,
                    days90: 0,
                    total: 0,
                };

                entries.forEach(entry => {
                    const dueDate = entry.dueDate ? new Date(entry.dueDate) : new Date(entry.date);
                    const daysDiff = Math.floor(
                        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const amount = entry.credit - entry.debit;

                    if (daysDiff <= 30) {
                        aging.current += amount;
                    } else if (daysDiff <= 60) {
                        aging.days30 += amount;
                    } else if (daysDiff <= 90) {
                        aging.days60 += amount;
                    } else {
                        aging.days90 += amount;
                    }
                });

                aging.total = aging.current + aging.days30 + aging.days60 + aging.days90;
                return aging;
            },

            postShiftPayments: shift => {
                const { addEntry } = get();

                shift.supplierPaymentEntries?.forEach(payment => {
                    addEntry({
                        supplierId: payment.supplierId,
                        supplierName: payment.supplierName,
                        date: shift.date,
                        shiftId: shift.shiftId,
                        staffId: shift.staffId,
                        staffName: shift.staffName,
                        type: 'PAYMENT',
                        reference: `PAY-${shift.shiftId}`,
                        debit: payment.amount,
                        credit: 0,
                        paymentRef: `SHIFT-${shift.shiftId}`,
                        remarks: `Payment during ${shift.shiftType} shift`,
                    });
                });
            },
        }),
        {
            name: 'motorway-supplier-ledger',
            partialize: state => ({ entries: state.entries }),
        }
    )
);

// ============================================
// CASH & BANK LEDGER STORE
// ============================================

interface CashBankState {
    accounts: CashAccount[];
    entries: CashLedgerEntry[];
    isLoading: boolean;

    // Account Operations
    addAccount: (account: Omit<CashAccount, 'accountId' | 'createdAt'>) => void;
    getAccounts: (type?: AccountType) => CashAccount[];

    // Ledger Operations
    addEntry: (
        entry: Omit<CashLedgerEntry, 'id' | 'timestamp' | 'balance' | 'businessUnit'>
    ) => void;
    getAccountLedger: (accountId: string, filters?: LedgerFilters) => CashLedgerEntry[];
    getAccountBalance: (accountId: string) => number;

    // Transfers
    transfer: (
        fromAccountId: string,
        toAccountId: string,
        amount: number,
        shiftId: string,
        staffId: string,
        staffName: string,
        reference: string
    ) => void;

    // Shift Sync
    postShiftExpenses: (shift: Shift) => void;
    postShiftDeposits: (shift: Shift) => void;
    postShiftDigitalCash: (shift: Shift) => void;
}

export const useCashBankStore = create<CashBankState>()(
    persist(
        (set, get) => ({
            accounts: [],
            entries: [],
            isLoading: false,

            addAccount: accountData => {
                const newAccount: CashAccount = {
                    ...accountData,
                    accountId: `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    createdAt: new Date().toISOString(),
                };

                set(state => ({
                    accounts: [...state.accounts, newAccount],
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.CASH_BANK, newAccount.accountId, newAccount);
            },

            getAccounts: type => {
                const accounts = get().accounts;
                if (type) {
                    return accounts.filter(a => a.type === type);
                }
                return accounts;
            },

            addEntry: entryData => {
                const entries = get().entries;
                const accountEntries = entries.filter(e => e.accountId === entryData.accountId);
                const lastBalance =
                    accountEntries.length > 0
                        ? accountEntries[accountEntries.length - 1].balance
                        : get().accounts.find(a => a.accountId === entryData.accountId)
                              ?.openingBalance || 0;

                // Cash balance: Credits increase, Debits decrease
                const newBalance = lastBalance + entryData.credit - entryData.debit;

                const { settings } = useSettingsStore.getState();
                const newEntry: CashLedgerEntry = {
                    ...entryData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    id: `CASHLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    balance: newBalance,
                };

                set(state => ({
                    entries: [...state.entries, newEntry].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.CASH_LEDGER, newEntry.id, newEntry);
            },

            getAccountLedger: (accountId, filters) => {
                const { settings } = useSettingsStore.getState();
                let ledger = get().entries.filter(
                    e => e.accountId === accountId && e.businessUnit === settings.businessUnit
                );

                if (filters?.startDate) {
                    ledger = ledger.filter(e => e.date >= filters.startDate!);
                }
                if (filters?.endDate) {
                    ledger = ledger.filter(e => e.date <= filters.endDate!);
                }
                if (filters?.type) {
                    ledger = ledger.filter(e => e.type === filters.type);
                }

                return ledger.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            },

            getAccountBalance: accountId => {
                const { settings } = useSettingsStore.getState();
                const account = get().accounts.find(a => a.accountId === accountId);
                const entries = get().entries.filter(
                    e => e.accountId === accountId && e.businessUnit === settings.businessUnit
                );

                const openingBalance = account?.openingBalance || 0;
                const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
                const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);

                return openingBalance + totalCredit - totalDebit;
            },

            transfer: (
                fromAccountId,
                toAccountId,
                amount,
                shiftId,
                staffId,
                staffName,
                reference
            ) => {
                const { addEntry, accounts } = get();
                const fromAccount = accounts.find(a => a.accountId === fromAccountId);
                const toAccount = accounts.find(a => a.accountId === toAccountId);

                if (!fromAccount || !toAccount) return;

                // Debit from source
                addEntry({
                    accountId: fromAccountId,
                    accountName: fromAccount.name,
                    date: new Date().toISOString().split('T')[0],
                    shiftId,
                    staffId,
                    staffName,
                    type: 'TRANSFER',
                    reference,
                    debit: amount,
                    credit: 0,
                    counterpartyType: 'TRANSFER',
                    counterpartyName: toAccount.name,
                    transferAccountId: toAccountId,
                    remarks: `Transfer to ${toAccount.name}`,
                });

                // Credit to destination
                addEntry({
                    accountId: toAccountId,
                    accountName: toAccount.name,
                    date: new Date().toISOString().split('T')[0],
                    shiftId,
                    staffId,
                    staffName,
                    type: 'TRANSFER',
                    reference,
                    debit: 0,
                    credit: amount,
                    counterpartyType: 'TRANSFER',
                    counterpartyName: fromAccount.name,
                    transferAccountId: fromAccountId,
                    remarks: `Transfer from ${fromAccount.name}`,
                });
            },

            postShiftExpenses: shift => {
                const { addEntry, accounts } = get();
                const cashAccount = accounts.find(a => a.type === 'CASH');

                if (!cashAccount) return;

                shift.expenseEntries?.forEach(expense => {
                    addEntry({
                        accountId: cashAccount.accountId,
                        accountName: cashAccount.name,
                        date: shift.date,
                        shiftId: shift.shiftId,
                        staffId: shift.staffId,
                        staffName: shift.staffName,
                        type: 'EXPENSE',
                        reference: `EXP-${expense.id}`,
                        debit: expense.amount,
                        credit: 0,
                        counterpartyType: 'EXPENSE',
                        counterpartyName: expense.category,
                        remarks: expense.note || `${expense.category} expense`,
                    });
                });
            },

            postShiftDeposits: shift => {
                const { transfer, accounts } = get();
                const cashAccount = accounts.find(a => a.type === 'CASH');

                shift.bankDepositEntries?.forEach(deposit => {
                    const bankAccount = accounts.find(
                        a =>
                            a.type === 'BANK' &&
                            a.bankName?.toLowerCase().includes(deposit.bankName.toLowerCase())
                    );

                    if (cashAccount && bankAccount) {
                        transfer(
                            cashAccount.accountId,
                            bankAccount.accountId,
                            deposit.amount,
                            shift.shiftId,
                            shift.staffId,
                            shift.staffName,
                            `DEP-${deposit.depositSlipNumber || deposit.id}`
                        );
                    }
                });
            },

            postShiftDigitalCash: shift => {
                const { addEntry, accounts } = get();

                shift.digitalCashEntries?.forEach(digital => {
                    const walletAccount = accounts.find(
                        a => a.type === 'DIGITAL_WALLET' && a.walletProvider === digital.method
                    );

                    if (walletAccount) {
                        addEntry({
                            accountId: walletAccount.accountId,
                            accountName: walletAccount.name,
                            date: shift.date,
                            shiftId: shift.shiftId,
                            staffId: shift.staffId,
                            staffName: shift.staffName,
                            type: 'RECEIPT',
                            reference: digital.reference || `DIG-${digital.id}`,
                            debit: 0,
                            credit: digital.amount,
                            remarks: `${digital.method} payment received`,
                        });
                    }
                });
            },
        }),
        {
            name: 'motorway-cash-bank',
            partialize: state => ({ accounts: state.accounts, entries: state.entries }),
        }
    )
);

// ============================================
// UNIFIED SHIFT SYNC FUNCTION
// ============================================

export const postShiftToAllLedgers = (shift: Shift) => {
    const customerLedger = useCustomerLedgerStore.getState();
    const supplierLedger = useSupplierLedgerStore.getState();
    const cashBank = useCashBankStore.getState();

    // Post customer credits
    customerLedger.postShiftCredits(shift);

    // Post customer recoveries
    customerLedger.postShiftRecoveries(shift);

    // Post supplier payments
    supplierLedger.postShiftPayments(shift);

    // Post expenses to cash ledger
    cashBank.postShiftExpenses(shift);

    // Post bank deposits
    cashBank.postShiftDeposits(shift);

    // Post digital cash
    cashBank.postShiftDigitalCash(shift);

    // Post discounts
    const discountStore = useDiscountStore.getState();
    shift.discountEntries?.forEach(discount => {
        discountStore.addDiscount({
            ...discount,
            businessUnit: shift.businessUnit,
        });
    });

    // Post staff shift earnings
    const staffLedger = useStaffLedgerStore.getState();
    staffLedger.postShiftEarnings(shift);
    staffLedger.postShiftAdvances(shift);
};

// ============================================
// STAFF LEDGER STORE (New)
// ============================================

interface StaffLedgerState {
    entries: StaffLedgerEntry[];
    isLoading: boolean;

    addEntry: (entry: Omit<StaffLedgerEntry, 'id' | 'timestamp' | 'balance'>) => void;
    getStaffLedger: (userId: string, filters?: LedgerFilters) => StaffLedgerEntry[];
    getStaffBalance: (userId: string) => number;
    postShiftEarnings: (shift: Shift) => void;
    postShiftAdvances: (shift: Shift) => void;
}

export const useStaffLedgerStore = create<StaffLedgerState>()(
    persist(
        (set, get) => ({
            entries: [],
            isLoading: false,

            addEntry: (entryData: Omit<StaffLedgerEntry, 'id' | 'timestamp' | 'balance'>) => {
                const entries = get().entries;
                const staffEntries = entries.filter(e => e.userId === entryData.userId);
                const lastBalance =
                    staffEntries.length > 0 ? staffEntries[staffEntries.length - 1].balance : 0;

                // For Staff: Debit = Payment to staff, Credit = Earning (Station owes staff).
                // Balance = Earning - Payment.
                const newBalance = lastBalance + entryData.credit - entryData.debit;

                const newEntry: StaffLedgerEntry = {
                    ...entryData,
                    id: `STFLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    balance: newBalance,
                };

                set(state => ({
                    entries: [...state.entries, newEntry].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ),
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.STAFF_LEDGER, newEntry.id, newEntry);
            },

            getStaffLedger: (userId: string, filters?: LedgerFilters) => {
                let ledger = get().entries.filter(e => e.userId === userId);
                if (filters?.startDate) ledger = ledger.filter(e => e.date >= filters.startDate!);
                if (filters?.endDate) ledger = ledger.filter(e => e.date <= filters.endDate!);
                if (filters?.type) ledger = ledger.filter(e => e.type === filters.type);

                return ledger.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            },

            getStaffBalance: (userId: string) => {
                const entries = get().entries.filter(e => e.userId === userId);
                if (entries.length === 0) return 0;
                const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
                const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
                return totalCredit - totalDebit;
            },

            postShiftEarnings: (shift: Shift) => {
                // Determine earning amount if needed (can be based on settings or shift type)
                get().addEntry({
                    userId: shift.staffId,
                    userName: shift.staffName,
                    date: shift.date,
                    type: 'SHIFT_EARNING',
                    amount: 0, // In this model, earning is tracked by Station oweing staff
                    debit: 0,
                    credit: 0, // Can be set based on per-shift pay
                    note: `Shift work recorded for Shift #${shift.shiftId} (${shift.shiftType})`,
                    createdBy: 'SYSTEM',
                    reference: shift.shiftId,
                });
            },

            postShiftAdvances: (shift: Shift) => {
                const shiftAdvances =
                    shift.transactions?.filter(t => t.type === 'STAFF_ADVANCE') || [];

                shiftAdvances.forEach(adv => {
                    get().addEntry({
                        userId: shift.staffId, // Use shift staff or lookup if tx has staffId
                        userName: shift.staffName,
                        date: shift.date,
                        type: 'ADVANCE',
                        amount: adv.amount,
                        debit: adv.amount, // Advance is a payment to staff (debit)
                        credit: 0,
                        note: adv.description || `Shift Advance during ${shift.shiftType}`,
                        createdBy: 'SYSTEM',
                        reference: shift.shiftId,
                    });
                });
            },
        }),
        {
            name: 'motorway-staff-ledger',
            partialize: state => ({ entries: state.entries }),
        }
    )
);

// ============================================
// AUDIT LOG STORE (New)
// ============================================

interface AuditState {
    logs: AuditLog[];
    isLoading: boolean;
    addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
    persist(
        set => ({
            logs: [],
            isLoading: false,

            addLog: (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
                const newLog: AuditLog = {
                    ...logData,
                    id: `AUD-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                };
                set(state => ({ logs: [newLog, ...state.logs] }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.AUDIT_LOGS, newLog.id, newLog);
            },

            clearLogs: () => set({ logs: [] }),
        }),
        {
            name: 'motorway-audit-logs',
        }
    )
);
