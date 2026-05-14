import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useSettingsStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useExpenseStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import type { ShiftExpenseCategory } from '@/types';
import clsx from 'clsx';
import {
    Coffee,
    DollarSign,
    Package,
    Plus,
    Receipt,
    Search,
    Settings,
    Truck,
    Wrench,
    X,
    Zap,
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

// Expense category config
const EXPENSE_CATEGORIES: {
    value: ShiftExpenseCategory;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    {
        value: 'PETTY_CASH',
        label: 'Petty Cash',
        icon: <Coffee className="w-5 h-5" />,
        color: 'amber',
    },
    { value: 'REPAIRS', label: 'Repairs', icon: <Wrench className="w-5 h-5" />, color: 'rose' },
    { value: 'UTILITIES', label: 'Utilities', icon: <Zap className="w-5 h-5" />, color: 'blue' },
    {
        value: 'SALARY',
        label: 'Salary',
        icon: <DollarSign className="w-5 h-5" />,
        color: 'emerald',
    },
    {
        value: 'TRANSPORT',
        label: 'Transport',
        icon: <Truck className="w-5 h-5" />,
        color: 'purple',
    },
    { value: 'CLEANING', label: 'Cleaning', icon: <Package className="w-5 h-5" />, color: 'cyan' },
    { value: 'OTHER', label: 'Other', icon: <Settings className="w-5 h-5" />, color: 'gray' },
];

// Get category config
const getCategoryConfig = (category: ShiftExpenseCategory) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category) || EXPENSE_CATEGORIES[6];
};

export const ExpensesPage: React.FC = () => {
    const { settings } = useSettingsStore();
    const isCNG = settings.businessUnit === 'CNG';

    const fuelStore = useFuelStore();
    const cngStore = useCNGStore();

    const shifts = isCNG ? cngStore.shifts : fuelStore.shifts;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<ShiftExpenseCategory | 'ALL'>('ALL');
    const { getFilteredExpenses, addExpense, fetchExpenses, isLoading, error: storeError } = useExpenseStore();

    // Fetch on mount
    React.useEffect(() => {
        fetchExpenses();
    }, []);

    const [localError, setLocalError] = useState<string | null>(null);

    // Add Expense Form State
    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'PETTY_CASH' as ShiftExpenseCategory,
        note: '',
        shiftId: '', // Optional: track which shift this was for
    });

    // Default shift for new expense
    const defaultShiftId = shifts.length > 0 ? shifts[0].shiftId : 'SH-AUTO-001';

    const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('MONTH');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddExpense = async () => {
        const amountNum = parseFloat(newExpense.amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        setLocalError(null);
        try {
            await addExpense({
                amount: amountNum,
                category: newExpense.category,
                description: newExpense.note,
                expenseDate: new Date().toISOString(),
                paymentMethod: 'CASH',
                paidTo: 'MISC',
                approvedById: null,
                expenseId: `EXP-${Date.now()}`,
            });

            setIsAddModalOpen(false);
            setNewExpense({
                amount: '',
                category: 'PETTY_CASH',
                note: '',
                shiftId: '',
            });
        } catch (error: any) {
            setLocalError(error.message || 'Failed to add expense');
            console.error('Failed to add expense:', error);
        }
    };

    // Use backend expenses
    const allExpenses = getFilteredExpenses()
        .map(e => ({
            id: e.id,
            category: e.category as ShiftExpenseCategory,
            amount: e.amount,
            note: e.description,
            timestamp: e.expenseDate || (e as any).createdAt,
            shiftDate: (e as any).expenseDate || (e as any).createdAt,
            staffName: 'MANAGER', // Or join with User
            shiftId: 'STAFF-EXP',
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter expenses
    const filteredExpenses = allExpenses.filter(expense => {
        const matchesSearch =
            expense.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || expense.category === filterCategory;

        // Date filter
        const expenseDate = new Date(expense.timestamp);
        const today = new Date();
        let matchesDate = true;

        if (dateRange === 'TODAY') {
            matchesDate = expenseDate.toDateString() === today.toDateString();
        } else if (dateRange === 'WEEK') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = expenseDate >= weekAgo;
        } else if (dateRange === 'MONTH') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = expenseDate >= monthAgo;
        }

        return matchesSearch && matchesCategory && matchesDate;
    });

    // Calculate totals by category
    const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        total: filteredExpenses
            .filter(e => e.category === cat.value)
            .reduce((sum, e) => sum + e.amount, 0),
        count: filteredExpenses.filter(e => e.category === cat.value).length,
    })).sort((a, b) => b.total - a.total);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Expense Tracking"
                subtitle="View shift-linked expenses and category breakdown"
                actions={
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add Expense
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Expenses */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-rose-400 uppercase tracking-wide font-medium">
                                {dateRange === 'TODAY'
                                    ? "Today's"
                                    : dateRange === 'WEEK'
                                      ? 'This Week'
                                      : dateRange === 'MONTH'
                                        ? 'This Month'
                                        : 'Total'}{' '}
                                Expenses
                            </p>
                            <p className="text-2xl font-bold text-rose-500">
                                {formatCurrency(totalExpenses)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{filteredExpenses.length} entries</span>
                    </div>
                </div>

                {/* Top 3 Categories */}
                {categoryTotals.slice(0, 3).map(cat => (
                    <div
                        key={cat.value}
                        className={clsx(
                            'p-5 rounded-2xl border backdrop-blur-sm',
                            `bg-gradient-to-br from-${cat.color}-500/20 to-${cat.color}-500/10 border-${cat.color}-500/30`
                        )}
                        style={{
                            background: `linear-gradient(135deg, var(--${cat.color}-500-20, rgba(0,0,0,0.1)) 0%, transparent 100%)`,
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className={clsx(
                                    'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-white',
                                    cat.color === 'amber' &&
                                        'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30',
                                    cat.color === 'rose' &&
                                        'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/30',
                                    cat.color === 'blue' &&
                                        'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30',
                                    cat.color === 'emerald' &&
                                        'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30',
                                    cat.color === 'purple' &&
                                        'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/30',
                                    cat.color === 'cyan' &&
                                        'bg-gradient-to-br from-cyan-500 to-teal-500 shadow-cyan-500/30',
                                    cat.color === 'gray' &&
                                        'bg-gradient-to-br from-gray-500 to-slate-500 shadow-gray-500/30'
                                )}
                            >
                                {cat.icon}
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">
                                    {cat.label}
                                </p>
                                <p className="text-xl font-bold text-[var(--text-primary)]">
                                    {formatCurrency(cat.total)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <span>{cat.count} entries</span>
                            <span>•</span>
                            <span>
                                {totalExpenses > 0
                                    ? ((cat.total / totalExpenses) * 100).toFixed(0)
                                    : 0}
                                % of total
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                {/* Date Range */}
                <div className="flex flex-wrap gap-2">
                    {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={clsx(
                                'px-3 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px]',
                                dateRange === range
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                            )}
                        >
                            {range === 'ALL'
                                ? 'All Time'
                                : range.charAt(0) + range.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <select
                    value={filterCategory}
                    onChange={e =>
                        setFilterCategory(e.target.value as ShiftExpenseCategory | 'ALL')
                    }
                    className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-rose-500 min-h-[44px] text-base sm:text-sm"
                >
                    <option value="ALL">All Categories</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>

                {/* Search */}
                <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        inputMode="search"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all min-h-[44px] text-base sm:text-sm"
                    />
                </div>
            </div>

            {/* Expense List */}
            <div className="grid gap-3">
                {filteredExpenses.length === 0 ? (
                    <Card className="text-center py-12">
                        <Receipt className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                        <p className="text-[var(--text-secondary)]">No expenses found</p>
                    </Card>
                ) : (
                    filteredExpenses.map(expense => {
                        const catConfig = getCategoryConfig(expense.category);
                        return (
                            <div
                                key={expense.id}
                                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-rose-500/50 transition-all"
                            >
                                {/* Mobile: stack vertically; Desktop: side by side */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Category Icon */}
                                        <div
                                            className={clsx(
                                                'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0',
                                                catConfig.color === 'amber' &&
                                                    'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30',
                                                catConfig.color === 'rose' &&
                                                    'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/30',
                                                catConfig.color === 'blue' &&
                                                    'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/30',
                                                catConfig.color === 'emerald' &&
                                                    'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30',
                                                catConfig.color === 'purple' &&
                                                    'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/30',
                                                catConfig.color === 'cyan' &&
                                                    'bg-gradient-to-br from-cyan-500 to-teal-500 shadow-cyan-500/30',
                                                catConfig.color === 'gray' &&
                                                    'bg-gradient-to-br from-gray-500 to-slate-500 shadow-gray-500/30'
                                            )}
                                        >
                                            {catConfig.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-[var(--text-primary)] truncate">
                                                    {catConfig.label}
                                                </h3>
                                                <Badge color="blue">{expense.staffName}</Badge>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                                                {expense.note || 'No description'}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                {formatDate(expense.shiftDate)} • {expense.shiftId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount — always right-aligned */}
                                    <div className="text-right flex-shrink-0 self-end sm:self-auto">
                                        <p className="text-lg sm:text-xl font-bold text-rose-500">
                                            -{formatCurrency(expense.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {/* Add Expense Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-rose-500/10 to-pink-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Add New Expense
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(localError || storeError) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] font-black uppercase tracking-widest animate-shake">
                                    {localError || storeError}
                                </div>
                            )}
                            <div className="space-y-2 form-group">
                                <label className="text-sm font-semibold text-[var(--text-secondary)]">
                                    Amount (₨) *
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] min-h-[44px] text-base"
                                    placeholder="0"
                                    value={newExpense.amount}
                                    onChange={e =>
                                        setNewExpense({ ...newExpense, amount: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2 form-group">
                                <label className="text-sm font-semibold text-[var(--text-secondary)]">
                                    Category
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] min-h-[44px] text-base"
                                    value={newExpense.category}
                                    onChange={e =>
                                        setNewExpense({
                                            ...newExpense,
                                            category: e.target.value as any,
                                        })
                                    }
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
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
                                    value={newExpense.shiftId || defaultShiftId}
                                    onChange={e =>
                                        setNewExpense({ ...newExpense, shiftId: e.target.value })
                                    }
                                >
                                    {shifts.slice(0, 5).map(s => (
                                        <option key={s.shiftId} value={s.shiftId}>
                                            {s.date} - {s.shiftType} ({s.shiftId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Note
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] h-24"
                                    placeholder="Expense description..."
                                    value={newExpense.note}
                                    onChange={e =>
                                        setNewExpense({ ...newExpense, note: e.target.value })
                                    }
                                />
                                {parseFloat(newExpense.amount) > 10000 && !newExpense.note && (
                                    <p className="text-xs text-rose-500 font-medium mt-1">
                                        ⚠️ A note or receipt is required for expenses over ₨10,000. Missing notes will trigger an Anti-Fraud Alert for Owner review.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setLocalError(null);
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddExpense}
                                disabled={isLoading || !newExpense.amount}
                            >
                                {isLoading ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                ) : (
                                    <Plus size={18} className="mr-2" />
                                )}
                                {isLoading ? 'Recording...' : 'Record Expense'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesPage;
