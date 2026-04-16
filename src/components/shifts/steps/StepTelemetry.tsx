import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { CheckCircle2, Cpu, Droplets, TrendingUp } from 'lucide-react';
import React from 'react';
import { GlassNozzleCard, WizardCard } from './WizardCard';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: spring } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const FUEL_META: Record<
    string,
    {
        label: string;
        from: string;
        to: string;
        glow: string;
        accentLight: string; // light-mode tint bg
        accentDark: string; // dark-mode tint
        textLight: string;
        textDark: string;
        barFrom: string;
        barTo: string;
    }
> = {
    PETROL_92: {
        label: 'Petrol 92',
        from: '#f59e0b',
        to: '#d97706',
        glow: 'rgba(245,158,11,0.18)',
        accentLight: 'bg-amber-50',
        accentDark: 'dark:bg-amber-500/10',
        textLight: 'text-amber-700',
        textDark: 'dark:text-amber-400',
        barFrom: '#f59e0b',
        barTo: '#fcd34d',
    },
    PETROL_95: {
        label: 'Petrol 95',
        from: '#f97316',
        to: '#ea580c',
        glow: 'rgba(249,115,22,0.18)',
        accentLight: 'bg-orange-50',
        accentDark: 'dark:bg-orange-500/10',
        textLight: 'text-orange-700',
        textDark: 'dark:text-orange-400',
        barFrom: '#f97316',
        barTo: '#fb923c',
    },
    DIESEL: {
        label: 'Diesel',
        from: '#06b6d4',
        to: '#0891b2',
        glow: 'rgba(6,182,212,0.18)',
        accentLight: 'bg-cyan-50',
        accentDark: 'dark:bg-cyan-500/10',
        textLight: 'text-cyan-700',
        textDark: 'dark:text-cyan-400',
        barFrom: '#06b6d4',
        barTo: '#67e8f9',
    },
    HSD: {
        label: 'HSD',
        from: '#8b5cf6',
        to: '#7c3aed',
        glow: 'rgba(139,92,246,0.18)',
        accentLight: 'bg-violet-50',
        accentDark: 'dark:bg-violet-500/10',
        textLight: 'text-violet-700',
        textDark: 'dark:text-violet-400',
        barFrom: '#8b5cf6',
        barTo: '#c4b5fd',
    },
    CNG: {
        label: 'CNG',
        from: '#10b981',
        to: '#059669',
        glow: 'rgba(16,185,129,0.18)',
        accentLight: 'bg-emerald-50',
        accentDark: 'dark:bg-emerald-500/10',
        textLight: 'text-emerald-700',
        textDark: 'dark:text-emerald-400',
        barFrom: '#10b981',
        barTo: '#6ee7b7',
    },
};

function fmt(n: number, d = 2) {
    return n.toLocaleString('en-PK', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export const StepTelemetry: React.FC<StepProps> = ({ onUpdate, data }) => {
    const readings = data?.readings || [];

    const totalRevenue = readings.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalLiters = readings.reduce((s, r) => s + (r.netLiters || 0), 0);
    const maxLiters = Math.max(...readings.map(r => r.netLiters || 0), 1);

    const updateReading = (nozzleId: string, closing: number) => {
        onUpdate({
            readings: readings.map(r => {
                if (r.nozzleId !== nozzleId) return r;
                const net = Math.max(0, closing - r.opening - (r.test || 0));
                return { ...r, closing, netLiters: net, revenue: net * (r.rate || 0) };
            }),
        });
    };
    const updateTest = (nozzleId: string, test: number) => {
        onUpdate({
            readings: readings.map(r => {
                if (r.nozzleId !== nozzleId) return r;
                const net = Math.max(0, (r.closing || 0) - r.opening - test);
                return { ...r, test, netLiters: net, revenue: net * (r.rate || 0) };
            }),
        });
    };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 py-3">
            {/* ── Live Cockpit KPIs ── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                {/* Volume */}
                <motion.div
                    whileHover={{ scale: 1.04, y: -3 }}
                    className="relative overflow-hidden rounded-2xl p-5"
                    style={{
                        background: 'linear-gradient(135deg,#0284c7,#0891b2,#06b6d4)',
                        boxShadow: '0 8px 32px rgba(6,182,212,0.4)',
                    }}
                >
                    <motion.div
                        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle,white,transparent 70%)' }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-3">
                            <Droplets size={18} className="text-white" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/60">
                            Total Volume
                        </p>
                        <p className="text-3xl font-black font-mono text-white mt-1 leading-none">
                            {totalLiters.toFixed(0)}
                            <span className="text-lg font-bold text-white/60 ml-1">L</span>
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                            {readings.length} nozzle{readings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </motion.div>

                {/* Revenue */}
                <motion.div
                    whileHover={{ scale: 1.04, y: -3 }}
                    className="relative overflow-hidden rounded-2xl p-5"
                    style={{
                        background: 'linear-gradient(135deg,#059669,#10b981,#34d399)',
                        boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
                    }}
                >
                    <motion.div
                        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle,white,transparent 70%)' }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-3">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/60">
                            Est. Revenue
                        </p>
                        <p className="text-2xl font-black font-mono text-white mt-1 leading-none">
                            ₨{Math.round(totalRevenue).toLocaleString()}
                        </p>
                        <p className="text-xs text-white/50 mt-1">Live compute · no commit yet</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── Per-Nozzle Visual Bar Summary ── */}
            {readings.length > 0 && (
                <motion.div variants={fadeUp}>
                    <WizardCard noPad accent="linear-gradient(90deg, #6366f1, #8b5cf6)">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                Nozzle Volume Comparison
                            </p>
                        </div>
                        <div className="px-4 py-3 space-y-3">
                            {readings.map(r => {
                                const meta = FUEL_META[r.fuelType] || FUEL_META['DIESEL'];
                                const net = r.netLiters || 0;
                                const pct = (net / maxLiters) * 100;
                                return (
                                    <div key={r.nozzleId}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ background: meta.from }}
                                                />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                                    {r.nozzleName}
                                                </span>
                                                <span
                                                    className={clsx(
                                                        'text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md',
                                                        meta.accentLight,
                                                        meta.accentDark,
                                                        meta.textLight,
                                                        meta.textDark
                                                    )}
                                                >
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={clsx(
                                                        'text-sm font-black font-mono',
                                                        net > 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-gray-300 dark:text-slate-700'
                                                    )}
                                                >
                                                    {fmt(net, 0)} L
                                                </span>
                                                {net > 0 && (
                                                    <CheckCircle2
                                                        size={11}
                                                        className="text-emerald-500 shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${meta.barFrom}, ${meta.barTo})`,
                                                }}
                                                initial={{ width: 0 }}
                                                animate={{ width: net > 0 ? `${pct}%` : '0%' }}
                                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </WizardCard>
                </motion.div>
            )}

            {/* ── No nozzles state ── */}
            {readings.length === 0 && (
                <motion.div
                    variants={fadeUp}
                    className="py-16 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/[0.08]"
                >
                    <Cpu size={52} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                    <p className="text-base font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest">
                        No Nozzles Configured
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-700 mt-1">
                        Add tanks and nozzles in Fuel/CNG Settings first.
                    </p>
                </motion.div>
            )}

            {/* ── GlassNozzleCards ── */}
            {readings.map((r, idx) => {
                const m = FUEL_META[r.fuelType] || FUEL_META['DIESEL'];
                return (
                    <motion.div key={r.nozzleId} variants={fadeUp}>
                        <GlassNozzleCard
                            name={r.nozzleName}
                            fuelType={m.label}
                            fuelColor={m.from}
                            fuelGlow={m.glow}
                            opening={r.opening}
                            closing={r.closing || 0}
                            test={r.test || 0}
                            netLiters={r.netLiters || 0}
                            revenue={r.revenue || 0}
                            rate={r.rate || 0}
                            index={idx}
                            onClosingChange={v => updateReading(r.nozzleId, v)}
                            onTestChange={v => updateTest(r.nozzleId, v)}
                        />
                    </motion.div>
                );
            })}
        </motion.div>
    );
};
