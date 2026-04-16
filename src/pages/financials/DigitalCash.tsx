import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useFuelStore } from '@/stores/fuelStore';
import type { DigitalCashEntry, DigitalPaymentMethod } from '@/types';
import clsx from 'clsx';
import {
    CreditCard,
    DollarSign,
    Phone,
    Plus,
    Search,
    Smartphone,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

// Helper function: Format currency
const formatCurrency = (amount: number): string => {
    return `₨${Math.abs(amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
};

// Helper function: Format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// Payment method config
const PAYMENT_METHODS: {
    value: DigitalPaymentMethod;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    { value: 'JAZZCASH', label: 'JazzCash', icon: <Phone className="w-5 h-5" />, color: 'rose' },
    {
        value: 'EASYPAISA',
        label: 'EasyPaisa',
        icon: <Smartphone className="w-5 h-5" />,
        color: 'emerald',
    },
    { value: 'POS', label: 'POS Card', icon: <CreditCard className="w-5 h-5" />, color: 'blue' },
    {
        value: 'BANK_TRANSFER',
        label: 'Bank Transfer',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'purple',
    },
];

const getMethodConfig = (method: DigitalPaymentMethod) => {
    return PAYMENT_METHODS.find(m => m.value === method) || PAYMENT_METHODS[3];
};

export const DigitalCashPage: React.FC = () => {
    const { shifts } = useFuelStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState<DigitalPaymentMethod | 'ALL'>('ALL');
    const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('MONTH');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add Payment Form State
    const [newPayment, setNewPayment] = useState({
        amount: '',
        method: 'JAZZCASH' as DigitalPaymentMethod,
        reference: '',
        shiftId: '',
    });

    const { addDigitalCashEntry } = useFuelStore();

    // Default shift for new payment
    const defaultShiftId = shifts.length > 0 ? shifts[0].shiftId : 'SH-AUTO-001';

    const handleAddPayment = () => {
        const amountNum = parseFloat(newPayment.amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        addDigitalCashEntry(newPayment.shiftId || defaultShiftId, {
            amount: amountNum,
            method: newPayment.method,
            reference: newPayment.reference,
            shiftId: newPayment.shiftId || defaultShiftId,
            timestamp: new Date().toISOString(),
        });

        setIsAddModalOpen(false);
        setNewPayment({
            amount: '',
            method: 'JAZZCASH',
            reference: '',
            shiftId: '',
        });
    };

    // Aggregate all digital payments from shifts
    const allPayments: (DigitalCashEntry & { shiftDate: string; staffName: string })[] = shifts
        .flatMap(shift =>
            (shift.digitalCashEntries || []).map(entry => ({
                ...entry,
                shiftDate: shift.date,
                staffName: shift.staffName,
            }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter payments
    const filteredPayments = allPayments.filter(payment => {
        const matchesSearch =
            payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.method.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMethod = filterMethod === 'ALL' || payment.method === filterMethod;

        // Date filter
        const paymentDate = new Date(payment.timestamp);
        const today = new Date();
        let matchesDate = true;

        if (dateRange === 'TODAY') {
            matchesDate = paymentDate.toDateString() === today.toDateString();
        } else if (dateRange === 'WEEK') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = paymentDate >= weekAgo;
        } else if (dateRange === 'MONTH') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = paymentDate >= monthAgo;
        }

        return matchesSearch && matchesMethod && matchesDate;
    });

    // Calculate totals by method
    const methodTotals = PAYMENT_METHODS.map(method => ({
        ...method,
        total: filteredPayments
            .filter(p => p.method === method.value)
            .reduce((sum, p) => sum + p.amount, 0),
        count: filteredPayments.filter(p => p.method === method.value).length,
    })).sort((a, b) => b.total - a.total);

    const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Digital Payments"
                subtitle="Track JazzCash, EasyPaisa, POS, and bank transfers"
                actions={
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add Payment
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Payments */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-400 uppercase tracking-wide font-medium">
                                {dateRange === 'TODAY'
                                    ? "Today's"
                                    : dateRange === 'WEEK'
                                      ? 'This Week'
                                      : dateRange === 'MONTH'
                                        ? 'This Month'
                                        : 'Total'}{' '}
                                Digital
                            </p>
                            <p className="text-2xl font-bold text-indigo-500">
                                {formatCurrency(totalPayments)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>{filteredPayments.length} transactions</span>
                    </div>
                </div>

                {/* Method Cards */}
                {methodTotals.slice(0, 3).map(method => (
                    <div
                        key={method.value}
                        className={clsx(
                            'p-5 rounded-2xl border backdrop-blur-sm',
                            method.color === 'rose' &&
                                'bg-gradient-to-br from-rose-500/20 to-pink-500/10 border-rose-500/30',
                            method.color === 'emerald' &&
                                'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/30',
                            method.color === 'blue' &&
                                'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30',
                            method.color === 'purple' &&
                                'bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border-purple-500/30'
                        )}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={clsx(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg',
                                    method.color === 'rose' &&
                                        'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/30',
                                    method.color === 'emerald' &&
                                        'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30',
                                    method.color === 'blue' &&
                                        'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30',
                                    method.color === 'purple' &&
                                        'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/30'
                                )}
                            >
                                {method.icon}
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                                    {method.label}
                                </p>
                                <p className="text-xl font-bold text-[var(--text-primary)]">
                                    {formatCurrency(method.total)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <span>{method.count} transactions</span>
                            <span>•</span>
                            <span>
                                {totalPayments > 0
                                    ? ((method.total / totalPayments) * 100).toFixed(0)
                                    : 0}
                                %
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Date Range */}
                <div className="flex gap-2">
                    {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={clsx(
                                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                dateRange === range
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                            )}
                        >
                            {range === 'ALL'
                                ? 'All Time'
                                : range.charAt(0) + range.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Method Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterMethod('ALL')}
                        className={clsx(
                            'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                            filterMethod === 'ALL'
                                ? 'bg-indigo-500 text-white'
                                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                        )}
                    >
                        All
                    </button>
                    {PAYMENT_METHODS.map(method => (
                        <button
                            key={method.value}
                            onClick={() => setFilterMethod(method.value)}
                            className={clsx(
                                'px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1',
                                filterMethod === method.value &&
                                    method.color === 'rose' &&
                                    'bg-rose-500 text-white',
                                filterMethod === method.value &&
                                    method.color === 'emerald' &&
                                    'bg-emerald-500 text-white',
                                filterMethod === method.value &&
                                    method.color === 'blue' &&
                                    'bg-blue-500 text-white',
                                filterMethod === method.value &&
                                    method.color === 'purple' &&
                                    'bg-purple-500 text-white',
                                filterMethod !== method.value &&
                                    'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                            )}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search by reference..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Payment List */}
            <div className="grid gap-3">
                {filteredPayments.length === 0 ? (
                    <Card className="text-center py-12">
                        <Wallet className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                        <p className="text-[var(--text-secondary)]">No digital payments found</p>
                    </Card>
                ) : (
                    filteredPayments.map(payment => {
                        const methodConfig = getMethodConfig(payment.method);
                        return (
                            <div
                                key={payment.id}
                                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-indigo-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Method Icon */}
                                        <div
                                            className={clsx(
                                                'w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg',
                                                methodConfig.color === 'rose' &&
                                                    'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/30',
                                                methodConfig.color === 'emerald' &&
                                                    'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30',
                                                methodConfig.color === 'blue' &&
                                                    'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30',
                                                methodConfig.color === 'purple' &&
                                                    'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/30'
                                            )}
                                        >
                                            {methodConfig.icon}
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[var(--text-primary)]">
                                                    {methodConfig.label}
                                                </h3>
                                                <Badge color="indigo">{payment.staffName}</Badge>
                                            </div>
                                            {payment.reference && (
                                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                                    Ref: {payment.reference}
                                                </p>
                                            )}
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                {formatDate(payment.shiftDate)} • Shift:{' '}
                                                {payment.shiftId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-indigo-500">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Payment Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-indigo-500/10 to-purple-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Record Digital Payment
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Amount (₨) *
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="0"
                                    value={newPayment.amount}
                                    onChange={e =>
                                        setNewPayment({ ...newPayment, amount: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Method
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={newPayment.method}
                                        onChange={e =>
                                            setNewPayment({
                                                ...newPayment,
                                                method: e.target.value as any,
                                            })
                                        }
                                    >
                                        {PAYMENT_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Shift
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] font-mono text-sm"
                                        value={newPayment.shiftId || defaultShiftId}
                                        onChange={e =>
                                            setNewPayment({
                                                ...newPayment,
                                                shiftId: e.target.value,
                                            })
                                        }
                                    >
                                        {shifts.slice(0, 5).map(s => (
                                            <option key={s.shiftId} value={s.shiftId}>
                                                {s.date} - {s.shiftType} ({s.shiftId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Reference (Transaction ID / Phone)
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="e.g. 0300... or TXN-123"
                                    value={newPayment.reference}
                                    onChange={e =>
                                        setNewPayment({
                                            ...newPayment,
                                            reference: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddPayment}
                                disabled={!newPayment.amount}
                            >
                                <Plus size={18} /> Record Payment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalCashPage;
