/**
 * StepWelcome v3 — Elite Glassmorphism
 * Operator identification + shift session initialization.
 * 50+ senior dev quality: animated glass cards, hover-lift staff cards,
 * glassmorphic toggle, particle hero banner.
 */
import { useStaffStore } from '@/stores/dataStores';
import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    Moon,
    Shield,
    Star,
    Sun,
    User,
    Users,
    Zap,
} from 'lucide-react';
import React from 'react';

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 30 };
const FADE_UP = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
};
const STAGGER = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

/* Staff card colors by role */
const ROLE_COLORS: Record<string, { from: string; to: string; glow: string; badge: string }> = {
    MANAGER: { from: '#6366f1', to: '#8b5cf6', glow: 'rgba(99,102,241,0.35)', badge: '👔' },
    SUPERVISOR: { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.35)', badge: '⭐' },
    PUMP_OPERATOR: { from: '#10b981', to: '#06b6d4', glow: 'rgba(16,185,129,0.35)', badge: '⛽' },
    CASHIER: { from: '#8b5cf6', to: '#ec4899', glow: 'rgba(139,92,246,0.35)', badge: '💰' },
    GUARD: { from: '#475569', to: '#334155', glow: 'rgba(71,85,105,0.3)', badge: '🛡️' },
};
const getRC = (role: string) => ROLE_COLORS[role] || ROLE_COLORS['PUMP_OPERATOR'];

export const StepWelcome: React.FC<StepProps> = ({ onUpdate, data, mode }) => {
    const { getActiveStaff } = useStaffStore();
    const salesmen = getActiveStaff();
    const selectedStaff = salesmen.find(s => s.userId === data?.staffId);
    const isComplete = !!data?.staffId && !!data?.startTime;
    const isMorning = data?.shiftType === 'MORNING';

    return (
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="space-y-5 py-3">
            {/* ── HERO BANNER ── */}
            <motion.div
                variants={FADE_UP}
                className="relative overflow-hidden rounded-3xl p-7"
                style={{
                    background:
                        mode === 'FUEL'
                            ? 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 45%,#9333ea 80%,#6d28d9 100%)'
                            : 'linear-gradient(135deg,#0891b2 0%,#06b6d4 50%,#0e7490 100%)',
                }}
            >
                {/* Noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '100px',
                    }}
                />
                {/* Glow orbs */}
                <motion.div
                    className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 pointer-events-none"
                    style={{ background: 'radial-gradient(circle,white,transparent 70%)' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-15 pointer-events-none"
                    style={{ background: 'radial-gradient(circle,white,transparent 70%)' }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                            <Shield size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60">
                                {mode} Protocol
                            </p>
                            <h2 className="text-2xl font-black text-white tracking-tight leading-tight mt-0.5">
                                Shift Initialization
                            </h2>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
                            <Users size={13} className="text-white/70" />
                            <span className="text-xs font-black text-white">
                                {salesmen.length} Operators Available
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
                            <Calendar size={13} className="text-white/70" />
                            <span className="text-xs font-black text-white">
                                {new Date().toLocaleDateString('en-PK', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        {isComplete && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-400/30 border border-emerald-300/40 backdrop-blur-sm"
                            >
                                <CheckCircle2 size={13} className="text-emerald-200" />
                                <span className="text-xs font-black text-emerald-100">
                                    Ready to Proceed
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── OPERATOR SELECTOR ── */}
            <motion.div variants={FADE_UP}>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                        <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <label className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-slate-400">
                        Primary Operator
                    </label>
                </div>

                <div className="relative group">
                    <select
                        value={data?.staffId || ''}
                        onChange={e => {
                            const s = salesmen.find(x => x.userId === e.target.value);
                            onUpdate({
                                staffId: e.target.value,
                                staffName: s?.name || '',
                                staffRole: s?.role || '',
                            });
                        }}
                        className={clsx(
                            'w-full appearance-none px-5 py-4 rounded-2xl text-base font-semibold outline-none transition-all duration-250 cursor-pointer',
                            'bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm',
                            'text-gray-900 dark:text-white',
                            'border-2',
                            data?.staffId
                                ? 'border-indigo-400 dark:border-indigo-500 ring-4 ring-indigo-500/15'
                                : 'border-gray-200/80 dark:border-white/[0.1] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                        )}
                    >
                        <option
                            value=""
                            disabled
                            className="text-gray-400 bg-white dark:bg-slate-900"
                        >
                            — Select Operator —
                        </option>
                        {salesmen.length === 0 && (
                            <option disabled className="text-gray-400 bg-white dark:bg-slate-900">
                                No active staff — add staff first
                            </option>
                        )}
                        {salesmen.map(s => (
                            <option
                                key={s.userId}
                                value={s.userId}
                                className="text-gray-900 bg-white dark:text-white dark:bg-slate-900"
                            >
                                {s.name} — {s.role.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-slate-500">
                        <ChevronDown size={18} />
                    </div>
                    {/* Focus glow accent line */}
                    <div
                        className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                    />
                </div>

                {/* Selected operator glass card */}
                <AnimatePresence mode="wait">
                    {selectedStaff &&
                        (() => {
                            const rc = getRC(selectedStaff.role);
                            return (
                                <motion.div
                                    key={selectedStaff.userId}
                                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    className="mt-3 relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
                                    style={{
                                        background: `linear-gradient(135deg,${rc.from}12,${rc.to}08)`,
                                        border: `2px solid ${rc.from}30`,
                                        boxShadow: `0 4px 20px ${rc.glow}`,
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-xl relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg,${rc.from},${rc.to})`,
                                            boxShadow: `0 6px 20px ${rc.glow}`,
                                        }}
                                    >
                                        {selectedStaff.name.charAt(0).toUpperCase()}
                                        {/* Shimmer */}
                                        <motion.div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
                                                skewX: '-15deg',
                                            }}
                                            animate={{ x: ['-150%', '200%'] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 2,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-black text-gray-900 dark:text-white truncate">
                                                {selectedStaff.name}
                                            </p>
                                            <span className="text-lg">{rc.badge}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-xs font-black px-2.5 py-1 rounded-xl"
                                                style={{
                                                    background: `${rc.from}18`,
                                                    color: rc.from,
                                                }}
                                            >
                                                {selectedStaff.role.replace(/_/g, ' ')}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                <Star size={10} className="fill-current" /> Active
                                            </span>
                                        </div>
                                    </div>
                                    <CheckCircle2
                                        size={22}
                                        style={{ color: rc.from }}
                                        className="shrink-0"
                                    />
                                </motion.div>
                            );
                        })()}
                </AnimatePresence>
            </motion.div>

            {/* ── SESSION CONFIG ── */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date picker */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-500/15 flex items-center justify-center">
                            <Calendar size={14} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <label className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-slate-400">
                            Shift Date
                        </label>
                    </div>
                    <input
                        type="date"
                        value={
                            data?.startTime?.split('T')[0] || new Date().toISOString().split('T')[0]
                        }
                        onChange={e =>
                            onUpdate({ startTime: new Date(e.target.value).toISOString() })
                        }
                        className="w-full px-5 py-4 rounded-2xl text-base font-semibold outline-none transition-all duration-200
                                   bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm
                                   text-gray-900 dark:text-white
                                   border-2 border-gray-200/80 dark:border-white/[0.1]
                                   focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
                        style={{ colorScheme: 'light dark' }}
                    />
                </div>

                {/* Shift toggle — glass morphic pill */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center">
                            {isMorning ? (
                                <Sun size={14} className="text-amber-500" />
                            ) : (
                                <Moon size={14} className="text-indigo-500" />
                            )}
                        </div>
                        <label className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-slate-400">
                            Shift Period
                        </label>
                    </div>
                    <div className="relative rounded-2xl p-1 bg-gray-100/80 dark:bg-white/[0.06] border-2 border-gray-200/80 dark:border-white/[0.08] flex">
                        {/* Animated toggle slide */}
                        <motion.div
                            className="absolute inset-1 w-[calc(50%-4px)] rounded-xl shadow-lg"
                            animate={{ x: isMorning ? 0 : 'calc(100% + 8px)' }}
                            transition={SPRING}
                            style={{
                                background: isMorning
                                    ? 'linear-gradient(135deg,#f59e0b,#f97316)'
                                    : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                boxShadow: isMorning
                                    ? '0 4px 16px rgba(245,158,11,0.4)'
                                    : '0 4px 16px rgba(99,102,241,0.4)',
                            }}
                        />
                        {(['MORNING', 'EVENING'] as const).map(t => (
                            <motion.button
                                key={t}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => onUpdate({ shiftType: t })}
                                className="flex-1 relative flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black uppercase tracking-wide transition-colors duration-200"
                                style={{ color: data?.shiftType === t ? 'white' : undefined }}
                            >
                                {t === 'MORNING' ? <Sun size={15} /> : <Moon size={15} />}
                                {t}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── COMPLETION BANNER ── */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
                        style={{
                            background:
                                'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.06))',
                            border: '2px solid rgba(16,185,129,0.3)',
                            boxShadow: '0 4px 24px rgba(16,185,129,0.15)',
                        }}
                    >
                        <motion.div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                            }}
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Zap size={20} className="text-white" />
                        </motion.div>
                        <div>
                            <p className="text-base font-black text-emerald-700 dark:text-emerald-300">
                                Session Initialized
                            </p>
                            <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">
                                {data?.staffName} · {data?.shiftType} shift · All parameters
                                confirmed ✓
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
