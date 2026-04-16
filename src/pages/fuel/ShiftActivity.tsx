import { DateRange, DateRangeFilter } from '@/components/audit/DateRangeFilter';
import { DrillDownModal, TransactionType } from '@/components/audit/DrillDownModal';
import { analyticsEngine } from '@/lib/analyticsEngine';
import { useFuelStore } from '@/stores/fuelStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    Award,
    BarChart3,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Fuel,
    Moon,
    Receipt,
    RotateCcw,
    Search,
    SmartphoneNfc,
    Sun,
    Sunrise,
    TrendingDown,
    User as UserIcon,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/* ── helpers ─────────────────────────────────────────────────────────── */
const fmtPk = (n: number) =>
    `₨${Math.abs(n).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
const fmtShort = (n: number) => {
    const a = Math.abs(n);
    if (a >= 1_000_000) return `₨${(n / 1_000_000).toFixed(1)}M`;
    if (a >= 1_000) return `₨${(n / 1_000).toFixed(0)}K`;
    return fmtPk(n);
};
const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

const getInit = (): DateRange => {
    const now = new Date(),
        d30 = new Date(now.getTime() - 30 * 86400000);
    return { startDate: d30.toISOString(), endDate: now.toISOString(), preset: 'LAST_30_DAYS' };
};

/* ── shift type config ────────────────────────────────────────────────── */
const SHIFT_CFG: Record<
    string,
    { Icon: React.ElementType; label: string; from: string; to: string; glow: string }
> = {
    MORNING: {
        Icon: Sunrise,
        label: 'Morning',
        from: '#f59e0b',
        to: '#d97706',
        glow: 'rgba(245,158,11,0.35)',
    },
    EVENING: {
        Icon: Sun,
        label: 'Evening',
        from: '#f97316',
        to: '#ea580c',
        glow: 'rgba(249,115,22,0.35)',
    },
    NIGHT: {
        Icon: Moon,
        label: 'Night',
        from: '#6366f1',
        to: '#4f46e5',
        glow: 'rgba(99,102,241,0.35)',
    },
    CUSTOM: {
        Icon: Clock,
        label: 'Custom',
        from: '#8b5cf6',
        to: '#7c3aed',
        glow: 'rgba(139,92,246,0.35)',
    },
};

/* ── KPI definitions ──────────────────────────────────────────────────── */
const KPI_DEFS = [
    {
        key: 'REVENUE',
        label: 'Revenue',
        sub: 'Nozzle Sales',
        Icon: DollarSign,
        from: '#10b981',
        to: '#059669',
        glow: 'rgba(16,185,129,0.3)',
        type: 'NOZZLE_SALES' as TransactionType,
    },
    {
        key: 'VOLUME',
        label: 'Volume Sold',
        sub: 'Total Liters',
        Icon: Fuel,
        from: '#06b6d4',
        to: '#0891b2',
        glow: 'rgba(6,182,212,0.3)',
        type: 'NOZZLE_SALES' as TransactionType,
    },
    {
        key: 'RECOVERIES',
        label: 'Recoveries',
        sub: 'Cash collected',
        Icon: RotateCcw,
        from: '#34d399',
        to: '#059669',
        glow: 'rgba(52,211,153,0.3)',
        type: 'RECOVERY' as TransactionType,
    },
    {
        key: 'CREDIT',
        label: 'Credit Sales',
        sub: 'Outstanding',
        Icon: CreditCard,
        from: '#f87171',
        to: '#dc2626',
        glow: 'rgba(248,113,113,0.3)',
        type: 'CREDIT' as TransactionType,
    },
    {
        key: 'EXPENSE',
        label: 'Expenses',
        sub: 'All categories',
        Icon: Receipt,
        from: '#fbbf24',
        to: '#d97706',
        glow: 'rgba(251,191,36,0.3)',
        type: 'EXPENSE' as TransactionType,
    },
    {
        key: 'BANK',
        label: 'Bank Deposits',
        sub: 'Account wise',
        Icon: Building2,
        from: '#60a5fa',
        to: '#2563eb',
        glow: 'rgba(96,165,250,0.3)',
        type: 'BANK_DEPOSIT' as TransactionType,
    },
    {
        key: 'SUPPLIER',
        label: 'Supplier Pmts',
        sub: 'Vendor payments',
        Icon: TrendingDown,
        from: '#a78bfa',
        to: '#7c3aed',
        glow: 'rgba(167,139,250,0.3)',
        type: 'SUPPLIER_PAYMENT' as TransactionType,
    },
    {
        key: 'DIGITAL',
        label: 'Digital Pmts',
        sub: 'Wallet & card',
        Icon: SmartphoneNfc,
        from: '#f472b6',
        to: '#db2777',
        glow: 'rgba(244,114,182,0.3)',
        type: 'DIGITAL_PAYMENT' as TransactionType,
    },
];

const ITEM = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 270, damping: 24 },
    },
};
const STAG = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } };

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
export const ShiftActivityPage: React.FC = () => {
    const { shifts, nozzles } = useFuelStore();

    const [search, setSearch] = useState('');
    const [shiftType, setST] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT'>('ALL');
    const [statusF, setStatusF] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
    const [dateRange, setDateRange] = useState<DateRange>(getInit());
    const [expanded, setExpanded] = useState<string | null>(null);
    const [drillDown, setDrillDown] = useState<{
        type: TransactionType;
        title: string;
        data: any[];
    } | null>(null);

    /* ── Date-filtered shifts ── */
    const dateFiltered = useMemo(
        () =>
            shifts.filter(s => {
                const d = new Date(s.date);
                return d >= new Date(dateRange.startDate) && d <= new Date(dateRange.endDate);
            }),
        [shifts, dateRange]
    );

    /* ── Search+type+status filtered, sorted newest first ── */
    const filtered = useMemo(
        () =>
            dateFiltered
                .filter(s => {
                    const q = search.toLowerCase();
                    const matchS =
                        !q ||
                        s.staffName?.toLowerCase().includes(q) ||
                        s.shiftId?.toLowerCase().includes(q);
                    const matchT = shiftType === 'ALL' || s.shiftType === shiftType;
                    const matchSt =
                        statusF === 'ALL' ||
                        s.status === statusF ||
                        (statusF === 'CLOSED' && s.status === 'APPROVED');
                    return matchS && matchT && matchSt;
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [dateFiltered, search, shiftType, statusF]
    );

    /* ── Aggregated KPI data from all date-filtered shifts ── */
    const agg = useMemo(() => {
        const flatMap = <T,>(fn: (s: (typeof shifts)[0]) => T[]): T[] => dateFiltered.flatMap(fn);

        const nozzleSales = flatMap(s =>
            (s.nozzleSales || []).map((ns: any) => ({
                timestamp: s.startTime || s.date,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                nozzleName:
                    ns.nozzleName ||
                    nozzles.find((n: any) => n.nozzleId === ns.nozzleId)?.name ||
                    ns.nozzleId,
                fuelType: ns.fuelType || '—',
                liters: ns.netSales || 0,
                rate: ns.rate || 0,
                amount: ns.revenue || 0,
                openingReading: ns.openingReading,
                closingReading: ns.closingReading,
            }))
        );

        const getTxOfType = (s: (typeof shifts)[0], type: string) =>
            (s.transactions || []).filter((t: any) => t.type === type);

        const recoveries = flatMap(s =>
            [...(s.recoveryEntries || []), ...getTxOfType(s, 'RECOVERY')].map((r: any) => ({
                ...r,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                amount: r.amount || 0,
                customerName: r.customerName || '—',
            }))
        );

        const credits = flatMap(s =>
            [...(s.creditEntries || []), ...getTxOfType(s, 'CREDIT_SALE')].map((c: any) => ({
                ...c,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                amount: c.amount || 0,
                customerName: c.customerName || '—',
            }))
        );

        const expenses = flatMap(s =>
            [...(s.expenseEntries || []), ...getTxOfType(s, 'EXPENSE')].map((e: any) => ({
                ...e,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                amount: e.amount || 0,
                category: e.expenseCategory || e.category || 'OTHER',
                description: e.description || e.note || '',
            }))
        );

        const bankDeposits = flatMap(s =>
            [...(s.bankDepositEntries || []), ...getTxOfType(s, 'BANK_DEPOSIT')].map((bd: any) => ({
                ...bd,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                amount: bd.amount || 0,
                bankName: bd.accountName || bd.bankName || 'Bank',
            }))
        );

        const supplierPayments = flatMap(s =>
            [...(s.supplierPaymentEntries || []), ...getTxOfType(s, 'SUPPLIER_PAYMENT')].map(
                (sp: any) => ({
                    ...sp,
                    shiftId: s.shiftId,
                    shiftDate: s.date,
                    salesmanName: s.staffName,
                    amount: sp.amount || 0,
                    supplierName: sp.supplierName || '—',
                })
            )
        );

        const digitalPayments = flatMap(s =>
            getTxOfType(s, 'DIGITAL_PAYMENT').map((dp: any) => ({
                ...dp,
                shiftId: s.shiftId,
                shiftDate: s.date,
                salesmanName: s.staffName,
                amount: dp.amount || 0,
            }))
        );

        const totalRevenue = dateFiltered.reduce((s, x) => s + (x.totalRevenue || 0), 0);
        const totalLiters = dateFiltered.reduce((s, x) => s + (x.totalLitersSold || 0), 0);
        const totalRecovery = recoveries.reduce((s, x) => s + x.amount, 0);
        const totalCredit = credits.reduce((s, x) => s + x.amount, 0);
        const totalExpense = expenses.reduce((s, x) => s + x.amount, 0);
        const totalBank = bankDeposits.reduce((s, x) => s + x.amount, 0);
        const totalSupplier = supplierPayments.reduce((s, x) => s + x.amount, 0);
        const totalDigital = digitalPayments.reduce((s, x) => s + x.amount, 0);

        return {
            totalRevenue,
            totalLiters,
            totalRecovery,
            totalCredit,
            totalExpense,
            totalBank,
            totalSupplier,
            totalDigital,
            nozzleSales,
            recoveries,
            credits,
            expenses,
            bankDeposits,
            supplierPayments,
            digitalPayments,
            totalShifts: dateFiltered.length,
        };
    }, [dateFiltered, nozzles]);

    const kpiData: Record<string, { amount: number; liters?: number; entries: any[] }> = {
        REVENUE: { amount: agg.totalRevenue, entries: agg.nozzleSales },
        VOLUME: { amount: agg.totalLiters, entries: agg.nozzleSales },
        RECOVERIES: { amount: agg.totalRecovery, entries: agg.recoveries },
        CREDIT: { amount: agg.totalCredit, entries: agg.credits },
        EXPENSE: { amount: agg.totalExpense, entries: agg.expenses },
        BANK: { amount: agg.totalBank, entries: agg.bankDeposits },
        SUPPLIER: { amount: agg.totalSupplier, entries: agg.supplierPayments },
        DIGITAL: { amount: agg.totalDigital, entries: agg.digitalPayments },
    };

    const handleKPI = (key: string, label: string, type: TransactionType) => {
        setDrillDown({
            type,
            title: `${label} — ${dateRange.preset.replace(/_/g, ' ')}`,
            data: kpiData[key]?.entries || [],
        });
    };

    return (
        <motion.div variants={STAG} initial="hidden" animate="show" className="space-y-7">
            {/* ═══ PREMIUM HERO HEADER ═══ */}
            <motion.div
                variants={ITEM}
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background:
                        'linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4338ca 65%,#7c3aed 100%)',
                    padding: '2px',
                }}
            >
                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background:
                            'linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4338ca 65%,#7c3aed 100%)',
                    }}
                >
                    {/* Noise texture overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                            backgroundSize: '100px',
                        }}
                    />
                    {/* Glow orbs */}
                    <div
                        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle,#818cf8,transparent 70%)' }}
                    />
                    <div
                        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15"
                        style={{ background: 'radial-gradient(circle,#a78bfa,transparent 70%)' }}
                    />
                    <div className="relative px-8 py-7 flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                                    <Activity size={16} className="text-white" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">
                                    Shift Intelligence
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                                Activity Log
                            </h1>
                            <p className="text-base text-white/50 mt-2">
                                Complete audit trail with drill-down analytics
                            </p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                                <BarChart3 size={14} className="text-indigo-300" />
                                <span className="text-base font-black text-white">
                                    {agg.totalShifts} Shifts
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                                <Award size={14} className="text-emerald-300" />
                                <span className="text-base font-black text-emerald-200">
                                    {fmtShort(agg.totalRevenue)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══ DATE FILTER ═══ */}
            <motion.div variants={ITEM}>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </motion.div>

            {/* ═══ KPI GRID ═══ */}
            <motion.div variants={ITEM} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_DEFS.map((k, i) => {
                    const d = kpiData[k.key];
                    const isLiters = k.key === 'VOLUME';
                    const val = isLiters ? agg.totalLiters : d?.amount || 0;
                    const display = isLiters ? `${val.toLocaleString()} L` : fmtShort(val);
                    const entries = d?.entries.length || 0;

                    return (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.04, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleKPI(k.key, k.label, k.type)}
                            className="group relative overflow-hidden text-left p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] transition-all duration-200 hover:shadow-2xl cursor-pointer"
                        >
                            {/* Hover glow overlay */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                                style={{
                                    background: `radial-gradient(circle at 0% 0%,${k.glow},transparent 70%)`,
                                }}
                            />
                            {/* Top accent line */}
                            <div
                                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"
                                style={{ background: `linear-gradient(90deg,${k.from},${k.to})` }}
                            />

                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg,${k.from},${k.to})`,
                                        boxShadow: `0 4px 18px ${k.glow}`,
                                    }}
                                >
                                    <k.Icon size={20} className="text-white" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                                    {k.label}
                                </p>
                                <p className="text-2xl font-black font-mono text-gray-900 dark:text-white leading-none">
                                    {display}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs text-gray-400 dark:text-slate-600 font-medium">
                                        {k.sub}
                                    </p>
                                    <span
                                        className="text-xs font-black px-2 py-1 rounded-lg"
                                        style={{
                                            background: `${k.from}15`,
                                            color: k.from,
                                            border: `1px solid ${k.from}25`,
                                        }}
                                    >
                                        {entries} records
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}

                {/* Shifts KPI (static, no drill-down) */}
                <div className="relative overflow-hidden text-left p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08]">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                            boxShadow: '0 4px 18px rgba(99,102,241,0.3)',
                        }}
                    >
                        <Zap size={20} className="text-white" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                        Total Shifts
                    </p>
                    <p className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                        {agg.totalShifts}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-600 font-medium mt-3">
                        In selected period
                    </p>
                </div>
            </motion.div>

            {/* ═══ FILTER ROW ═══ */}
            <motion.div variants={ITEM} className="flex flex-wrap items-center gap-3">
                {/* Shift type */}
                <div className="flex p-1 gap-1 rounded-2xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07]">
                    {(['ALL', 'MORNING', 'EVENING', 'NIGHT'] as const).map(t => {
                        const cfg = t !== 'ALL' ? SHIFT_CFG[t] : null;
                        const ShiftIcon = cfg?.Icon;
                        return (
                            <button
                                key={t}
                                onClick={() => setST(t)}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200',
                                    shiftType === t
                                        ? 'text-white shadow-lg'
                                        : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                                )}
                                style={
                                    shiftType === t && cfg
                                        ? {
                                              background: `linear-gradient(135deg,${cfg.from},${cfg.to})`,
                                              boxShadow: `0 4px 16px ${cfg.glow}`,
                                          }
                                        : shiftType === t
                                          ? { background: '#1e293b', color: 'white' }
                                          : {}
                                }
                            >
                                {ShiftIcon && <ShiftIcon size={13} />}
                                {t === 'ALL' ? 'All Types' : cfg?.label}
                            </button>
                        );
                    })}
                </div>

                {/* Status */}
                <div className="flex p-1 gap-1 rounded-2xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07]">
                    {(
                        [
                            { v: 'ALL', label: 'All', cls: 'bg-gray-700' },
                            { v: 'OPEN', label: 'Open', cls: 'bg-blue-500' },
                            { v: 'CLOSED', label: 'Closed', cls: 'bg-emerald-500' },
                        ] as const
                    ).map(s => (
                        <button
                            key={s.v}
                            onClick={() => setStatusF(s.v)}
                            className={clsx(
                                'px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200',
                                statusF === s.v
                                    ? `${s.cls} text-white shadow-lg`
                                    : 'text-gray-500 dark:text-slate-500 hover:text-gray-700'
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by staff or shift ID…"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-gray-200 dark:border-white/[0.08] text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                </div>

                {/* Export Button */}
                <button
                    onClick={() => analyticsEngine.exportToCSV('Shift_Activity', filtered)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-black uppercase tracking-wide hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors ml-auto"
                >
                    <Download size={16} /> Export CSV
                </button>
            </motion.div>

            {/* ═══ ANALYTICS CHARTS ═══ */}
            <motion.div variants={ITEM} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-6">Hourly Revenue & Volume Pattern</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsEngine.getHourlyPatternAnalysis(dateRange)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any, name: string) => [name === 'revenue' ? fmtPk(value) : `${Math.round(value)} L`, name.toUpperCase()]}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-6">Top Operators Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsEngine.getOperatorPerformance(dateRange).slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="staffName" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [fmtPk(value), 'Revenue']}
                                />
                                <Bar dataKey="totalRevenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* ═══ SHIFT TIMELINE ═══ */}
            <motion.div variants={ITEM} className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="py-24 text-center rounded-3xl bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/[0.07]">
                        <Activity
                            size={56}
                            className="mx-auto text-gray-200 dark:text-slate-700 mb-5"
                        />
                        <p className="text-xl font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                            No Shifts Found
                        </p>
                        <p className="text-base text-gray-300 dark:text-slate-700 mt-2">
                            Adjust date range or filters to see activity
                        </p>
                    </div>
                ) : (
                    filtered.map(shift => {
                        const cfg = SHIFT_CFG[shift.shiftType] || SHIFT_CFG.CUSTOM;
                        const ShiftIcon = cfg.Icon;
                        const isOpen = shift.status === 'OPEN';
                        const isExp = expanded === shift.shiftId;
                        const variance = shift.variance || 0;

                        // Get all transactions for this shift
                        const shiftExpenses = [
                            ...(shift.expenseEntries || []),
                            ...(shift.transactions || []).filter((t: any) => t.type === 'EXPENSE'),
                        ];
                        const shiftCredits = [
                            ...(shift.creditEntries || []),
                            ...(shift.transactions || []).filter(
                                (t: any) => t.type === 'CREDIT_SALE'
                            ),
                        ];
                        const shiftRecoveries = [
                            ...(shift.recoveryEntries || []),
                            ...(shift.transactions || []).filter((t: any) => t.type === 'RECOVERY'),
                        ];

                        return (
                            <motion.div
                                key={shift.shiftId}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="overflow-hidden rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.07] hover:border-indigo-200 dark:hover:border-indigo-500/25 transition-all duration-200"
                                style={{
                                    boxShadow:
                                        '0 2px 12px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.04)',
                                }}
                            >
                                {/* Color bar */}
                                <div
                                    className="h-1"
                                    style={{
                                        background: `linear-gradient(90deg,${cfg.from},${cfg.to})`,
                                    }}
                                />

                                {/* Header */}
                                <button
                                    className="w-full text-left px-7 py-5"
                                    onClick={() => setExpanded(isExp ? null : shift.shiftId)}
                                >
                                    <div className="flex items-start justify-between gap-5">
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl"
                                                style={{
                                                    background: `linear-gradient(135deg,${cfg.from},${cfg.to})`,
                                                    boxShadow: `0 6px 24px ${cfg.glow}`,
                                                }}
                                            >
                                                <ShiftIcon size={22} className="text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                        {cfg.label} Shift
                                                    </h3>
                                                    <span
                                                        className={clsx(
                                                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest',
                                                            isOpen
                                                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25'
                                                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25'
                                                        )}
                                                    >
                                                        {isOpen ? (
                                                            '● Live'
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={10} /> Done
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-400 dark:text-slate-500 flex-wrap">
                                                    <span className="flex items-center gap-1.5 font-semibold">
                                                        <UserIcon size={13} />
                                                        {shift.staffName}
                                                    </span>
                                                    <span className="text-gray-200 dark:text-slate-700">
                                                        ·
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={13} />
                                                        {fmtDate(shift.date)}
                                                    </span>
                                                    {shift.startTime && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={13} />
                                                            {fmtTime(shift.startTime)}
                                                        </span>
                                                    )}
                                                    <span className="font-mono text-gray-300 dark:text-slate-700 text-xs">
                                                        {shift.shiftId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="text-right">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                                    Revenue
                                                </p>
                                                <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    {fmtShort(shift.totalRevenue || 0)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                                    Variance
                                                </p>
                                                <p
                                                    className={clsx(
                                                        'text-xl font-black font-mono mt-0.5',
                                                        variance >= 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    )}
                                                >
                                                    {variance >= 0 ? '+' : ''}
                                                    {fmtPk(variance)}
                                                </p>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isExp ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <ChevronDown
                                                    size={20}
                                                    className="text-gray-300 dark:text-slate-600"
                                                />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Mini stats row */}
                                    <div className="grid grid-cols-4 gap-3 mt-5">
                                        {[
                                            {
                                                label: 'Volume',
                                                val: `${(shift.totalLitersSold || 0).toLocaleString()} L`,
                                                from: '#06b6d4',
                                                to: '#0891b2',
                                            },
                                            {
                                                label: 'Credits',
                                                val: fmtPk(
                                                    shift.credits ||
                                                        shiftCredits.reduce(
                                                            (s, t) => s + (t.amount || 0),
                                                            0
                                                        )
                                                ),
                                                from: '#f87171',
                                                to: '#dc2626',
                                            },
                                            {
                                                label: 'Recoveries',
                                                val: fmtPk(
                                                    shift.recoveries ||
                                                        shiftRecoveries.reduce(
                                                            (s, t) => s + (t.amount || 0),
                                                            0
                                                        )
                                                ),
                                                from: '#34d399',
                                                to: '#059669',
                                            },
                                            {
                                                label: 'Expenses',
                                                val: fmtPk(
                                                    shift.expenses ||
                                                        shiftExpenses.reduce(
                                                            (s, t) => s + (t.amount || 0),
                                                            0
                                                        )
                                                ),
                                                from: '#fbbf24',
                                                to: '#d97706',
                                            },
                                        ].map(s => (
                                            <div
                                                key={s.label}
                                                className="rounded-xl px-4 py-3 text-left"
                                                style={{
                                                    background: `linear-gradient(135deg,${s.from}10,${s.to}05)`,
                                                    border: `1px solid ${s.from}20`,
                                                }}
                                            >
                                                <p
                                                    className="text-xs font-black uppercase tracking-widest"
                                                    style={{ color: s.from }}
                                                >
                                                    {s.label}
                                                </p>
                                                <p className="text-base font-black font-mono text-gray-900 dark:text-white mt-1">
                                                    {s.val}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </button>

                                {/* Expandable detail */}
                                <AnimatePresence>
                                    {isExp && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                                            className="overflow-hidden border-t border-gray-100 dark:border-white/[0.06]"
                                        >
                                            <div className="px-7 py-6 space-y-6 bg-gray-50/50 dark:bg-white/[0.01]">
                                                {/* Nozzle readings table */}
                                                {(shift.nozzleSales || []).length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                                            <Fuel size={14} /> Nozzle Readings
                                                        </p>
                                                        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]">
                                                            <table className="w-full">
                                                                <thead>
                                                                    <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                                                                        {[
                                                                            'Nozzle',
                                                                            'Fuel Type',
                                                                            'Opening',
                                                                            'Closing',
                                                                            'Net (L)',
                                                                            'Rate/L',
                                                                            'Revenue',
                                                                        ].map(h => (
                                                                            <th
                                                                                key={h}
                                                                                className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 bg-gray-50/80 dark:bg-white/[0.02] whitespace-nowrap"
                                                                            >
                                                                                {h}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                                                                    {(shift.nozzleSales || []).map(
                                                                        (ns: any, i: number) => (
                                                                            <tr
                                                                                key={i}
                                                                                className="hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors"
                                                                            >
                                                                                <td className="px-5 py-4 text-base font-black text-gray-900 dark:text-white">
                                                                                    {ns.nozzleName ||
                                                                                        ns.nozzleId}
                                                                                </td>
                                                                                <td className="px-5 py-4">
                                                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                                                                        {
                                                                                            ns.fuelType
                                                                                        }
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-5 py-4 font-mono text-sm text-gray-500 dark:text-slate-500">
                                                                                    {(
                                                                                        ns.openingReading ||
                                                                                        0
                                                                                    ).toFixed(2)}
                                                                                </td>
                                                                                <td className="px-5 py-4 font-mono text-sm font-black text-gray-700 dark:text-slate-300">
                                                                                    {(
                                                                                        ns.closingReading ||
                                                                                        0
                                                                                    ).toFixed(2)}
                                                                                </td>
                                                                                <td className="px-5 py-4 font-black font-mono text-emerald-600 dark:text-emerald-400 text-base">
                                                                                    {(
                                                                                        ns.netSales ||
                                                                                        0
                                                                                    ).toFixed(2)}
                                                                                </td>
                                                                                <td className="px-5 py-4 font-mono text-sm text-gray-500">
                                                                                    ₨{ns.rate}
                                                                                </td>
                                                                                <td className="px-5 py-4 font-black font-mono text-lg text-indigo-600 dark:text-indigo-400">
                                                                                    ₨
                                                                                    {(
                                                                                        ns.revenue ||
                                                                                        0
                                                                                    ).toLocaleString()}
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Transaction sub-sections */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {[
                                                        {
                                                            label: 'Credit Sales',
                                                            list: shiftCredits,
                                                            from: '#f87171',
                                                            nameKey: 'customerName',
                                                        },
                                                        {
                                                            label: 'Recoveries',
                                                            list: shiftRecoveries,
                                                            from: '#34d399',
                                                            nameKey: 'customerName',
                                                        },
                                                        {
                                                            label: 'Expenses',
                                                            list: shiftExpenses,
                                                            from: '#fbbf24',
                                                            nameKey: 'description',
                                                        },
                                                    ].map(
                                                        sec =>
                                                            sec.list.length > 0 && (
                                                                <div
                                                                    key={sec.label}
                                                                    className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-white dark:bg-white/[0.02]"
                                                                >
                                                                    <div
                                                                        className="px-5 py-3 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06]"
                                                                        style={{
                                                                            background: `${sec.from}08`,
                                                                        }}
                                                                    >
                                                                        <p
                                                                            className="text-sm font-black uppercase tracking-widest"
                                                                            style={{
                                                                                color: sec.from,
                                                                            }}
                                                                        >
                                                                            {sec.label}
                                                                        </p>
                                                                        <span
                                                                            className="text-xs font-black px-2 py-0.5 rounded-lg"
                                                                            style={{
                                                                                background: `${sec.from}15`,
                                                                                color: sec.from,
                                                                            }}
                                                                        >
                                                                            {sec.list.length}
                                                                        </span>
                                                                    </div>
                                                                    <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                                                                        {sec.list.map(
                                                                            (
                                                                                tx: any,
                                                                                j: number
                                                                            ) => (
                                                                                <div
                                                                                    key={j}
                                                                                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                                                                >
                                                                                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 truncate max-w-[55%]">
                                                                                        {tx[
                                                                                            sec
                                                                                                .nameKey
                                                                                        ] ||
                                                                                            tx.customerName ||
                                                                                            tx.category ||
                                                                                            '—'}
                                                                                    </span>
                                                                                    <span
                                                                                        className="text-sm font-black font-mono"
                                                                                        style={{
                                                                                            color: sec.from,
                                                                                        }}
                                                                                    >
                                                                                        ₨
                                                                                        {(
                                                                                            tx.amount ||
                                                                                            0
                                                                                        ).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                        <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 dark:bg-white/[0.04]">
                                                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                                                Total
                                                                            </span>
                                                                            <span
                                                                                className="text-base font-black font-mono"
                                                                                style={{
                                                                                    color: sec.from,
                                                                                }}
                                                                            >
                                                                                ₨
                                                                                {sec.list
                                                                                    .reduce(
                                                                                        (
                                                                                            s: number,
                                                                                            t: any
                                                                                        ) =>
                                                                                            s +
                                                                                            (t.amount ||
                                                                                                0),
                                                                                        0
                                                                                    )
                                                                                    .toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Drill-down Modal */}
            {drillDown && (
                <DrillDownModal
                    isOpen
                    onClose={() => setDrillDown(null)}
                    type={drillDown.type}
                    title={drillDown.title}
                    data={drillDown.data}
                    dateRange={dateRange}
                />
            )}
        </motion.div>
    );
};

export default ShiftActivityPage;
