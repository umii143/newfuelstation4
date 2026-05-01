import { useAuthStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useCashBankStore } from '@/stores/ledgerStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Banknote,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    History,
    PlayCircle,
    Search,
    Shield,
    TrendingDown,
    TrendingUp,
    X,
    Zap,
    BrainCircuit,
    Fingerprint,
    LineChart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
    }).format(n);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

const varianceClass = (v: number) => {
    if (Math.abs(v) < 0.01) return 'text-emerald-600';
    if (v > 0) return 'text-blue-600';
    return 'text-rose-600';
};
const varianceLabel = (v: number) => {
    if (Math.abs(v) < 0.01) return 'Perfectly Reconciled ✓';
    if (v > 0) return `Surplus: ${fmt(Math.abs(v))}`;
    return `Shortfall: ${fmt(Math.abs(v))}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

const CashReconciliation: React.FC = () => {
    const { settings } = useAuthStore();
    const isCNG = settings.businessUnit === 'CNG';
    
    const fuelStore = useFuelStore();
    const cngStore = useCNGStore();
    
    const shifts = isCNG ? cngStore.shifts : fuelStore.shifts;
    const { accounts, getAccountBalance } = useCashBankStore();

    const [enteredCash, setEnteredCash] = useState('');
    const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLive, setShowLive] = useState(false);

    // ── Build reconciliation history from closed shifts ────────────────────
    const closedShifts = useMemo(
        () =>
            [...shifts]
                .filter(s => s.status === 'CLOSED')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [shifts]
    );

    const filteredShifts = useMemo(
        () =>
            closedShifts.filter(
                s =>
                    s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.shiftId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.date.includes(searchQuery)
            ),
        [closedShifts, searchQuery]
    );

    // ── Live reconciliation for the most recent open shift ────────────────
    const activeShift = useMemo(() => shifts.find(s => s.status === 'OPEN') ?? null, [shifts]);

    // expectedCash not directly on Shift — derive it as: totalRevenue - expenses - credits
    const expectedCash = activeShift
        ? activeShift.totalRevenue - activeShift.expenses - activeShift.credits
        : 0;
    const physicalCash = parseFloat(enteredCash) || 0;
    const variance = physicalCash - expectedCash;

    const cashAccount = accounts.find(a => a.type === 'CASH' && a.status === 'ACTIVE');
    const cashBalance = cashAccount ? getAccountBalance(cashAccount.accountId) : 0;

    // ── Helper: colour badge based on recorded variance in closed shifts ──
    const shiftVarianceBadge = (shift: (typeof closedShifts)[0]) => {
        const v = shift.variance ?? 0;
        if (Math.abs(v) < 1)
            return {
                label: '100% Match',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            };
        if (v > 0)
            return { label: `+${fmt(v)}`, color: 'text-blue-600 bg-blue-50 border-blue-200' };
        return { label: fmt(v), color: 'text-rose-600 bg-rose-50 border-rose-200' };
    };

    // ── Summary stats ─────────────────────────────────────────────────────
    const last30 = closedShifts.slice(0, 30);
    const discrepancies = last30.filter(s => Math.abs(s.variance ?? 0) >= 100);
    const totalVariance = last30.reduce((sum, s) => sum + Math.abs(s.variance ?? 0), 0);

    // ── AI Intelligence (Phase 6) ─────────────────────────────────────────
    const aiIntelligence = useMemo(() => {
        // 1. ML-Style Risk Scoring
        // Compute standard deviation of variance
        const variances = closedShifts.map(s => Math.abs(s.variance ?? 0));
        const meanVar = variances.length > 0 ? variances.reduce((a, b) => a + b, 0) / variances.length : 0;
        const sqDiffs = variances.map(v => Math.pow(v - meanVar, 2));
        const stdDev = sqDiffs.length > 0 ? Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / sqDiffs.length) : 0;
        
        const riskScoredShifts = closedShifts.slice(0, 50).map(s => {
            const varAbs = Math.abs(s.variance ?? 0);
            let score = 0; // 0-100
            if (varAbs === 0) score = 0;
            else if (varAbs < 100) score = 10;
            else if (stdDev > 0) {
                // How many std devs away from mean?
                const zScore = (varAbs - meanVar) / stdDev;
                score = Math.min(99, Math.max(20, Math.round(50 + (zScore * 20))));
            } else {
                score = 50;
            }
            return {
                ...s,
                riskScore: score,
                riskLevel: score > 75 ? 'CRITICAL' : score > 50 ? 'HIGH' : score > 20 ? 'ELEVATED' : 'LOW'
            };
        });

        const highRisk = riskScoredShifts.filter(s => s.riskScore > 50).slice(0, 3);

        // 2. Cash Flow Prognostics
        // Calculate 7-day moving average of Cash In vs Cash Out
        const last7Days = closedShifts.filter(s => new Date(s.date).getTime() > Date.now() - 7 * 24 * 3600000);
        const avgDailyActualCash = last7Days.reduce((sum, s) => sum + (s.actualCash ?? 0), 0) / 7;
        const avgDailyExpenses = last7Days.reduce((sum, s) => sum + (s.expenses ?? 0), 0) / 7;
        
        const projectedCashBuffer7Days = cashBalance + (avgDailyActualCash * 7) - (avgDailyExpenses * 7);

        return {
            highRisk,
            overallRiskProfile: highRisk.length > 2 ? 'HIGH' : highRisk.length > 0 ? 'ELEVATED' : 'STABLE',
            avgDailyActualCash,
            avgDailyExpenses,
            projectedCashBuffer7Days
        };
    }, [closedShifts, cashBalance]);

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Cash Reconciliation
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Theft &amp; Loss Detection Protocol — {closedShifts.length} shifts on record
                    </p>
                </div>
                {activeShift && (
                    <button
                        onClick={() => setShowLive(v => !v)}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg shadow-emerald-200 font-bold uppercase tracking-wide text-xs"
                    >
                        <PlayCircle size={18} />
                        {showLive ? 'Hide Live Check' : 'Run Live Reconciliation'}
                    </button>
                )}
            </div>

            {/* ── Summary KPIs ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Cash in Hand',
                        value: fmt(cashBalance),
                        icon: Banknote,
                        color: 'from-emerald-500 to-teal-500',
                        sub: `${accounts.filter(a => a.type === 'CASH').length} cash account(s)`,
                    },
                    {
                        label: 'Shifts Reconciled',
                        value: closedShifts.length.toString(),
                        icon: CheckCircle2,
                        color: 'from-blue-500 to-indigo-500',
                        sub: `${discrepancies.length} discrepanc${discrepancies.length === 1 ? 'y' : 'ies'} in last 30`,
                    },
                    {
                        label: 'Total Variance (30)',
                        value: fmt(totalVariance),
                        icon: discrepancies.length > 0 ? TrendingDown : TrendingUp,
                        color:
                            discrepancies.length > 0
                                ? 'from-rose-500 to-rose-600'
                                : 'from-emerald-500 to-teal-500',
                        sub: discrepancies.length > 0 ? 'Requires attention' : 'All clear ✓',
                    },
                ].map(item => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gradient-to-br ${item.color} rounded-3xl p-6 text-white shadow-xl`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <item.icon size={28} className="opacity-80" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                            {item.label}
                        </p>
                        <p className="text-2xl font-black mt-1">{item.value}</p>
                        <p className="text-xs opacity-70 mt-1">{item.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── AI Intelligence Prognostics (Phase 6) ── */}
            <AnimatePresence>
                {closedShifts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* ML Risk Scoring Panel */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl overflow-hidden relative">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                                    <Fingerprint size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                                        Behavioral Risk Engine <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">AI ACTIVE</span>
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Standard deviation anomaly mapping</p>
                                </div>
                            </div>

                            {aiIntelligence.highRisk.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                                    <p className="text-xs font-bold text-gray-600">Zero High-Risk Behaviors Detected</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {aiIntelligence.highRisk.map((s, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${s.riskScore > 75 ? 'bg-rose-50/50 border-rose-100' : 'bg-orange-50/50 border-orange-100'}`}>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{s.staffName}</p>
                                                <p className="text-[10px] text-gray-500">{fmtDate(s.date)} · Shift {s.shiftId.slice(-4)}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[10px] font-black tracking-wider ${s.riskScore > 75 ? 'text-rose-600' : 'text-orange-600'}`}>
                                                        {s.riskLevel}
                                                    </span>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${s.riskScore > 75 ? 'bg-rose-500' : 'bg-orange-500'}`}>
                                                        {s.riskScore}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cash Flow Prognostics Panel */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl overflow-hidden relative">
                            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <LineChart size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                                        Cash Flow Prognostics <span className="text-[9px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">ML MODEL</span>
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-medium">7-Day liquidity projection</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-gray-50 rounded-2xl border border-emerald-100/50">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <ArrowUpRight size={10} className="text-emerald-500" /> Avg Daily In
                                    </p>
                                    <p className="text-sm font-black text-gray-800 mt-0.5">{fmt(aiIntelligence.avgDailyActualCash)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-rose-100/50">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <ArrowDownRight size={10} className="text-rose-500" /> Avg Daily Out
                                    </p>
                                    <p className="text-sm font-black text-gray-800 mt-0.5">{fmt(aiIntelligence.avgDailyExpenses)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-inner relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-[20px]" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-1">
                                    Projected 7-Day Physical Cash Buffer
                                </p>
                                <div className="flex items-end justify-between">
                                    <p className="text-2xl font-black">{fmt(aiIntelligence.projectedCashBuffer7Days)}</p>
                                    <BrainCircuit size={28} className="text-blue-200 opacity-60" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Live Reconciliation Panel ── */}
            <AnimatePresence>
                {showLive && activeShift && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                    <Zap size={20} className="text-amber-500" />
                                    Active Shift Snapshot
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold animate-pulse">
                                        LIVE
                                    </span>
                                    <button onClick={() => setShowLive(false)}>
                                        <X
                                            size={20}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase">
                                                Shift
                                            </p>
                                            <p className="font-black text-gray-900 mt-1">
                                                {activeShift.shiftType} — {activeShift.staffName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {fmtDate(activeShift.date)}
                                            </p>
                                        </div>
                                        <Shield className="text-blue-400 opacity-30" size={40} />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase">
                                                System Expected Cash
                                            </p>
                                            <p className="text-3xl font-black text-blue-800 mt-1">
                                                {fmt(expectedCash)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                            Enter Physical Cash Count
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 font-bold">PKR</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={enteredCash}
                                                onChange={e => setEnteredCash(e.target.value)}
                                                className="flex-1 text-2xl font-black text-gray-900 bg-transparent outline-none border-b-2 border-gray-200 focus:border-emerald-500 transition-colors pb-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        className={`p-6 rounded-2xl border-2 transition-all ${
                                            enteredCash === ''
                                                ? 'border-gray-200 bg-gray-50'
                                                : Math.abs(variance) < 1
                                                  ? 'border-emerald-500 bg-emerald-50'
                                                  : variance > 0
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-rose-500 bg-rose-50'
                                        }`}
                                    >
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                            Variance
                                        </p>
                                        {enteredCash === '' ? (
                                            <p className="text-gray-400 font-medium text-sm">
                                                Enter physical count to see variance
                                            </p>
                                        ) : (
                                            <>
                                                <p
                                                    className={`text-3xl font-black ${varianceClass(variance)}`}
                                                >
                                                    {variance >= 0 ? '+' : ''}
                                                    {fmt(variance)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    {Math.abs(variance) < 1 ? (
                                                        <CheckCircle2
                                                            className="text-emerald-600"
                                                            size={20}
                                                        />
                                                    ) : variance > 0 ? (
                                                        <TrendingUp
                                                            className="text-blue-600"
                                                            size={20}
                                                        />
                                                    ) : (
                                                        <AlertCircle
                                                            className="text-rose-600"
                                                            size={20}
                                                        />
                                                    )}
                                                    <span
                                                        className={`font-bold text-sm ${varianceClass(variance)}`}
                                                    >
                                                        {varianceLabel(variance)}
                                                    </span>
                                                </div>
                                                {Math.abs(variance) >= 100 && (
                                                    <p className="text-xs text-rose-600 mt-2 font-medium">
                                                        ⚠ Significant discrepancy — Investigation
                                                        required
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {
                                                label: 'Total Revenue',
                                                value: fmt(activeShift.totalRevenue),
                                            },
                                            {
                                                label: 'Expenses',
                                                value: fmt(activeShift.expenses ?? 0),
                                            },
                                            {
                                                label: 'Credits Issued',
                                                value: fmt(activeShift.credits ?? 0),
                                            },
                                            {
                                                label: 'Recoveries',
                                                value: fmt(activeShift.recoveries ?? 0),
                                            },
                                        ].map(item => (
                                            <div
                                                key={item.label}
                                                className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                                            >
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {item.label}
                                                </p>
                                                <p className="text-sm font-black text-gray-800 mt-0.5">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── No Active Shift Message ── */}
            {!activeShift && (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3">
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                    <p className="text-sm font-medium text-amber-700">
                        No active shift is currently open. Close a shift first to generate
                        reconciliation data.
                    </p>
                </div>
            )}

            {/* ── History ── */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <History size={18} /> Reconciliation History ({closedShifts.length})
                    </h3>
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search staff, date..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-emerald-500 transition-colors w-56"
                        />
                    </div>
                </div>

                {filteredShifts.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2 size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No closed shifts found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Close a fuel shift to start building reconciliation history
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {filteredShifts.map((shift, idx) => {
                            const badge = shiftVarianceBadge(shift);
                            const isExpanded = activeShiftId === shift.shiftId;
                            return (
                                <motion.div
                                    key={shift.shiftId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border border-gray-100 rounded-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            setActiveShiftId(isExpanded ? null : shift.shiftId)
                                        }
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    Math.abs(shift.variance ?? 0) < 1
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-rose-100 text-rose-600'
                                                }`}
                                            >
                                                {Math.abs(shift.variance ?? 0) < 1 ? (
                                                    <CheckCircle2 size={20} />
                                                ) : (
                                                    <AlertCircle size={20} />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-800">
                                                    {shift.shiftType} — {shift.staffName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {fmtDate(shift.date)} · ID:{' '}
                                                    {shift.shiftId.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`text-xs font-black px-3 py-1 rounded-lg border ${badge.color}`}
                                            >
                                                {badge.label}
                                            </span>
                                            {isExpanded ? (
                                                <ChevronDown size={16} className="text-gray-400" />
                                            ) : (
                                                <ChevronRight size={16} className="text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-gray-100 bg-gray-50"
                                            >
                                                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {[
                                                        {
                                                            label: 'Total Revenue',
                                                            value: fmt(shift.totalRevenue),
                                                        },
                                                        {
                                                            label: 'Expected Cash',
                                                            value: fmt(
                                                                shift.totalRevenue -
                                                                    shift.expenses -
                                                                    shift.credits
                                                            ),
                                                        },
                                                        {
                                                            label: 'Actual Cash',
                                                            value: fmt(shift.actualCash ?? 0),
                                                        },
                                                        {
                                                            label: 'Variance',
                                                            value: `${(shift.variancePercentage ?? 0).toFixed(2)}%`,
                                                        },
                                                        {
                                                            label: 'Total Expenses',
                                                            value: fmt(shift.expenses ?? 0),
                                                        },
                                                        {
                                                            label: 'Credit Sales',
                                                            value: fmt(shift.credits ?? 0),
                                                        },
                                                        {
                                                            label: 'Recoveries',
                                                            value: fmt(shift.recoveries ?? 0),
                                                        },
                                                        {
                                                            label: 'Bank Deposits',
                                                            value: fmt(shift.bankDeposits ?? 0),
                                                        },
                                                    ].map(item => (
                                                        <div
                                                            key={item.label}
                                                            className="p-3 bg-white rounded-xl border border-gray-100"
                                                        >
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-sm font-black text-gray-800 mt-0.5">
                                                                {item.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {shift.notes && (
                                                    <div className="px-4 pb-4">
                                                        <p className="text-xs text-gray-500 italic bg-white rounded-xl p-3 border border-gray-100">
                                                            📝 {shift.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Discrepancy Alert ── */}
            {discrepancies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-xl"
                >
                    <div className="flex items-center gap-3 mb-3 text-rose-600">
                        <AlertCircle size={24} />
                        <h3 className="font-black uppercase tracking-wider text-sm">
                            Critical Discrepancies — Last 30 Shifts
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {discrepancies.slice(0, 3).map(s => (
                            <div
                                key={s.shiftId}
                                className="flex justify-between items-center text-sm"
                            >
                                <span className="text-rose-700 font-medium">
                                    {s.staffName} · {fmtDate(s.date)}
                                </span>
                                <span className="font-black text-rose-600">
                                    {fmt(s.variance ?? 0)}
                                </span>
                            </div>
                        ))}
                        {discrepancies.length > 3 && (
                            <p className="text-xs text-rose-500 mt-2">
                                +{discrepancies.length - 3} more discrepancies found
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {discrepancies.length === 0 && closedShifts.length > 0 && (
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 flex items-center gap-3 shadow-xl">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <div>
                        <h3 className="font-black text-emerald-700 text-sm uppercase tracking-wide">
                            System Healthy
                        </h3>
                        <p className="text-sm text-emerald-600 mt-0.5">
                            No significant discrepancies detected in the last{' '}
                            {Math.min(closedShifts.length, 30)} shifts.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashReconciliation;
