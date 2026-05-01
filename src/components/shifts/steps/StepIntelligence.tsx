import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { BarChart3, Flame, Layers, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import { WizardCard } from './WizardCard';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function fmt(n: number, d = 2) {
    return n.toLocaleString('en-PK', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtShort(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return fmt(n, 0);
}

const FUEL_COLORS: Record<
    string,
    { from: string; to: string; text: string; bg: string; border: string }
> = {
    PETROL_92: {
        from: '#f59e0b',
        to: '#d97706',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
    },
    PETROL_95: {
        from: '#f97316',
        to: '#ea580c',
        text: 'text-orange-700 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        border: 'border-orange-200 dark:border-orange-500/20',
    },
    DIESEL: {
        from: '#06b6d4',
        to: '#0891b2',
        text: 'text-cyan-700 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
        border: 'border-cyan-200 dark:border-cyan-500/20',
    },
    HSD: {
        from: '#8b5cf6',
        to: '#7c3aed',
        text: 'text-violet-700 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-500/10',
        border: 'border-violet-200 dark:border-violet-500/20',
    },
    CNG: {
        from: '#10b981',
        to: '#059669',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
    },
};
const FUEL_LABELS: Record<string, string> = {
    PETROL_92: 'Petrol 92',
    PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel',
    HSD: 'HSD',
    CNG: 'CNG',
};

export const StepIntelligence: React.FC<StepProps> = ({ data }) => {
    const readings = data?.readings || [];

    // ── Real Calculations (from actual nozzle readings) ────────────────────
    const totalRevenue = readings.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalLiters = readings.reduce((s, r) => s + (r.netLiters || 0), 0);
    // Cost = costPrice per liter × liters sold (uses actual tank cost price, no estimation)
    const totalCost = readings.reduce((s, r) => {
        const liters = r.netLiters || 0;
        const costPrice = r.costPrice || 0;
        return s + costPrice * liters;
    }, 0);
    const grossProfit = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const avgRate = totalLiters > 0 ? totalRevenue / totalLiters : 0;

    // Per-fuel type breakdown
    const byFuel = readings.reduce<
        Record<
            string,
            {
                liters: number;
                revenue: number;
                cost: number;
                nozzles: string[];
            }
        >
    >((acc, r) => {
        if (!acc[r.fuelType]) acc[r.fuelType] = { liters: 0, revenue: 0, cost: 0, nozzles: [] };
        acc[r.fuelType].liters += r.netLiters || 0;
        acc[r.fuelType].revenue += r.revenue || 0;
        acc[r.fuelType].cost += (r.costPrice || 0) * (r.netLiters || 0);
        if (!acc[r.fuelType].nozzles.includes(r.nozzleName))
            acc[r.fuelType].nozzles.push(r.nozzleName);
        return acc;
    }, {});

    const maxRevenue = Math.max(...Object.values(byFuel).map(v => v.revenue), 1);
    const maxLiters = Math.max(...Object.values(byFuel).map(v => v.liters), 1);

    // Top-selling fuel
    const topFuel = Object.entries(byFuel).sort((a, b) => b[1].revenue - a[1].revenue)[0];

    const kpis = [
        {
            label: 'Total Revenue',
            value: '₨ ' + fmtShort(totalRevenue),
            full: '₨ ' + fmt(totalRevenue),
            icon: TrendingUp,
            color: '#10b981',
            light: 'bg-emerald-50 border-emerald-200',
            dark: 'dark:bg-emerald-500/10 dark:border-emerald-500/20',
            text: 'text-emerald-700 dark:text-emerald-400',
        },
        {
            label: 'Total Volume',
            value: fmtShort(totalLiters) + ' L',
            full: fmt(totalLiters) + ' L',
            icon: Layers,
            color: '#06b6d4',
            light: 'bg-cyan-50 border-cyan-200',
            dark: 'dark:bg-cyan-500/10 dark:border-cyan-500/20',
            text: 'text-cyan-700 dark:text-cyan-400',
        },
        {
            label: 'Gross Profit',
            value: '₨ ' + fmtShort(grossProfit),
            full: '₨ ' + fmt(grossProfit),
            icon: Flame,
            color: grossProfit >= 0 ? '#8b5cf6' : '#ef4444',
            light: grossProfit >= 0 ? 'bg-violet-50 border-violet-200' : 'bg-red-50 border-red-200',
            dark:
                grossProfit >= 0
                    ? 'dark:bg-violet-500/10 dark:border-violet-500/20'
                    : 'dark:bg-red-500/10 dark:border-red-500/20',
            text:
                grossProfit >= 0
                    ? 'text-violet-700 dark:text-violet-400'
                    : 'text-red-700 dark:text-red-400',
        },
        {
            label: 'Profit Margin',
            value: marginPct.toFixed(1) + '%',
            full: marginPct.toFixed(2) + '%',
            icon: Target,
            color: '#f59e0b',
            light: 'bg-amber-50 border-amber-200',
            dark: 'dark:bg-amber-500/10 dark:border-amber-500/20',
            text: 'text-amber-700 dark:text-amber-400',
        },
        {
            label: 'Avg. Sale Rate',
            value: '₨ ' + fmt(avgRate, 0) + '/L',
            full: '₨ ' + fmt(avgRate),
            icon: BarChart3,
            color: '#06b6d4',
            light: 'bg-sky-50 border-sky-200',
            dark: 'dark:bg-sky-500/10 dark:border-sky-500/20',
            text: 'text-sky-700 dark:text-sky-400',
        },
        {
            label: 'Nozzles Active',
            value: readings.filter(r => (r.netLiters || 0) > 0).length + ' / ' + readings.length,
            full: readings.filter(r => (r.netLiters || 0) > 0).length + ' active',
            icon: Zap,
            color: '#f97316',
            light: 'bg-orange-50 border-orange-200',
            dark: 'dark:bg-orange-500/10 dark:border-orange-500/20',
            text: 'text-orange-700 dark:text-orange-400',
        },
    ];

    const noData = readings.length === 0 || totalLiters === 0;

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 py-3">
            {noData ? (
                <motion.div variants={fadeUp} className="py-20 text-center">
                    <BarChart3
                        size={48}
                        className="mx-auto text-gray-200 dark:text-slate-700 mb-4"
                    />
                    <p className="text-base font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest">
                        No Reading Data Yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-700 mt-1">
                        Complete Step 2 (Telemetry) with nozzle readings to see intelligence
                        metrics.
                    </p>
                </motion.div>
            ) : (
                <>
                    {/* ── KPI Grid 2×3 ── */}
                    <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {kpis.map(k => (
                            <WizardCard
                                key={k.label}
                                className={clsx('border', k.light, k.dark, '!p-4')}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                    style={{ background: `${k.color}18` }}
                                >
                                    <k.icon size={16} style={{ color: k.color }} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                    {k.label}
                                </p>
                                <p
                                    className={clsx('text-xl font-black font-mono mt-1', k.text)}
                                    title={k.full}
                                >
                                    {k.value}
                                </p>
                            </WizardCard>
                        ))}
                    </motion.div>

                    {/* ── Top Performer ── */}
                    {topFuel && (
                        <motion.div variants={fadeUp}>
                            <WizardCard
                                accent={`linear-gradient(90deg,${FUEL_COLORS[topFuel[0]]?.from || '#6366f1'},${FUEL_COLORS[topFuel[0]]?.to || '#8b5cf6'})`}
                                glowColor={`${FUEL_COLORS[topFuel[0]]?.from || '#6366f1'}18`}
                                className="!p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg,${FUEL_COLORS[topFuel[0]]?.from || '#6366f1'},${FUEL_COLORS[topFuel[0]]?.to || '#8b5cf6'})`,
                                            boxShadow: `0 6px 20px ${FUEL_COLORS[topFuel[0]]?.from || '#6366f1'}40`,
                                        }}
                                    >
                                        <Flame size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                            Top Earner This Shift
                                        </p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                                            {FUEL_LABELS[topFuel[0]] || topFuel[0]}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                            Revenue
                                        </p>
                                        <p
                                            className="text-2xl font-black font-mono"
                                            style={{
                                                color: FUEL_COLORS[topFuel[0]]?.from || '#6366f1',
                                            }}
                                        >
                                            ₨{fmtShort(topFuel[1].revenue)}
                                        </p>
                                    </div>
                                </div>
                            </WizardCard>
                        </motion.div>
                    )}

                    {/* ── Per-Fuel Breakdown ── */}
                    {Object.keys(byFuel).length > 0 && (
                        <motion.div variants={fadeUp}>
                            <WizardCard noPad>
                                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-2">
                                    <BarChart3 size={15} className="text-indigo-500" />
                                    <p className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                        Revenue by Fuel Type
                                    </p>
                                </div>
                                <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                                    {Object.entries(byFuel)
                                        .sort((a, b) => b[1].revenue - a[1].revenue)
                                        .map(([ft, vals]) => {
                                            const fc = FUEL_COLORS[ft] || {
                                                from: '#6366f1',
                                                to: '#8b5cf6',
                                                text: 'text-indigo-700 dark:text-indigo-400',
                                                bg: 'bg-indigo-50 dark:bg-indigo-500/10',
                                                border: 'border-indigo-200',
                                            };
                                            const revPct = (vals.revenue / maxRevenue) * 100;
                                            const literPct = (vals.liters / maxLiters) * 100;
                                            const fuelProfit = vals.revenue - vals.cost;
                                            return (
                                                <div key={ft} className="px-5 py-4">
                                                    {/* Header row */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                style={{ background: fc.from }}
                                                            />
                                                            <span className="text-base font-black text-gray-900 dark:text-white">
                                                                {FUEL_LABELS[ft] || ft}
                                                            </span>
                                                            <span
                                                                className={clsx(
                                                                    'text-[10px] font-black uppercase px-2 py-0.5 rounded-md',
                                                                    fc.bg,
                                                                    fc.border,
                                                                    fc.text
                                                                )}
                                                            >
                                                                {vals.nozzles.length} nozzle
                                                                {vals.nozzles.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p
                                                                className={clsx(
                                                                    'text-lg font-black font-mono',
                                                                    fc.text
                                                                )}
                                                            >
                                                                ₨{fmtShort(vals.revenue)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Stats row */}
                                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                                        <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04]">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 leading-none">
                                                                Volume
                                                            </p>
                                                            <p className="text-sm font-black font-mono text-gray-900 dark:text-white mt-1">
                                                                {fmt(vals.liters, 0)} L
                                                            </p>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04]">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 leading-none">
                                                                Profit
                                                            </p>
                                                            <p
                                                                className={clsx(
                                                                    'text-sm font-black font-mono mt-1',
                                                                    fuelProfit >= 0
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-red-600 dark:text-red-400'
                                                                )}
                                                            >
                                                                {fuelProfit >= 0 ? '+' : ''}₨
                                                                {fmtShort(fuelProfit)}
                                                            </p>
                                                        </div>
                                                        <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04]">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 leading-none">
                                                                Rev %
                                                            </p>
                                                            <p className="text-sm font-black font-mono text-gray-900 dark:text-white mt-1">
                                                                {revPct.toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* Revenue bar */}
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 w-10 shrink-0">
                                                            Rev
                                                        </span>
                                                        <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    background: `linear-gradient(90deg,${fc.from},${fc.to})`,
                                                                }}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${revPct}%` }}
                                                                transition={{
                                                                    duration: 0.9,
                                                                    ease: 'easeOut',
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black font-mono text-gray-700 dark:text-slate-300 w-14 text-right shrink-0">
                                                            ₨{fmtShort(vals.revenue)}
                                                        </span>
                                                    </div>
                                                    {/* Volume bar */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 w-10 shrink-0">
                                                            Vol
                                                        </span>
                                                        <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    background:
                                                                        'linear-gradient(90deg,#06b6d4,#0891b2)',
                                                                }}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${literPct}%` }}
                                                                transition={{
                                                                    duration: 0.9,
                                                                    ease: 'easeOut',
                                                                    delay: 0.1,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black font-mono text-gray-700 dark:text-slate-300 w-14 text-right shrink-0">
                                                            {fmt(vals.liters, 0)} L
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </WizardCard>
                        </motion.div>
                    )}

                    {/* ── Performance Signal ── */}
                    <motion.div variants={fadeUp}>
                        <WizardCard className="!p-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                        marginPct >= 10
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                            : marginPct >= 5
                                              ? 'bg-amber-100 dark:bg-amber-500/20'
                                              : 'bg-red-100 dark:bg-red-500/20'
                                    )}
                                >
                                    {marginPct >= 5 ? (
                                        <TrendingUp
                                            size={18}
                                            className={
                                                marginPct >= 10
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-amber-600 dark:text-amber-400'
                                            }
                                        />
                                    ) : (
                                        <TrendingDown
                                            size={18}
                                            className="text-red-600 dark:text-red-400"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                        Performance Signal
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-base font-black mt-0.5',
                                            marginPct >= 10
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : marginPct >= 5
                                                  ? 'text-amber-700 dark:text-amber-400'
                                                  : 'text-red-700 dark:text-red-400'
                                        )}
                                    >
                                        {marginPct >= 10
                                            ? '✓ Strong Margin — Excellent shift performance'
                                            : marginPct >= 5
                                              ? '◑ Average Margin — Consider cost review'
                                              : marginPct >= 0
                                                ? '⚠ Tight Margin — Check pricing or costs'
                                                : '✗ Negative Margin — Immediate review needed'}
                                    </p>
                                </div>
                            </div>
                        </WizardCard>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};
