import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/stores/authStore';
import { useDiscountStore } from '@/stores/discountStore';
import type { DiscountEntry, DiscountReason } from '@/types';
import clsx from 'clsx';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    Filter,
    Percent,
    Plus,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

// ============================================
// DISCOUNT MANAGEMENT PAGE
// As per mandatory specification Section 4.1
// ============================================

const DISCOUNT_REASONS: { value: DiscountReason; label: string; color: string }[] = [
    { value: 'REGULAR_CUSTOMER', label: 'Regular Customer', color: 'emerald' },
    { value: 'BULK_PURCHASE', label: 'Bulk Purchase', color: 'blue' },
    { value: 'PROMOTIONAL', label: 'Promotional', color: 'purple' },
    { value: 'MANAGER_APPROVAL', label: 'Manager Approval', color: 'amber' },
    { value: 'LOYALTY_PROGRAM', label: 'Loyalty Program', color: 'cyan' },
    { value: 'PRICE_MATCH', label: 'Price Match', color: 'rose' },
    { value: 'OTHER', label: 'Other', color: 'gray' },
];

export const DiscountsPage: React.FC = () => {
    const {
        discountEntries,
        discountLimits,
        addDiscount,
        approveDiscount,
        rejectDiscount,
        getPendingDiscounts,
        getTodayTotal,
        getMonthlyTotal,
        canAddDiscount,
        getDiscountAnalytics,
    } = useDiscountStore();

    const { user } = useAuthStore();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'history' | 'settings'>(
        'overview'
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterReason, setFilterReason] = useState<DiscountReason | 'ALL'>('ALL');
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    // Form state for new discount
    const [newDiscount, setNewDiscount] = useState({
        customerName: '',
        amount: 0,
        discountType: 'RUPEES' as 'RUPEES' | 'PERCENTAGE',
        reason: 'REGULAR_CUSTOMER' as DiscountReason,
        reasonNote: '',
    });

    const analytics = getDiscountAnalytics() || {
        today: { total: 0, count: 0 },
        week: { total: 0, count: 0, avgPerDay: 0 },
        month: { total: 0, count: 0, trend: 0, byReason: {} as any },
        pendingApprovals: 0,
        topCustomers: [],
    };
    const pendingDiscounts = getPendingDiscounts() || [];
    const todayTotal = getTodayTotal() || 0;
    const monthlyTotal = getMonthlyTotal() || 0;

    const formatCurrency = (value: number) => `PKR ${(value || 0).toLocaleString()}`;

    const getReasonConfig = (reason: DiscountReason) => {
        return DISCOUNT_REASONS.find(r => r.value === reason) || DISCOUNT_REASONS[6];
    };

    const handleAddDiscount = () => {
        const check = canAddDiscount(newDiscount.amount);
        if (check && !check.allowed) {
            toast.warning(check.reason || '');
            return;
        }

        try {
            addDiscount({
                shiftId: 'current-shift', // Would come from active shift
                customerName: newDiscount.customerName || undefined,
                amount: newDiscount.amount,
                discountType: newDiscount.discountType,
                reason: newDiscount.reason,
                reasonNote: newDiscount.reasonNote || undefined,
                createdBy: (user as any)?.id || 'unknown',
                createdByName: (user as any)?.name || 'Unknown',
            });
        } catch {
            return;
        }

        setShowAddModal(false);
        setNewDiscount({
            customerName: '',
            amount: 0,
            discountType: 'RUPEES',
            reason: 'REGULAR_CUSTOMER',
            reasonNote: '',
        });
    };

    const handleApprove = (entry: DiscountEntry) => {
        if (!entry) return;
        approveDiscount(entry.id, (user as any)?.id || 'unknown', (user as any)?.name || 'Unknown');
    };

    const handleReject = (entry: DiscountEntry, note: string) => {
        if (!entry) return;
        rejectDiscount(
            entry.id,
            (user as any)?.id || 'unknown',
            (user as any)?.name || 'Unknown',
            note
        );
    };

    const filteredEntries =
        filterReason === 'ALL'
            ? discountEntries || []
            : (discountEntries || []).filter(e => e && e.reason === filterReason);

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Today's Discounts */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Today</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">
                                {formatCurrency(analytics.today?.total || 0)}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                                {analytics.today?.count || 0} discounts given
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Calendar size={20} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-500/20">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-secondary)]">Daily Limit</span>
                            <span className="text-blue-500">
                                {discountLimits.dailyLimit > 0
                                    ? ((todayTotal / discountLimits.dailyLimit) * 100).toFixed(0)
                                    : 0}
                                % used
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{
                                    width: `${discountLimits.dailyLimit > 0 ? Math.min(100, (todayTotal / discountLimits.dailyLimit) * 100) : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* This Week */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">This Week</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">
                                {formatCurrency(analytics.week?.total || 0)}
                            </p>
                            <p className="text-xs text-purple-500 mt-1">
                                Avg: {formatCurrency(Math.round(analytics.week?.avgPerDay || 0))}
                                /day
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <TrendingUp size={20} className="text-purple-500" />
                        </div>
                    </div>
                </Card>

                {/* This Month */}
                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">This Month</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">
                                {formatCurrency(analytics.month?.total || 0)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                {(analytics.month?.trend || 0) >= 0 ? (
                                    <TrendingUp size={12} className="text-rose-500" />
                                ) : (
                                    <TrendingDown size={12} className="text-emerald-500" />
                                )}
                                <span
                                    className={
                                        (analytics.month?.trend || 0) >= 0
                                            ? 'text-rose-500'
                                            : 'text-emerald-500'
                                    }
                                >
                                    {Math.abs(analytics.month?.trend || 0).toFixed(1)}% vs last
                                    month
                                </span>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <DollarSign size={20} className="text-emerald-500" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-500/20">
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-secondary)]">Monthly Limit</span>
                            <span className="text-emerald-500">
                                {discountLimits.monthlyLimit > 0
                                    ? ((monthlyTotal / discountLimits.monthlyLimit) * 100).toFixed(
                                          0
                                      )
                                    : 0}
                                % used
                            </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{
                                    width: `${discountLimits.monthlyLimit > 0 ? Math.min(100, (monthlyTotal / discountLimits.monthlyLimit) * 100) : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Pending Approvals */}
                <Card
                    className={clsx(
                        'border',
                        analytics.pendingApprovals > 0
                            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
                            : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20'
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Pending Approvals
                            </p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">
                                {analytics.pendingApprovals}
                            </p>
                            {analytics.pendingApprovals > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 text-amber-500 p-0 h-auto"
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Review now →
                                </Button>
                            )}
                        </div>
                        <div
                            className={clsx(
                                'p-2 rounded-lg',
                                analytics.pendingApprovals > 0
                                    ? 'bg-amber-500/20'
                                    : 'bg-gray-500/20'
                            )}
                        >
                            <Clock
                                size={20}
                                className={
                                    analytics.pendingApprovals > 0
                                        ? 'text-amber-500'
                                        : 'text-gray-500'
                                }
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Discount by Reason Chart */}
            <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Percent size={18} className="text-purple-500" />
                    Discounts by Reason (This Month)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DISCOUNT_REASONS.map(reason => {
                        const total = analytics.month.byReason[reason.value] || 0;
                        const percentage =
                            analytics.month.total > 0 ? (total / analytics.month.total) * 100 : 0;

                        return (
                            <div
                                key={reason.value}
                                className={`p-3 rounded-xl bg-${reason.color}-500/10 border border-${reason.color}-500/20`}
                            >
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {reason.label}
                                </p>
                                <p className={`text-lg font-bold text-${reason.color}-500`}>
                                    {formatCurrency(total)}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {percentage.toFixed(1)}% of total
                                </p>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Top Customers */}
            {analytics.topCustomers.length > 0 && (
                <Card>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Users size={18} className="text-cyan-500" />
                        Top Customers by Discount Received
                    </h3>
                    <div className="space-y-2">
                        {analytics.topCustomers.map((customer, idx) => (
                            <div
                                key={customer.customerId}
                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        {customer.customerName}
                                    </span>
                                </div>
                                <span className="font-bold text-cyan-500">
                                    {formatCurrency(customer.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const renderPendingTab = () => (
        <div className="space-y-4">
            {pendingDiscounts.length === 0 ? (
                <Card className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        All Caught Up!
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                        No pending discount approvals at this time
                    </p>
                </Card>
            ) : (
                pendingDiscounts.map(entry => {
                    const reasonConfig = getReasonConfig(entry.reason);
                    return (
                        <Card key={entry.id} className="border-l-4 border-l-amber-500">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge color="amber">Pending Approval</Badge>
                                        <Badge
                                            color={
                                                reasonConfig.color as 'emerald' | 'blue' | 'amber'
                                            }
                                        >
                                            {reasonConfig.label}
                                        </Badge>
                                    </div>
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        {formatCurrency(entry.amount)}
                                    </p>
                                    {entry.customerName && (
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Customer: {entry.customerName}
                                        </p>
                                    )}
                                    {entry.reasonNote && (
                                        <p className="text-sm text-[var(--text-muted)] mt-1">
                                            Note: {entry.reasonNote}
                                        </p>
                                    )}
                                    <p className="text-xs text-[var(--text-muted)] mt-2">
                                        Created by {entry.createdByName} •{' '}
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="text-emerald-500 hover:bg-emerald-500/10"
                                        onClick={() => handleApprove(entry)}
                                    >
                                        <CheckCircle size={18} className="mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-rose-500 hover:bg-rose-500/10"
                                        onClick={() => {
                                            const note = prompt('Rejection reason:');
                                            if (note !== null) handleReject(entry, note);
                                        }}
                                    >
                                        <XCircle size={18} className="mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );

    const renderHistoryTab = () => (
        <div className="space-y-4">
            {/* Filter */}
            <Card className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-secondary)]">Filter by reason:</span>
                </div>
                <select
                    className="flex-1 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]"
                    value={filterReason}
                    onChange={e => setFilterReason(e.target.value as DiscountReason | 'ALL')}
                >
                    <option value="ALL">All Reasons</option>
                    {DISCOUNT_REASONS.map(r => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </Card>

            {/* History List */}
            <div className="space-y-2">
                {filteredEntries
                    .slice()
                    .reverse()
                    .map(entry => {
                        const reasonConfig = getReasonConfig(entry.reason);
                        const isExpanded = expandedEntry === entry.id;

                        return (
                            <Card
                                key={entry.id}
                                className={clsx(
                                    'cursor-pointer transition-all',
                                    entry.approvalStatus === 'APPROVED' &&
                                        'border-l-4 border-l-emerald-500',
                                    entry.approvalStatus === 'REJECTED' &&
                                        'border-l-4 border-l-rose-500',
                                    entry.approvalStatus === 'PENDING' &&
                                        'border-l-4 border-l-amber-500'
                                )}
                                onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={clsx(
                                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                                entry.approvalStatus === 'APPROVED' &&
                                                    'bg-emerald-500/20',
                                                entry.approvalStatus === 'REJECTED' &&
                                                    'bg-rose-500/20',
                                                entry.approvalStatus === 'PENDING' &&
                                                    'bg-amber-500/20'
                                            )}
                                        >
                                            {entry.approvalStatus === 'APPROVED' && (
                                                <CheckCircle
                                                    className="text-emerald-500"
                                                    size={20}
                                                />
                                            )}
                                            {entry.approvalStatus === 'REJECTED' && (
                                                <XCircle className="text-rose-500" size={20} />
                                            )}
                                            {entry.approvalStatus === 'PENDING' && (
                                                <Clock className="text-amber-500" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[var(--text-primary)]">
                                                    {formatCurrency(entry.amount)}
                                                </span>
                                                <Badge
                                                    color={
                                                        reasonConfig.color as
                                                            | 'emerald'
                                                            | 'blue'
                                                            | 'amber'
                                                    }
                                                >
                                                    {reasonConfig.label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {entry.customerName || 'Walk-in customer'} •{' '}
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            color={
                                                entry.approvalStatus === 'APPROVED'
                                                    ? 'emerald'
                                                    : entry.approvalStatus === 'REJECTED'
                                                      ? 'rose'
                                                      : 'amber'
                                            }
                                        >
                                            {entry.approvalStatus}
                                        </Badge>
                                        {isExpanded ? (
                                            <ChevronUp size={18} />
                                        ) : (
                                            <ChevronDown size={18} />
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-[var(--text-secondary)]">
                                                Created By
                                            </p>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {entry.createdByName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-secondary)]">Shift ID</p>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {entry.shiftId}
                                            </p>
                                        </div>
                                        {entry.reasonNote && (
                                            <div className="col-span-2">
                                                <p className="text-[var(--text-secondary)]">
                                                    Reason Note
                                                </p>
                                                <p className="font-medium text-[var(--text-primary)]">
                                                    {entry.reasonNote}
                                                </p>
                                            </div>
                                        )}
                                        {entry.approvedByName && (
                                            <div>
                                                <p className="text-[var(--text-secondary)]">
                                                    {entry.approvalStatus === 'APPROVED'
                                                        ? 'Approved'
                                                        : 'Rejected'}{' '}
                                                    By
                                                </p>
                                                <p className="font-medium text-[var(--text-primary)]">
                                                    {entry.approvedByName}
                                                </p>
                                            </div>
                                        )}
                                        {entry.approvalNote && (
                                            <div>
                                                <p className="text-[var(--text-secondary)]">
                                                    Approval Note
                                                </p>
                                                <p className="font-medium text-[var(--text-primary)]">
                                                    {entry.approvalNote}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <Card>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Discount Limits Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Daily Limit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(discountLimits.dailyLimit)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Maximum discounts allowed per day
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Monthly Limit</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(discountLimits.monthlyLimit)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Maximum discounts allowed per month
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Max Per Transaction</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(discountLimits.maxPerTransaction)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Maximum discount per single transaction
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Approval Threshold</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatCurrency(discountLimits.requireApprovalAbove)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Require manager approval above this amount
                    </p>
                </div>
            </div>
        </Card>
    );

    return (
        <div>
            <PageHeader
                title="Discount Management"
                subtitle="Track and manage all discounts with approval workflow"
                actions={
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Discount
                    </Button>
                }
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-2">
                {[
                    { id: 'overview', label: 'Overview', icon: Percent },
                    {
                        id: 'pending',
                        label: 'Pending',
                        icon: Clock,
                        badge: analytics.pendingApprovals,
                    },
                    { id: 'history', label: 'History', icon: Calendar },
                    { id: 'settings', label: 'Settings', icon: AlertTriangle },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={clsx(
                            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                            activeTab === tab.id
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'pending' && renderPendingTab()}
            {activeTab === 'history' && renderHistoryTab()}
            {activeTab === 'settings' && renderSettingsTab()}

            {/* Add Discount Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Discount"
            >
                <div className="space-y-4">
                    <Input
                        label="Customer Name (optional)"
                        value={newDiscount.customerName}
                        onChange={e =>
                            setNewDiscount({ ...newDiscount, customerName: e.target.value })
                        }
                        placeholder="Leave empty for walk-in customer"
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <Input
                                label={`Discount Amount ${newDiscount.discountType === 'PERCENTAGE' ? '(%)' : '(PKR)'}`}
                                type="number"
                                value={newDiscount.amount || ''}
                                onChange={e =>
                                    setNewDiscount({
                                        ...newDiscount,
                                        amount: parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder={
                                    newDiscount.discountType === 'PERCENTAGE'
                                        ? 'e.g., 10'
                                        : 'e.g., 500'
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Type
                            </label>
                            <select
                                className="w-full h-[46px] px-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                value={newDiscount.discountType}
                                onChange={e =>
                                    setNewDiscount({
                                        ...newDiscount,
                                        discountType: e.target.value as 'RUPEES' | 'PERCENTAGE',
                                    })
                                }
                            >
                                <option value="RUPEES">PKR</option>
                                <option value="PERCENTAGE">%</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Reason
                        </label>
                        <select
                            className="w-full p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)]"
                            value={newDiscount.reason}
                            onChange={e =>
                                setNewDiscount({
                                    ...newDiscount,
                                    reason: e.target.value as DiscountReason,
                                })
                            }
                        >
                            {DISCOUNT_REASONS.map(r => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Note (optional)"
                        value={newDiscount.reasonNote}
                        onChange={e =>
                            setNewDiscount({ ...newDiscount, reasonNote: e.target.value })
                        }
                        placeholder="Additional details"
                    />

                    {newDiscount.amount > discountLimits.requireApprovalAbove && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <span className="text-sm text-amber-500">
                                This discount requires manager approval
                            </span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddDiscount}
                            disabled={newDiscount.amount <= 0}
                            className="flex-1"
                        >
                            Add Discount
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DiscountsPage;
