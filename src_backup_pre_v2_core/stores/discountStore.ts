import type { DiscountEntry, DiscountLimits, DiscountReason } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStationId } from '@/lib/authHelpers';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';
import { useSettingsStore } from './authStore';
import { stampBusinessScope } from '@/lib/businessScope';
// ============================================
// DISCOUNT MANAGEMENT STORE
// Handles discount entries, approvals, and analytics
// As per mandatory specification Section 4.1
// ============================================

interface DiscountState {
    // Data
    discountEntries: DiscountEntry[];
    discountLimits: DiscountLimits;
    isLoading: boolean;
    error: string | null;

    // Actions
    addDiscount: (
        entry: Omit<DiscountEntry, 'id' | 'timestamp' | 'approvalStatus' | 'businessUnit'>
    ) => DiscountEntry;
    approveDiscount: (
        id: string,
        approvedBy: string,
        approvedByName: string,
        note?: string
    ) => void;
    rejectDiscount: (id: string, approvedBy: string, approvedByName: string, note?: string) => void;
    updateDiscountLimits: (limits: Partial<DiscountLimits>) => void;
    deleteDiscount: (id: string) => void;

    // Getters
    getDiscountsByShift: (shiftId: string) => DiscountEntry[];
    getDiscountsByCustomer: (customerId: string) => DiscountEntry[];
    getDiscountsByDateRange: (startDate: string, endDate: string) => DiscountEntry[];
    getPendingDiscounts: () => DiscountEntry[];
    getTodayTotal: () => number;
    getMonthlyTotal: () => number;
    canAddDiscount: (amount: number) => { allowed: boolean; reason?: string };
    getDiscountAnalytics: () => DiscountAnalytics;
}

interface DiscountAnalytics {
    today: {
        count: number;
        total: number;
        byReason: Record<DiscountReason, number>;
    };
    week: {
        count: number;
        total: number;
        avgPerDay: number;
    };
    month: {
        count: number;
        total: number;
        byReason: Record<DiscountReason, number>;
        trend: number; // percentage change from last month
    };
    pendingApprovals: number;
    topCustomers: { customerId: string; customerName: string; total: number }[];
}

// Default discount limits
const DEFAULT_LIMITS: DiscountLimits = {
    dailyLimit: 10000, // PKR 10,000 per day
    monthlyLimit: 200000, // PKR 200,000 per month
    maxPerTransaction: 2000, // PKR 2,000 per transaction
    requireApprovalAbove: 500, // Require approval above PKR 500
};

export const useDiscountStore = create<DiscountState>()(
    persist(
        (set, get) => ({
            discountEntries: [],
            discountLimits: DEFAULT_LIMITS,
            isLoading: false,
            error: null,

            addDiscount: entry => {
                const { discountLimits } = get();
                const id = `disc-${Date.now()}`;

                // Determine if auto-approve or needs approval
                const needsApproval = entry.amount > discountLimits.requireApprovalAbove;

                const { settings } = useSettingsStore.getState();
                const newEntry = stampBusinessScope<DiscountEntry>({
                    ...entry,
                    id,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    timestamp: new Date().toISOString(),
                    approvalStatus: needsApproval ? 'PENDING' : 'APPROVED',
                });

                set(state => ({
                    discountEntries: [...state.discountEntries, newEntry],
                }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.DISCOUNTS, newEntry.id, newEntry);

                return newEntry;
            },

            approveDiscount: (id, approvedBy, approvedByName, note) => {
                set(state => {
                    const updatedEntries = state.discountEntries.map(entry =>
                        entry.id === id
                            ? {
                                  ...entry,
                                  approvalStatus: 'APPROVED' as const,
                                  approvedBy,
                                  approvedByName,
                                  approvalNote: note,
                              }
                            : entry
                    );
                    
                    const sid = getStationId();
                    const updatedEntry = updatedEntries.find(e => e.id === id);
                    if (sid && updatedEntry) {
                        fsSet(sid, COLLECTIONS.DISCOUNTS, id, updatedEntry);
                    }
                    
                    return { discountEntries: updatedEntries };
                });
            },

            rejectDiscount: (id, approvedBy, approvedByName, note) => {
                set(state => {
                    const updatedEntries = state.discountEntries.map(entry =>
                        entry.id === id
                            ? {
                                  ...entry,
                                  approvalStatus: 'REJECTED' as const,
                                  approvedBy,
                                  approvedByName,
                                  approvalNote: note,
                              }
                            : entry
                    );
                    
                    const sid = getStationId();
                    const updatedEntry = updatedEntries.find(e => e.id === id);
                    if (sid && updatedEntry) {
                        fsSet(sid, COLLECTIONS.DISCOUNTS, id, updatedEntry);
                    }
                    
                    return { discountEntries: updatedEntries };
                });
            },

            updateDiscountLimits: limits => {
                set(state => ({
                    discountLimits: { ...state.discountLimits, ...limits },
                }));
            },

            deleteDiscount: id => {
                set(state => ({
                    discountEntries: state.discountEntries.filter(e => e.id !== id),
                }));
            },

            getDiscountsByShift: shiftId => {
                const { settings } = useSettingsStore.getState();
                return get().discountEntries.filter(
                    e => e.shiftId === shiftId && e.businessUnit === settings.businessUnit
                );
            },

            getDiscountsByCustomer: customerId => {
                const { settings } = useSettingsStore.getState();
                return get().discountEntries.filter(
                    e => e.customerId === customerId && e.businessUnit === settings.businessUnit
                );
            },

            getDiscountsByDateRange: (startDate, endDate) => {
                const startTime = new Date(startDate).getTime();
                const endTime = new Date(endDate).getTime() + 86400000; // Include end date
                const { settings } = useSettingsStore.getState();
                return get().discountEntries.filter(e => {
                    const time = new Date(e.timestamp).getTime();
                    return (
                        time >= startTime &&
                        time < endTime &&
                        e.businessUnit === settings.businessUnit
                    );
                });
            },

            getPendingDiscounts: () => {
                const { settings } = useSettingsStore.getState();
                return get().discountEntries.filter(
                    e => e.approvalStatus === 'PENDING' && e.businessUnit === settings.businessUnit
                );
            },

            getTodayTotal: () => {
                const { settings } = useSettingsStore.getState();
                const today = new Date().toISOString().split('T')[0];
                return get()
                    .discountEntries.filter(
                        e =>
                            e.timestamp.startsWith(today) &&
                            e.approvalStatus === 'APPROVED' &&
                            e.businessUnit === settings.businessUnit
                    )
                    .reduce((sum, e) => sum + e.amount, 0);
            },

            getMonthlyTotal: () => {
                const { settings } = useSettingsStore.getState();
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                return get()
                    .discountEntries.filter(
                        e =>
                            e.timestamp >= monthStart &&
                            e.approvalStatus === 'APPROVED' &&
                            e.businessUnit === settings.businessUnit
                    )
                    .reduce((sum, e) => sum + e.amount, 0);
            },

            canAddDiscount: amount => {
                const { discountLimits, getTodayTotal, getMonthlyTotal } = get();

                // Check per-transaction limit
                if (amount > discountLimits.maxPerTransaction) {
                    return {
                        allowed: false,
                        reason: `Amount exceeds maximum per transaction (PKR ${discountLimits.maxPerTransaction})`,
                    };
                }

                // Check daily limit
                const todayTotal = getTodayTotal();
                if (todayTotal + amount > discountLimits.dailyLimit) {
                    return {
                        allowed: false,
                        reason: `Would exceed daily limit (PKR ${discountLimits.dailyLimit}). Today: PKR ${todayTotal}`,
                    };
                }

                // Check monthly limit
                const monthlyTotal = getMonthlyTotal();
                if (monthlyTotal + amount > discountLimits.monthlyLimit) {
                    return {
                        allowed: false,
                        reason: `Would exceed monthly limit (PKR ${discountLimits.monthlyLimit}). This month: PKR ${monthlyTotal}`,
                    };
                }

                return { allowed: true };
            },

            getDiscountAnalytics: () => {
                const { settings } = useSettingsStore.getState();
                const entries = get().discountEntries.filter(
                    e => e.businessUnit === settings.businessUnit
                );
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const lastMonthStart = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                ).toISOString();
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

                // Today's analytics
                const todayEntries = entries.filter(
                    e => e.timestamp.startsWith(today) && e.approvalStatus === 'APPROVED'
                );
                const todayByReason = todayEntries.reduce(
                    (acc, e) => {
                        acc[e.reason] = (acc[e.reason] || 0) + e.amount;
                        return acc;
                    },
                    {} as Record<DiscountReason, number>
                );

                // Week analytics
                const weekEntries = entries.filter(
                    e => e.timestamp >= weekAgo && e.approvalStatus === 'APPROVED'
                );

                // Month analytics
                const monthEntries = entries.filter(
                    e => e.timestamp >= monthStart && e.approvalStatus === 'APPROVED'
                );
                const monthByReason = monthEntries.reduce(
                    (acc, e) => {
                        acc[e.reason] = (acc[e.reason] || 0) + e.amount;
                        return acc;
                    },
                    {} as Record<DiscountReason, number>
                );

                // Last month for trend
                const lastMonthEntries = entries.filter(
                    e =>
                        e.timestamp >= lastMonthStart &&
                        e.timestamp < lastMonthEnd &&
                        e.approvalStatus === 'APPROVED'
                );
                const lastMonthTotal = lastMonthEntries.reduce((sum, e) => sum + e.amount, 0);
                const thisMonthTotal = monthEntries.reduce((sum, e) => sum + e.amount, 0);
                const trend =
                    lastMonthTotal > 0
                        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
                        : 0;

                // Top customers
                const customerTotals = entries
                    .filter(e => e.customerId && e.approvalStatus === 'APPROVED')
                    .reduce(
                        (acc, e) => {
                            if (!e.customerId || !e.customerName) return acc;
                            if (!acc[e.customerId]) {
                                acc[e.customerId] = {
                                    customerId: e.customerId,
                                    customerName: e.customerName,
                                    total: 0,
                                };
                            }
                            acc[e.customerId].total += e.amount;
                            return acc;
                        },
                        {} as Record<
                            string,
                            { customerId: string; customerName: string; total: number }
                        >
                    );

                const topCustomers = Object.values(customerTotals)
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5);

                return {
                    today: {
                        count: todayEntries.length,
                        total: todayEntries.reduce((sum, e) => sum + e.amount, 0),
                        byReason: todayByReason,
                    },
                    week: {
                        count: weekEntries.length,
                        total: weekEntries.reduce((sum, e) => sum + e.amount, 0),
                        avgPerDay: weekEntries.reduce((sum, e) => sum + e.amount, 0) / 7,
                    },
                    month: {
                        count: monthEntries.length,
                        total: thisMonthTotal,
                        byReason: monthByReason,
                        trend,
                    },
                    pendingApprovals: entries.filter(e => e.approvalStatus === 'PENDING').length,
                    topCustomers,
                };
            },
        }),
        {
            name: 'motorway-discounts',
            partialize: state => ({
                discountEntries: state.discountEntries.slice(-500), // Keep last 500 entries
                discountLimits: state.discountLimits,
            }),
        }
    )
);
