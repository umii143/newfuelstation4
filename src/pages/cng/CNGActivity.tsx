import { DateRange, DateRangeFilter } from '@/components/audit/DateRangeFilter';
import { DrillDownModal, TransactionType } from '@/components/audit/DrillDownModal';
import { Badge, Card, PageHeader } from '@/components/ui';
import { useCNGStore } from '@/stores/cngStore';
import clsx from 'clsx';
import {
    Activity,
    Clock,
    DollarSign,
    Fuel,
    Moon,
    Search,
    Sun,
    Sunrise,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Helper function: Format currency
const formatCurrency = (amount: number): string => {
    return `Rs.${Math.abs(amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
};

// Helper function: Format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// Shift type config
const SHIFT_TYPE_CONFIG = {
    MORNING: { icon: <Sunrise className="w-5 h-5" />, color: 'amber', label: 'Morning' },
    EVENING: { icon: <Sun className="w-5 h-5" />, color: 'orange', label: 'Evening' },
    NIGHT: { icon: <Moon className="w-5 h-5" />, color: 'indigo', label: 'Night' },
    CUSTOM: { icon: <Clock className="w-5 h-5" />, color: 'purple', label: 'Custom' },
};

// Get initial date range (Last 30 Days)
const getInitialDateRange = (): DateRange => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    return {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        preset: 'LAST_30_DAYS',
    };
};

export const CNGActivityPage: React.FC = () => {
    const { shifts } = useCNGStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterShiftType, setFilterShiftType] = useState<
        'ALL' | 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM'
    >('ALL');
    const [filterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange());
    const [drillDownModal, setDrillDownModal] = useState<{
        type: TransactionType;
        title: string;
        data: any[];
    } | null>(null);

    // Filter shifts by date range
    const dateFilteredShifts = useMemo(() => {
        return (shifts || []).filter(shift => {
            const shiftDate = new Date(shift.date);
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            return shiftDate >= startDate && shiftDate <= endDate;
        });
    }, [shifts, dateRange]);

    // Calculate KPIs and aggregate transaction data
    const kpis = useMemo(() => {
        const totalRevenue = dateFilteredShifts.reduce((sum, s) => sum + s.totalRevenue, 0);
        const totalKG = dateFilteredShifts.reduce((sum, s) => sum + (s.totalLitersSold || 0), 0);
        const avgVariance =
            dateFilteredShifts.length > 0
                ? dateFilteredShifts.reduce((sum, s) => sum + (s.variancePercentage || 0), 0) /
                  dateFilteredShifts.length
                : 0;
        const totalShifts = dateFilteredShifts.length;

        // Aggregate all transactions from CNG shifts
        const recoveryEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.recoveryEntries || []).map(r => ({
                    ...r,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                })) || []
        );

        const creditEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.creditEntries || []).map(c => ({
                    ...c,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                })) || []
        );

        const expenseEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.expenseEntries || []).map(e => ({
                    ...e,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                })) || []
        );

        const supplierPaymentEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.supplierPaymentEntries || []).map(sp => ({
                    ...sp,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                })) || []
        );

        const bankDepositEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.bankDepositEntries || []).map(bd => ({
                    ...bd,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                })) || []
        );

        const nozzleSalesEntries = dateFilteredShifts.flatMap(
            shift =>
                (shift.nozzleSales || []).map(t => ({
                    timestamp: shift.startTime,
                    shiftId: shift.shiftId,
                    shiftDate: shift.date,
                    salesmanName: shift.staffName,
                    nozzleName: t.nozzleName || t.nozzleId,
                    fuelType: t.fuelType || 'CNG',
                    liters: t.netSales || 0,
                    rate: t.rate || 0,
                    amount: t.revenue || 0,
                    openingReading: t.openingReading,
                    closingReading: t.closingReading,
                })) || []
        );

        return {
            totalRevenue,
            totalKG,
            avgVariance,
            totalShifts,
            totalRecoveries: dateFilteredShifts.reduce((sum, s) => sum + (s.recoveries || 0), 0),
            totalCredits: dateFilteredShifts.reduce((sum, s) => sum + (s.credits || 0), 0),
            totalExpenses: dateFilteredShifts.reduce((sum, s) => sum + (s.expenses || 0), 0),
            recoveryEntries,
            creditEntries,
            expenseEntries,
            supplierPaymentEntries,
            bankDepositEntries,
            nozzleSalesEntries,
        };
    }, [dateFilteredShifts]);

    // Handle KPI card click
    const handleKPIClick = (type: TransactionType) => {
        const modalConfig: Record<TransactionType, { title: string; data: any[] }> = {
            REVENUE: {
                title: `All Sales Transactions (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.nozzleSalesEntries,
            },
            RECOVERY: {
                title: `All Recoveries (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.recoveryEntries,
            },
            CREDIT: {
                title: `All Credit Sales (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.creditEntries,
            },
            EXPENSE: {
                title: `All Expenses (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.expenseEntries,
            },
            SUPPLIER_PAYMENT: {
                title: `All Supplier Payments (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.supplierPaymentEntries,
            },
            BANK_DEPOSIT: {
                title: `All Bank Deposits (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.bankDepositEntries,
            },
            NOZZLE_SALES: {
                title: `All Dispenser Sales (CNG) - ${dateRange.preset.replace('_', ' ')}`,
                data: kpis.nozzleSalesEntries,
            },
            DIGITAL_PAYMENT: { title: 'Digital Payments', data: [] },
            TANKER_ARRIVAL: { title: 'Cascade Arrivals', data: [] }, // CNG context
            DISCOUNT: { title: 'Discounts', data: [] },
            CARRIAGE: { title: 'Carriage', data: [] },
            INAM_TIP: { title: 'Inam/Tip', data: [] },
            TEST_LITERS: { title: 'Test KG', data: [] },
        };

        if (modalConfig[type]) {
            setDrillDownModal({
                type,
                ...modalConfig[type],
            });
        }
    };

    // Filter shifts
    const filteredShifts = useMemo(() => {
        return dateFilteredShifts
            .filter(shift => {
                const matchesSearch =
                    shift.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    shift.shiftId?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType =
                    filterShiftType === 'ALL' || shift.shiftType === filterShiftType;
                const matchesStatus =
                    filterStatus === 'ALL' ||
                    shift.status === filterStatus ||
                    (filterStatus === 'CLOSED' && shift.status === 'APPROVED');
                return matchesSearch && matchesType && matchesStatus;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dateFilteredShifts, searchQuery, filterShiftType, filterStatus]);

    return (
        <div className="space-y-8 pb-20">
            <PageHeader
                title="CNG Activity Log"
                subtitle="High-fidelity CNG shift ledger and transaction audit"
            />

            {/* Clickable KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Revenue - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('NOZZLE_SALES')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold text-emerald-500">
                                {formatCurrency(kpis.totalRevenue)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span>Sales Details →</span>
                    </div>
                </button>

                {/* Total KG - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('NOZZLE_SALES')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                            <Fuel className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 uppercase tracking-wide font-medium">
                                Total KG
                            </p>
                            <p className="text-2xl font-bold text-blue-500">
                                {kpis.totalKG.toLocaleString()} KG
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Dispenser-wise details →</span>
                    </div>
                </button>

                {/* Recoveries - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('RECOVERY')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/10 border border-emerald-500/20 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50 transition-shadow">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                                Recoveries
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(kpis.totalRecoveries)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{kpis.recoveryEntries.length} entries →</span>
                    </div>
                </button>

                {/* Credits - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('CREDIT')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-red-500/10 border border-rose-500/20 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:shadow-rose-600/50 transition-shadow">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-rose-400 uppercase tracking-wide font-medium">
                                Credits
                            </p>
                            <p className="text-2xl font-bold text-rose-600">
                                {formatCurrency(kpis.totalCredits)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{kpis.creditEntries.length} entries →</span>
                    </div>
                </button>

                {/* Expenses - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('EXPENSE')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:shadow-amber-600/50 transition-shadow">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-400 uppercase tracking-wide font-medium">
                                Expenses
                            </p>
                            <p className="text-2xl font-bold text-amber-600">
                                {formatCurrency(kpis.totalExpenses)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{kpis.expenseEntries.length} entries →</span>
                    </div>
                </button>

                {/* Bank Deposits - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('BANK_DEPOSIT')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-600/30 group-hover:shadow-cyan-600/50 transition-shadow">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-cyan-400 uppercase tracking-wide font-medium">
                                Bank Deposits
                            </p>
                            <p className="text-2xl font-bold text-cyan-600">
                                {formatCurrency(
                                    kpis.bankDepositEntries.reduce((sum, bd) => sum + bd.amount, 0)
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{kpis.bankDepositEntries.length} entries →</span>
                    </div>
                </button>

                {/* Supplier Payments - CLICKABLE */}
                <button
                    onClick={() => handleKPIClick('SUPPLIER_PAYMENT')}
                    className="text-left p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/10 border border-purple-500/20 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:shadow-purple-600/50 transition-shadow">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-purple-400 uppercase tracking-wide font-medium">
                                Supplier Payments
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(
                                    kpis.supplierPaymentEntries.reduce(
                                        (sum, sp) => sum + sp.amount,
                                        0
                                    )
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{kpis.supplierPaymentEntries.length} entries →</span>
                    </div>
                </button>

                {/* Total Shifts */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-400 uppercase tracking-wide font-medium">
                                Total Shifts
                            </p>
                            <p className="text-2xl font-bold text-indigo-600">{kpis.totalShifts}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>In selected range</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 rounded-[2rem] bg-[var(--bg-elevated)]/50 backdrop-blur-xl border border-[var(--border)] overflow-visible">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="SEARCH SHIFTS OR SALESMEN..."
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] font-bold text-xs uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DateRangeFilter value={dateRange} onChange={setDateRange} />

                    <div className="flex gap-2">
                        {(['ALL', 'MORNING', 'EVENING', 'NIGHT'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterShiftType(type)}
                                className={clsx(
                                    'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                    filterShiftType === type
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-white/50'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Activity Stream */}
            <div className="grid gap-4">
                {filteredShifts.length === 0 ? (
                    <Card className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] opacity-50">
                        <Activity className="w-16 h-16 text-[var(--text-secondary)] mb-4 animate-pulse" />
                        <p className="font-bold uppercase tracking-widest text-xs text-[var(--text-secondary)]">
                            No telemetry detected for selected parameters
                        </p>
                    </Card>
                ) : (
                    filteredShifts.map(shift => (
                        <Card
                            key={shift.shiftId}
                            className="p-6 rounded-[2.5rem] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-emerald-500/30 transition-all group overflow-hidden relative"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div
                                        className={clsx(
                                            'w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl',
                                            shift.shiftType === 'MORNING'
                                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/20'
                                                : shift.shiftType === 'EVENING'
                                                  ? 'bg-gradient-to-br from-orange-500 to-rose-600 shadow-rose-500/20'
                                                  : 'bg-gradient-to-br from-indigo-500 to-purple-700 shadow-indigo-500/20'
                                        )}
                                    >
                                        {SHIFT_TYPE_CONFIG[
                                            shift.shiftType as keyof typeof SHIFT_TYPE_CONFIG
                                        ]?.icon || <Clock />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                                                {shift.staffName}
                                            </h3>
                                            <Badge
                                                color={
                                                    shift.status === 'APPROVED' ? 'emerald' : 'blue'
                                                }
                                            >
                                                {shift.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">
                                            {formatDate(shift.date)} • {shift.shiftId}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="text-right px-4 border-r border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                            KG Sold
                                        </p>
                                        <p className="text-lg font-black text-blue-500">
                                            {(shift.totalLitersSold || 0).toFixed(2)} KG
                                        </p>
                                    </div>
                                    <div className="text-right px-4 border-r border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                            Revenue
                                        </p>
                                        <p className="text-lg font-black text-emerald-500">
                                            {formatCurrency(shift.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="text-right px-4 border-r border-[var(--border)]">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                            Expenses
                                        </p>
                                        <p className="text-lg font-black text-rose-500">
                                            -{formatCurrency(shift.expenses)}
                                        </p>
                                    </div>
                                    <div className="text-right px-4">
                                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                            Variance
                                        </p>
                                        <p
                                            className={clsx(
                                                'text-lg font-black',
                                                shift.variance >= 0
                                                    ? 'text-emerald-500'
                                                    : 'text-rose-500'
                                            )}
                                        >
                                            {shift.variance >= 0 ? '+' : ''}
                                            {formatCurrency(shift.variance)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
            {/* Transaction Drill-down Modal */}
            {drillDownModal && (
                <DrillDownModal
                    isOpen={!!drillDownModal}
                    onClose={() => setDrillDownModal(null)}
                    type={drillDownModal.type}
                    title={drillDownModal.title}
                    data={drillDownModal.data}
                    dateRange={dateRange}
                />
            )}
        </div>
    );
};
