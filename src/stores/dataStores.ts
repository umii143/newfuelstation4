import type {
    Attendance,
    Customer,
    CustomerTransaction,
    PurchaseOrder,
    Supplier,
    User,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSettingsStore } from './authStore';
import { getStationId } from '@/lib/authHelpers';
import { useCustomerLedgerStore, useSupplierLedgerStore } from './ledgerStore';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';

// Customer Store
interface CustomerState {
    customers: Customer[];
    transactions: CustomerTransaction[];
    isLoading: boolean;
    error: string | null;

    fetchCustomers: () => Promise<void>;
    addCustomer: (
        customer: Omit<Customer, 'customerId' | 'createdAt' | 'currentBalance'>
    ) => Promise<void>;
    updateCustomer: (customerId: string, updates: Partial<Customer>) => Promise<void>;
    recordPayment: (
        customerId: string,
        amount: number,
        method: string,
        createdBy: string
    ) => Promise<void>;
    recordCreditSale: (
        customerId: string,
        amount: number,
        saleId: string,
        createdBy: string
    ) => Promise<void>;
    getCustomerBalance: (customerId: string) => number;
    getAvailableCredit: (customerId: string) => number;
    canMakeCreditSale: (customerId: string, amount: number) => boolean;
    getFilteredCustomers: () => Customer[];
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set, get) => ({
            customers: [],
            transactions: [],
            isLoading: false,
            error: null,

            fetchCustomers: async () => {
                set({ isLoading: false, error: null });
            },

            addCustomer: async customerData => {
                set({ isLoading: true, error: null });
                try {
                    const customerId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const newCustomer: Customer = {
                        ...customerData,
                        customerId,
                        createdAt: new Date().toISOString(),
                        currentBalance: 0,
                    } as Customer;

                    const { addEntry: addLedgerEntry } = useCustomerLedgerStore.getState();
                    addLedgerEntry({
                        customerId: newCustomer.customerId,
                        customerName: newCustomer.name,
                        date: new Date().toISOString().split('T')[0],
                        type: 'OPENING_BALANCE',
                        debit: 0,
                        credit: 0,
                        remarks: 'Account initialized',
                        shiftId: 'SYSTEM',
                        staffId: 'SYSTEM',
                        staffName: 'MANAGER',
                        reference: `INIT-${newCustomer.customerId}`,
                    });

                    set(state => ({
                        customers: [...state.customers, newCustomer],
                        isLoading: false,
                    }));
                    
                    const sid = getStationId();
                    if (sid) fsSet(sid, COLLECTIONS.CUSTOMERS, newCustomer.customerId, newCustomer);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateCustomer: async (customerId, updates) => {
                set({ isLoading: true });
                set(state => {
                    const updatedCustomers = state.customers.map(c =>
                        c.customerId === customerId ? { ...c, ...updates } : c
                    );
                    
                    const sid = getStationId();
                    const updatedCustomer = updatedCustomers.find(c => c.customerId === customerId);
                    if (sid && updatedCustomer) {
                        fsSet(sid, COLLECTIONS.CUSTOMERS, customerId, updatedCustomer);
                    }
                    
                    return {
                        customers: updatedCustomers,
                        isLoading: false,
                    };
                });
            },

            recordPayment: async (customerId, amount, _method, _createdBy) => {
                set({ isLoading: true });
                set(state => {
                    const updatedCustomers = state.customers.map(c =>
                        c.customerId === customerId
                            ? { ...c, currentBalance: (c.currentBalance || 0) - amount }
                            : c
                    );
                    
                    const sid = getStationId();
                    const updatedCustomer = updatedCustomers.find(c => c.customerId === customerId);
                    if (sid && updatedCustomer) {
                        fsSet(sid, COLLECTIONS.CUSTOMERS, customerId, updatedCustomer);
                    }
                    
                    return {
                        customers: updatedCustomers,
                        isLoading: false,
                    };
                });
            },

            recordCreditSale: async (customerId, amount, _saleId, _createdBy) => {
                set({ isLoading: true });
                set(state => {
                    const updatedCustomers = state.customers.map(c =>
                        c.customerId === customerId
                            ? { ...c, currentBalance: (c.currentBalance || 0) + amount }
                            : c
                    );
                    
                    const sid = getStationId();
                    const updatedCustomer = updatedCustomers.find(c => c.customerId === customerId);
                    if (sid && updatedCustomer) {
                        fsSet(sid, COLLECTIONS.CUSTOMERS, customerId, updatedCustomer);
                    }
                    
                    return {
                        customers: updatedCustomers,
                        isLoading: false,
                    };
                });
            },

            getCustomerBalance: customerId => {
                const customer = get().customers.find(c => c.customerId === customerId);
                return customer?.currentBalance || 0;
            },

            getAvailableCredit: customerId => {
                const customer = get().customers.find(c => c.customerId === customerId);
                if (!customer) return 0;
                return customer.creditLimit - (customer.currentBalance || 0);
            },

            canMakeCreditSale: (customerId, amount) => {
                const availableCredit = get().getAvailableCredit(customerId);
                return availableCredit >= amount;
            },

            getFilteredCustomers: () => {
                const { settings } = useSettingsStore.getState();
                return get().customers.filter(c => c.businessUnit === settings.businessUnit);
            },
        }),
        {
            name: 'motorway-customer-store',
            partialize: state => ({ customers: state.customers, transactions: state.transactions }),
        }
    )
);

// Supplier Store
interface SupplierState {
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    isLoading: boolean;
    error: string | null;

    fetchSuppliers: () => Promise<void>;
    addSupplier: (
        supplier: Omit<Supplier, 'supplierId' | 'createdAt' | 'currentPayable'>
    ) => Promise<void>;
    updateSupplier: (supplierId: string, updates: Partial<Supplier>) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    recordPayment: (supplierId: string, amount: number) => Promise<void>;
    createPurchaseOrder: (po: Omit<PurchaseOrder, 'poId' | 'createdAt'>) => Promise<void>;
    getFilteredSuppliers: () => Supplier[];
}

export const useSupplierStore = create<SupplierState>()(
    persist(
        (set, get) => ({
            suppliers: [],
            purchaseOrders: [],
            isLoading: false,
            error: null,

            fetchSuppliers: async () => {
                set({ isLoading: false, error: null });
            },

            addSupplier: async supplierData => {
                set({ isLoading: true, error: null });
                try {
                    const supplierId = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const newSupplier: Supplier = {
                        ...supplierData,
                        supplierId,
                        createdAt: new Date().toISOString(),
                        currentPayable: 0,
                    } as Supplier;

                    const { addEntry: addLedgerEntry } = useSupplierLedgerStore.getState();
                    addLedgerEntry({
                        supplierId: newSupplier.supplierId,
                        supplierName: newSupplier.name,
                        date: new Date().toISOString().split('T')[0],
                        type: 'OPENING_BALANCE',
                        debit: 0,
                        credit: 0,
                        remarks: 'Account initialized',
                        shiftId: 'SYSTEM',
                        staffId: 'SYSTEM',
                        staffName: 'MANAGER',
                        reference: `INIT-${newSupplier.supplierId}`,
                    });

                    set(state => ({
                        suppliers: [...state.suppliers, newSupplier],
                        isLoading: false,
                    }));
                    
                    const sid = getStationId();
                    if (sid) fsSet(sid, COLLECTIONS.SUPPLIERS, newSupplier.supplierId, newSupplier);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateSupplier: async (supplierId, updates) => {
                set({ isLoading: true });
                set(state => {
                    const updatedSuppliers = state.suppliers.map(s =>
                        s.supplierId === supplierId ? { ...s, ...updates } : s
                    );
                    
                    const sid = getStationId();
                    const updatedSupplier = updatedSuppliers.find(s => s.supplierId === supplierId);
                    if (sid && updatedSupplier) {
                        fsSet(sid, COLLECTIONS.SUPPLIERS, supplierId, updatedSupplier);
                    }
                    
                    return {
                        suppliers: updatedSuppliers,
                        isLoading: false,
                    };
                });
            },

            deleteSupplier: async supplierId => {
                set({ isLoading: true });
                set(state => ({
                    suppliers: state.suppliers.filter(s => s.supplierId !== supplierId),
                    isLoading: false,
                }));
            },

            recordPayment: async (supplierId, amount) => {
                set({ isLoading: true });
                set(state => {
                    const updatedSuppliers = state.suppliers.map(s =>
                        s.supplierId === supplierId
                            ? { ...s, currentPayable: (s.currentPayable || 0) - amount }
                            : s
                    );
                    
                    const sid = getStationId();
                    const updatedSupplier = updatedSuppliers.find(s => s.supplierId === supplierId);
                    if (sid && updatedSupplier) {
                        fsSet(sid, COLLECTIONS.SUPPLIERS, supplierId, updatedSupplier);
                    }
                    
                    return {
                        suppliers: updatedSuppliers,
                        isLoading: false,
                    };
                });
            },

            createPurchaseOrder: async poData => {
                set({ isLoading: true });
                set(state => ({
                    purchaseOrders: [
                        {
                            ...poData,
                            poId: `PO-${Date.now()}`,
                            createdAt: new Date().toISOString(),
                        } as any,
                        ...state.purchaseOrders,
                    ],
                    isLoading: false,
                }));
            },

            getFilteredSuppliers: () => {
                const { settings } = useSettingsStore.getState();
                return get().suppliers.filter(
                    s => s.businessUnit === (settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG')
                );
            },
        }),
        {
            name: 'motorway-supplier-store',
            partialize: state => ({
                suppliers: state.suppliers,
                purchaseOrders: state.purchaseOrders,
            }),
        }
    )
);

// Staff Store
interface StaffState {
    users: User[];
    attendance: Attendance[];
    isLoading: boolean;
    error: string | null;

    fetchStaff: () => Promise<void>;
    fetchAttendance: (filters: any) => Promise<void>;
    getActiveStaff: () => User[];
    getStaffByRole: (role: string) => User[];
    addStaff: (staff: Omit<User, 'userId' | 'createdAt'>) => Promise<void>;
    updateStaff: (userId: string, updates: Partial<User>) => Promise<void>;
    deleteStaff: (userId: string) => Promise<void>;
    recordClockIn: (userId: string) => Promise<void>;
    recordClockOut: (userId: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>()(
    persist(
        (set, get) => ({
            users: [],
            attendance: [],
            isLoading: false,
            error: null,

            fetchStaff: async () => {
                set({ isLoading: false, error: null });
            },

            fetchAttendance: async (_filters: any) => {
                set({ isLoading: false, error: null });
            },

            getActiveStaff: () => {
                const { settings } = useSettingsStore.getState();
                return get().users.filter(
                    u => u.status === 'ACTIVE' && u.businessUnit === settings.businessUnit
                );
            },

            getStaffByRole: role => {
                const { settings } = useSettingsStore.getState();
                return get().users.filter(
                    u =>
                        u.role === role &&
                        u.status === 'ACTIVE' &&
                        u.businessUnit === settings.businessUnit
                );
            },

            addStaff: async staffData => {
                set({ isLoading: true, error: null });
                try {
                    const { settings } = useSettingsStore.getState();
                    const userId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const newUser: User = {
                        ...staffData,
                        userId,
                        createdAt: new Date().toISOString(),
                        businessUnit: settings.businessUnit,
                        status: 'ACTIVE',
                    } as User;

                    set(state => ({ users: [...state.users, newUser], isLoading: false }));
                    
                    const sid = getStationId();
                    if (sid) fsSet(sid, COLLECTIONS.STAFF, newUser.userId, newUser);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            updateStaff: async (userId, updates) => {
                set({ isLoading: true });
                set(state => {
                    const updatedUsers = state.users.map(u =>
                        u.userId === userId ? { ...u, ...updates } : u
                    );
                    
                    const sid = getStationId();
                    const updatedUser = updatedUsers.find(u => u.userId === userId);
                    if (sid && updatedUser) {
                        fsSet(sid, COLLECTIONS.STAFF, userId, updatedUser);
                    }
                    
                    return {
                        users: updatedUsers,
                        isLoading: false,
                    };
                });
            },

            deleteStaff: async userId => {
                set({ isLoading: true });
                set(state => ({
                    users: state.users.filter(u => u.userId !== userId),
                    isLoading: false,
                }));
            },

            recordClockIn: async userId => {
                const { settings } = useSettingsStore.getState();

                set({ isLoading: true });
                const newAttendance: Attendance = {
                    attendanceId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    userName: get().users.find(u => u.userId === userId)?.name || 'Unknown',
                    stationId: getStationId(),
                    date: new Date().toISOString().split('T')[0],
                    clockIn: new Date().toISOString(),
                    status: 'PRESENT' as Attendance['status'],
                    totalHours: 0,
                    overtimeHours: 0,
                    businessUnit: settings.businessUnit,
                } as Attendance;

                set(state => ({
                    attendance: [newAttendance, ...state.attendance],
                    isLoading: false,
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.ATTENDANCE, newAttendance.attendanceId, newAttendance);
            },

            recordClockOut: async userId => {
                const records = get().attendance;
                const activeRecord = records.find(r => r.userId === userId && !r.clockOut);
                if (!activeRecord) return;

                set({ isLoading: true });
                const clockOutTime = new Date().toISOString();
                const clockInTime = new Date(activeRecord.clockIn ?? new Date().toISOString());
                const totalMs = new Date(clockOutTime).getTime() - clockInTime.getTime();
                const totalHours = totalMs / (1000 * 60 * 60);

                set(state => {
                    const updatedAttendance = state.attendance.map(r =>
                        r.attendanceId === activeRecord.attendanceId
                            ? { ...r, clockOut: clockOutTime, totalHours }
                            : r
                    );
                    
                    const sid = getStationId();
                    const updatedRecord = updatedAttendance.find(r => r.attendanceId === activeRecord.attendanceId);
                    if (sid && updatedRecord) {
                        fsSet(sid, COLLECTIONS.ATTENDANCE, updatedRecord.attendanceId, updatedRecord);
                    }
                    
                    return {
                        attendance: updatedAttendance,
                        isLoading: false,
                    };
                });
            },
        }),
        {
            name: 'motorway-staff-store',
            partialize: state => ({ users: state.users, attendance: state.attendance }),
        }
    )
);

// ============================================
// EXPENSE STORE
// ============================================

interface Expense {
    id: string;
    stationId: string;
    expenseId: string;
    category: string;
    amount: number;
    description: string | null;
    paymentMethod: string | null;
    paidTo: string | null;
    expenseDate: string;
    approvedById: string | null;
    createdAt: string;
}

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;

    fetchExpenses: (filters?: any) => Promise<void>;
    addExpense: (data: Omit<Expense, 'id' | 'stationId' | 'createdAt'>) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>()(
    persist(
        (set) => ({
            expenses: [],
            isLoading: false,
            error: null,

            fetchExpenses: async _filters => {
                set({ isLoading: false, error: null });
            },

            addExpense: async expenseData => {
                set({ isLoading: true });
                try {
                    const newExpense: Expense = {
                        ...expenseData,
                        id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        stationId: 'STN-001',
                        createdAt: new Date().toISOString(),
                    } as Expense;

                    set(state => ({ expenses: [newExpense, ...state.expenses], isLoading: false }));
                    
                    const sid = getStationId();
                    if (sid) fsSet(sid, COLLECTIONS.EXPENSES, newExpense.id, newExpense);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            deleteExpense: async expenseId => {
                set({ isLoading: true });
                set(state => ({
                    expenses: state.expenses.filter(e => e.id !== expenseId),
                    isLoading: false,
                }));
                
                const sid = getStationId();
                if (sid) {
                    import('@/services/firestoreService').then(({ fsDelete }) => {
                        fsDelete(sid, COLLECTIONS.EXPENSES, expenseId);
                    });
                }
            },
        }),
        {
            name: 'motorway-expense-store',
            partialize: state => ({ expenses: state.expenses }),
        }
    )
);

// Sync Store
interface SyncState {
    lastSync: string | null;
    isSyncing: boolean;
    syncAll: () => Promise<void>;
}

export const useSyncStore = create<SyncState>(set => ({
    lastSync: null,
    isSyncing: false,
    syncAll: async () => {
        set({ isSyncing: true });
        // Local state doesn't need external sync
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ lastSync: new Date().toISOString(), isSyncing: false });
    },
}));
