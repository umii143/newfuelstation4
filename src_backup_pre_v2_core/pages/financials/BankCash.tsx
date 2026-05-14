import { useAuthStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useFuelStore } from '@/stores/fuelStore';
import clsx from 'clsx';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import {
    BarChart3,
    Building2,
    CalendarDays,
    ChevronDown,
    Clock,
    FileText,
    Landmark,
    Plus,
    Search,
    TrendingUp,
    UserCheck,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

/* ── helpers ─────────────────────────────────────────────────────────── */
const fmt = (n: number) => `₨${Math.abs(n).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `₨${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `₨${(n / 1_000).toFixed(0)}K`;
    return fmt(n);
};
const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

/* ── Animated number counter ────────────────────────────────────────── */
const AnimatedNum: React.FC<{ value: number; prefix?: string; className?: string }> = ({
    value,
    prefix = '₨',
    className,
}) => {
    const spring = useSpring(0, { stiffness: 80, damping: 20 });
    const display = useTransform(spring, n => `${prefix}${Math.round(n).toLocaleString('en-PK')}`);
    useEffect(() => {
        spring.set(value);
    }, [value]);
    return <motion.span className={className}>{display}</motion.span>;
};

/* ── Bank config ────────────────────────────────────────────────────── */
const BANKS = [
    {
        name: 'HBL',
        full: 'Habib Bank Ltd',
        from: '#10b981',
        to: '#059669',
        glow: 'rgba(16,185,129,0.3)',
    },
    {
        name: 'UBL',
        full: 'United Bank Ltd',
        from: '#3b82f6',
        to: '#2563eb',
        glow: 'rgba(59,130,246,0.3)',
    },
    { name: 'MCB', full: 'MCB Bank', from: '#f59e0b', to: '#d97706', glow: 'rgba(245,158,11,0.3)' },
    {
        name: 'Allied',
        full: 'Allied Bank',
        from: '#8b5cf6',
        to: '#7c3aed',
        glow: 'rgba(139,92,246,0.3)',
    },
    {
        name: 'Meezan',
        full: 'Meezan Bank',
        from: '#f97316',
        to: '#ea580c',
        glow: 'rgba(249,115,22,0.3)',
    },
    {
        name: 'Faysal',
        full: 'Faysal Bank',
        from: '#ec4899',
        to: '#db2777',
        glow: 'rgba(236,72,153,0.3)',
    },
    {
        name: 'Standard',
        full: 'Standard Chartered',
        from: '#06b6d4',
        to: '#0891b2',
        glow: 'rgba(6,182,212,0.3)',
    },
    {
        name: 'Other',
        full: 'Other Bank',
        from: '#64748b',
        to: '#475569',
        glow: 'rgba(100,116,139,0.3)',
    },
];
const getBank = (n: string) =>
    BANKS.find(b => n.toLowerCase().includes(b.name.toLowerCase())) || BANKS[7];

type DatePreset = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
const PRESETS: { label: string; value: DatePreset }[] = [
    { label: 'Today', value: 'TODAY' },
    { label: 'This Week', value: 'WEEK' },
    { label: '30 Days', value: 'MONTH' },
    { label: 'All Time', value: 'ALL' },
];

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 };
const ITEM = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } };
const STAG = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ════════════════════════════════════════════════════════════════════ */
export const BankCashPage: React.FC = () => {
    const { settings } = useAuthStore();
    const isCNG = settings.businessUnit === 'CNG';
    
    
    const fuelStore = useFuelStore();
    const cngStore = useCNGStore();
    
    const shifts = isCNG ? cngStore.shifts : fuelStore.shifts;
    const addBankDepositEntry = isCNG 
        ? () => {} // CNG store might need this action added if not present
        : fuelStore.addBankDepositEntry;

    const [search, setSearch] = useState('');
    const [preset, setPreset] = useState<DatePreset>('MONTH');
    const [addOpen, setAddOpen] = useState(false);
    const [selBank, setSelBank] = useState('HBL');
    const [depAmt, setDepAmt] = useState('');
    const [accNum, setAccNum] = useState('');
    const [slipNum, setSlipNum] = useState('');
    const [shiftSel, setShiftSel] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const defaultShift = shifts.length > 0 ? shifts[0].shiftId : '';

    /* ── All deposits from shifts ── */
    const allDeposits = useMemo(
        () =>
            shifts
                .flatMap(s =>
                    (s.bankDepositEntries || []).map((d: any) => ({
                        ...d,
                        shiftDate: s.date,
                        staffName: s.staffName,
                        shiftType: s.shiftType,
                    }))
                )
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [shifts]
    );

    /* ── Date filter ── */
    const filtered = useMemo(() => {
        const now = new Date();
        return allDeposits.filter(d => {
            const dDate = new Date(d.timestamp);
            const matchSearch =
                !search ||
                d.bankName?.toLowerCase().includes(search.toLowerCase()) ||
                d.staffName?.toLowerCase().includes(search.toLowerCase()) ||
                d.depositSlipNumber?.includes(search);
            let matchDate = true;
            if (preset === 'TODAY') matchDate = dDate.toDateString() === now.toDateString();
            else if (preset === 'WEEK') matchDate = dDate >= new Date(now.getTime() - 7 * 86400000);
            else if (preset === 'MONTH')
                matchDate = dDate >= new Date(now.getTime() - 30 * 86400000);
            return matchSearch && matchDate;
        });
    }, [allDeposits, search, preset]);

    const totalDeposits = filtered.reduce((s, d) => s + d.amount, 0);
    const totalCount = filtered.length;

    /* ── Per-bank totals (only banks with > 0 deposits) ── */
    const bankBreakdown = useMemo(
        () =>
            BANKS.map(b => ({
                ...b,
                total: filtered
                    .filter(d => d.bankName?.toLowerCase().includes(b.name.toLowerCase()))
                    .reduce((s, d) => s + d.amount, 0),
                count: filtered.filter(d =>
                    d.bankName?.toLowerCase().includes(b.name.toLowerCase())
                ).length,
            }))
                .filter(b => b.total > 0)
                .sort((a, b) => b.total - a.total),
        [filtered]
    );

    const handleAdd = () => {
        const amt = parseFloat(depAmt);
        if (isNaN(amt) || amt <= 0) return;
        const shiftId = shiftSel || defaultShift;
        addBankDepositEntry(shiftId, {
            amount: amt,
            bankName: selBank,
            accountNumber: accNum,
            depositSlipNumber: slipNum,
            shiftId,
            timestamp: new Date().toISOString(),
        });
        setAddOpen(false);
        setDepAmt('');
        setAccNum('');
        setSlipNum('');
    };

    return (
        <motion.div variants={STAG} initial="hidden" animate="show" className="space-y-7">
            {/* ═══ HERO HEADER ═══ */}
            <motion.div
                variants={ITEM}
                className="relative overflow-hidden rounded-3xl"
                style={{
                    background:
                        'linear-gradient(135deg,#0c4a6e 0%,#075985 35%,#0284c7 70%,#06b6d4 100%)',
                }}
            >
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '100px',
                    }}
                />
                <div
                    className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle,#7dd3fc,transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle,#22d3ee,transparent 70%)' }}
                />
                <div className="relative px-8 py-7 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                                <Landmark size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">
                                Treasury Management
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                            Bank Deposits
                        </h1>
                        <p className="text-base text-white/50 mt-2">
                            Real-time cash flow tracking across all accounts
                        </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                            <BarChart3 size={14} className="text-cyan-300" />
                            <span className="text-base font-black text-white">
                                {totalCount} deposits
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm">
                            <TrendingUp size={14} className="text-emerald-200" />
                            <AnimatedNum
                                value={totalDeposits}
                                className="text-base font-black text-emerald-200"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══ TOTAL + BANK BREAKDOWN KPIs ═══ */}
            <motion.div variants={ITEM} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total card */}
                <div
                    className="col-span-2 md:col-span-1 relative overflow-hidden p-6 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg,#0284c7,#0891b2)',
                        boxShadow: '0 8px 32px rgba(2,132,199,0.35)',
                    }}
                >
                    <div
                        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle,white,transparent 70%)' }}
                    />
                    <div className="relative">
                        <p className="text-sm font-black uppercase tracking-widest text-white/70">
                            Total Deposited
                        </p>
                        <AnimatedNum
                            value={totalDeposits}
                            className="text-3xl font-black text-white mt-1 block"
                        />
                        <p className="text-sm text-white/60 mt-1">{totalCount} transactions</p>
                    </div>
                </div>

                {/* Per-bank breakdown */}
                {bankBreakdown.slice(0, 3).map(b => (
                    <motion.div
                        key={b.name}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] cursor-pointer group"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                            style={{
                                background: `radial-gradient(circle at 0% 0%,${b.glow},transparent 70%)`,
                            }}
                        />
                        <div className="relative">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-lg text-white"
                                style={{
                                    background: `linear-gradient(135deg,${b.from},${b.to})`,
                                    boxShadow: `0 4px 16px ${b.glow}`,
                                }}
                            >
                                <Building2 size={17} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                {b.name}
                            </p>
                            <AnimatedNum
                                value={b.total}
                                className="text-xl font-black font-mono text-gray-900 dark:text-white mt-0.5 block"
                            />
                            <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                                {b.count} deposits
                            </p>
                            {/* Mini progress bar */}
                            <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${totalDeposits > 0 ? (b.total / totalDeposits) * 100 : 0}%`,
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{
                                        background: `linear-gradient(90deg,${b.from},${b.to})`,
                                    }}
                                />
                            </div>
                            <p className="text-xs font-black mt-1.5" style={{ color: b.from }}>
                                {totalDeposits > 0
                                    ? ((b.total / totalDeposits) * 100).toFixed(0)
                                    : 0}
                                % of total
                            </p>
                        </div>
                    </motion.div>
                ))}
                {/* Fill empty slots if fewer than 3 banks */}
                {bankBreakdown.length === 0 &&
                    [1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/[0.07] flex items-center justify-center"
                        >
                            <p className="text-xs font-black text-gray-300 dark:text-slate-700 uppercase tracking-widest">
                                No Data
                            </p>
                        </div>
                    ))}
            </motion.div>

            {/* ═══ FILTERS ═══ */}
            <motion.div variants={ITEM} className="flex flex-wrap items-center gap-3">
                {/* Date presets */}
                <div className="flex p-1 gap-1 rounded-2xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07]">
                    {PRESETS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPreset(p.value)}
                            className={clsx(
                                'px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200',
                                preset === p.value
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                    : 'text-gray-500 dark:text-slate-500 hover:text-gray-700'
                            )}
                        >
                            {p.label}
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
                        placeholder="Search bank, staff or slip…"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/[0.03] border-2 border-gray-200 dark:border-white/[0.08] text-base font-semibold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-700 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                    />
                </div>
                {/* Add button */}
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-black text-white uppercase tracking-widest shadow-xl transition-all"
                    style={{
                        background: 'linear-gradient(135deg,#0284c7,#0891b2)',
                        boxShadow: '0 6px 24px rgba(2,132,199,0.35)',
                    }}
                >
                    <Plus size={17} /> New Deposit
                </motion.button>
            </motion.div>

            {/* ═══ DEPOSITS LIST ═══ */}
            <motion.div variants={ITEM} className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/[0.07]">
                        <Landmark
                            size={52}
                            className="mx-auto text-gray-200 dark:text-slate-700 mb-4"
                        />
                        <p className="text-xl font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                            No Deposits Found
                        </p>
                        <p className="text-base text-gray-300 dark:text-slate-700 mt-1">
                            Adjust filters or add a new deposit
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((deposit, i) => {
                            const bank = getBank(deposit.bankName || '');
                            const isExp = expanded === deposit.id;
                            return (
                                <motion.div
                                    key={deposit.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.07] hover:border-sky-200 dark:hover:border-sky-500/25 transition-all"
                                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                                >
                                    {/* Accent line */}
                                    <div
                                        className="h-0.5"
                                        style={{
                                            background: `linear-gradient(90deg,${bank.from},${bank.to})`,
                                        }}
                                    />

                                    <div className="flex items-center justify-between px-6 py-5">
                                        <div className="flex items-center gap-5">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl text-white shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg,${bank.from},${bank.to})`,
                                                    boxShadow: `0 6px 24px ${bank.glow}`,
                                                }}
                                            >
                                                <Building2 size={22} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                        {deposit.bankName}
                                                    </h3>
                                                    <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-widest bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                                                        {deposit.shiftType || 'Shift'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-400 dark:text-slate-500 flex-wrap">
                                                    <span className="flex items-center gap-1.5 font-semibold">
                                                        <UserCheck size={13} />
                                                        {deposit.staffName}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarDays size={13} />
                                                        {fmtDate(deposit.shiftDate)}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={13} />
                                                        {fmtTime(deposit.timestamp)}
                                                    </span>
                                                    {deposit.depositSlipNumber && (
                                                        <span className="flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-slate-400">
                                                            <FileText size={10} /> Slip:{' '}
                                                            {deposit.depositSlipNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0">
                                            <div className="text-right">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                                    Deposited
                                                </p>
                                                <p
                                                    className="text-2xl font-black font-mono mt-0.5"
                                                    style={{ color: bank.from }}
                                                >
                                                    {fmtShort(deposit.amount)}
                                                </p>
                                                {deposit.accountNumber && (
                                                    <p className="text-xs font-mono text-gray-400 dark:text-slate-600 mt-0.5">
                                                        Acct: ···{deposit.accountNumber.slice(-4)}
                                                    </p>
                                                )}
                                            </div>
                                            <motion.button
                                                animate={{ rotate: isExp ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                                onClick={() =>
                                                    setExpanded(isExp ? null : deposit.id)
                                                }
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-slate-700 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all"
                                            >
                                                <ChevronDown size={18} />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Expandable detail */}
                                    <AnimatePresence>
                                        {isExp && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden border-t border-gray-100 dark:border-white/[0.06] px-6 py-4 bg-gray-50/50 dark:bg-white/[0.01]"
                                            >
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {[
                                                        { label: 'Bank', val: deposit.bankName },
                                                        {
                                                            label: 'Account No',
                                                            val: deposit.accountNumber || '—',
                                                        },
                                                        {
                                                            label: 'Slip No',
                                                            val: deposit.depositSlipNumber || '—',
                                                        },
                                                        {
                                                            label: 'Shift ID',
                                                            val: deposit.shiftId || '—',
                                                        },
                                                    ].map(f => (
                                                        <div key={f.label}>
                                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600">
                                                                {f.label}
                                                            </p>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
                                                                {f.val}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* ═══ ADD DEPOSIT MODAL ═══ */}
            <AnimatePresence>
                {addOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setAddOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={spring}
                            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.1]"
                            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
                        >
                            {/* Modal header */}
                            <div
                                className="relative overflow-hidden px-7 py-6 border-b border-gray-100 dark:border-white/[0.08]"
                                style={{ background: 'linear-gradient(135deg,#0c4a6e,#075985)' }}
                            >
                                <div
                                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15"
                                    style={{
                                        background: 'radial-gradient(circle,white,transparent 70%)',
                                    }}
                                />
                                <div className="flex items-center justify-between relative">
                                    <div>
                                        <p className="text-sm font-black text-white/60 uppercase tracking-widest">
                                            Record Transaction
                                        </p>
                                        <h2 className="text-2xl font-black text-white mt-0.5">
                                            New Bank Deposit
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setAddOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all"
                                    >
                                        <X size={17} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-7 space-y-5">
                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Amount (₨) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400 dark:text-slate-600">
                                            ₨
                                        </span>
                                        <input
                                            type="number"
                                            autoFocus
                                            value={depAmt}
                                            onChange={e => setDepAmt(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-10 pr-4 py-4 rounded-2xl text-3xl font-black bg-gray-50 dark:bg-white/[0.05] border-2 border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Bank picker */}
                                <div>
                                    <label className="block text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Destination Bank *
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BANKS.filter(b => b.name !== 'Other').map(b => (
                                            <motion.button
                                                key={b.name}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelBank(b.name)}
                                                className={clsx(
                                                    'py-3 rounded-xl text-sm font-black transition-all border-2',
                                                    selBank === b.name
                                                        ? 'border-transparent text-white shadow-lg'
                                                        : 'border-gray-100 dark:border-white/[0.07] text-gray-500 dark:text-slate-500 bg-gray-50 dark:bg-white/[0.03] hover:border-gray-200'
                                                )}
                                                style={
                                                    selBank === b.name
                                                        ? {
                                                              background: `linear-gradient(135deg,${b.from},${b.to})`,
                                                              boxShadow: `0 4px 16px ${b.glow}`,
                                                          }
                                                        : {}
                                                }
                                            >
                                                {b.name}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Account & Slip */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Account No
                                        </label>
                                        <input
                                            type="text"
                                            value={accNum}
                                            onChange={e => setAccNum(e.target.value)}
                                            placeholder="12345..."
                                            className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-gray-50 dark:bg-white/[0.05] border-2 border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white focus:border-sky-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Slip No
                                        </label>
                                        <input
                                            type="text"
                                            value={slipNum}
                                            onChange={e => setSlipNum(e.target.value)}
                                            placeholder="SLP-..."
                                            className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-gray-50 dark:bg-white/[0.05] border-2 border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white focus:border-sky-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Shift selector */}
                                <div>
                                    <label className="block text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Link to Shift
                                    </label>
                                    <select
                                        value={shiftSel || defaultShift}
                                        onChange={e => setShiftSel(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-base font-semibold bg-gray-50 dark:bg-white/[0.05] border-2 border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white focus:border-sky-500 outline-none transition-all"
                                    >
                                        {shifts.slice(0, 10).map(s => (
                                            <option key={s.shiftId} value={s.shiftId}>
                                                {s.date} — {s.shiftType} ({s.staffName})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="px-7 pb-7 flex gap-3">
                                <button
                                    onClick={() => setAddOpen(false)}
                                    className="flex-1 py-3.5 rounded-2xl text-base font-black text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleAdd}
                                    disabled={!depAmt || parseFloat(depAmt) <= 0}
                                    className="flex-[2] py-3.5 rounded-2xl text-base font-black text-white uppercase tracking-widest shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg,#0284c7,#0891b2)',
                                        boxShadow: '0 6px 24px rgba(2,132,199,0.35)',
                                    }}
                                >
                                    <Landmark size={16} className="inline mr-2" />
                                    Record Deposit
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BankCashPage;
