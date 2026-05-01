/**
 * WizardCard Design System v3.0
 * Elite Glassmorphism — Advanced animated layered glass, 3D depth,
 * shimmer sweeps, glowing orbs, and premium micro-interactions.
 *
 * 50+ senior dev standard — every primitive is production-grade.
 */

import clsx from 'clsx';
import { motion } from 'framer-motion';
import React from 'react';

/* ─── Shared Animation Tokens ─────────────────────────────────────── */
export const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 };
export const SPRING_SLOW = { type: 'spring' as const, stiffness: 200, damping: 24 };

/* ══════════════════════════════════════════════════════════════════════
   WizardCard — Elite glassmorphic card shell
   ══════════════════════════════════════════════════════════════════════ */
interface WizardCardProps {
    children: React.ReactNode;
    className?: string;
    accent?: string; // gradient CSS string for top-edge accent bar
    glowColor?: string; // rgba glow for drop-shadow
    noPad?: boolean;
    shimmer?: boolean; // enable shimmer sweep on hover
    orbColor?: string; // bg-orb accent colour (rgba)
    interactive?: boolean; // add scale/hover lift
}

export const WizardCard: React.FC<WizardCardProps> = ({
    children,
    className,
    accent,
    glowColor,
    noPad,
    shimmer = false,
    orbColor,
    interactive = false,
}) => {
    const Wrapper = interactive ? motion.div : ('div' as any);
    const motionProps = interactive
        ? { whileHover: { scale: 1.015, y: -2 }, transition: SPRING }
        : {};
    return (
        <Wrapper
            {...motionProps}
            className={clsx(
                'relative rounded-[20px] overflow-hidden group',
                /* Multi-layer glassmorphism */
                'bg-white/[0.82] dark:bg-white/[0.05]',
                'backdrop-blur-2xl',
                /* Premium border — soft inner glow on light, bright edge on dark */
                'border border-white/70 dark:border-white/[0.1]',
                !noPad && 'p-6',
                interactive && 'cursor-pointer',
                className
            )}
            style={{
                boxShadow: [
                    /* Outer depth */
                    '0 2px 4px rgba(0,0,0,0.03)',
                    '0 6px 24px rgba(0,0,0,0.07)',
                    '0 20px 60px rgba(0,0,0,0.08)',
                    /* Inner glass highlight */
                    'inset 0 1px 0 rgba(255,255,255,0.9)',
                    'inset 0 -1px 0 rgba(0,0,0,0.04)',
                    /* Optional glow */
                    glowColor ? `0 0 48px ${glowColor}` : '',
                ]
                    .filter(Boolean)
                    .join(', '),
            }}
        >
            {/* ── Animated background orb ── */}
            {orbColor && (
                <motion.div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle,${orbColor},transparent 70%)` }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}

            {/* ── Top accent bar ── */}
            {accent && (
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] z-10"
                    style={{ background: accent }}
                />
            )}

            {/* ── Shimmer sweep on hover ── */}
            {shimmer && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-in-out pointer-events-none">
                    <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                </div>
            )}

            {/* ── Inner dark-mode glass layer ── */}
            <div className="absolute inset-0 rounded-[20px] dark:bg-gradient-to-br dark:from-white/[0.03] dark:to-transparent pointer-events-none" />

            <div className="relative z-10">{children}</div>
        </Wrapper>
    );
};

/* ══════════════════════════════════════════════════════════════════════
   WizardSection — thematic inner grouping with premium header
   ══════════════════════════════════════════════════════════════════════ */
interface WizardSectionProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    titleIcon?: React.ReactNode;
    titleColor?: string;
    accentColor?: string;
}
export const WizardSection: React.FC<WizardSectionProps> = ({
    children,
    className,
    title,
    titleIcon,
    titleColor,
    accentColor,
}) => (
    <div
        className={clsx('rounded-2xl overflow-hidden', className)}
        style={
            accentColor
                ? { border: `1px solid ${accentColor}25` }
                : { border: '1px solid rgba(0,0,0,0.06)' }
        }
    >
        {title && (
            <div
                className="flex items-center gap-2.5 px-4 py-3 border-b border-white/40 dark:border-white/[0.06]"
                style={{ background: accentColor ? `${accentColor}10` : 'rgba(0,0,0,0.02)' }}
            >
                {titleIcon}
                <p
                    className={clsx(
                        'text-xs font-black uppercase tracking-widest',
                        titleColor || 'text-gray-500 dark:text-slate-400'
                    )}
                >
                    {title}
                </p>
            </div>
        )}
        {children}
    </div>
);

/* ══════════════════════════════════════════════════════════════════════
   StatBadge — glowing numeric highlight with animated entrance
   ══════════════════════════════════════════════════════════════════════ */
interface StatBadgeProps {
    label: string;
    value: string;
    variant?: 'emerald' | 'cyan' | 'indigo' | 'amber' | 'red' | 'violet' | 'rose' | 'default';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}
const VM: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    emerald: {
        bg: 'bg-emerald-50/80 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200/80 dark:border-emerald-500/25',
        glow: 'shadow-emerald-500/20',
    },
    cyan: {
        bg: 'bg-cyan-50/80 dark:bg-cyan-500/15',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200/80 dark:border-cyan-500/25',
        glow: 'shadow-cyan-500/20',
    },
    indigo: {
        bg: 'bg-indigo-50/80 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200/80 dark:border-indigo-500/25',
        glow: 'shadow-indigo-500/20',
    },
    amber: {
        bg: 'bg-amber-50/80 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200/80 dark:border-amber-500/25',
        glow: 'shadow-amber-500/20',
    },
    red: {
        bg: 'bg-red-50/80 dark:bg-red-500/15',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200/80 dark:border-red-500/25',
        glow: 'shadow-red-500/20',
    },
    violet: {
        bg: 'bg-violet-50/80 dark:bg-violet-500/15',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200/80 dark:border-violet-500/25',
        glow: 'shadow-violet-500/20',
    },
    rose: {
        bg: 'bg-rose-50/80 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200/80 dark:border-rose-500/25',
        glow: 'shadow-rose-500/20',
    },
    default: {
        bg: 'bg-white/60 dark:bg-white/[0.06]',
        text: 'text-gray-700 dark:text-slate-300',
        border: 'border-gray-200/80 dark:border-white/[0.1]',
        glow: 'shadow-gray-300/20',
    },
};

export const StatBadge: React.FC<StatBadgeProps> = ({
    label,
    value,
    variant = 'default',
    size = 'md',
    glow = false,
}) => {
    const v = VM[variant] || VM.default;
    return (
        <div
            className={clsx(
                'rounded-2xl border px-4 py-3 flex flex-col gap-1 backdrop-blur-sm',
                v.bg,
                v.border,
                glow && `shadow-lg ${v.glow}`
            )}
        >
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                {label}
            </p>
            <p
                className={clsx(
                    'font-black font-mono leading-tight',
                    v.text,
                    size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'
                )}
            >
                {value}
            </p>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════
   QuickInput — premium glass input with animated focus ring + label
   ══════════════════════════════════════════════════════════════════════ */
interface QuickInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    unit?: string;
    accent?: string;
    helperText?: string;
    error?: string;
}
export const QuickInput: React.FC<QuickInputProps> = ({
    label,
    unit,
    accent,
    helperText,
    error,
    className,
    ...rest
}) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 leading-none">
                {label}
            </label>
        )}
        <div className="relative group">
            <input
                {...rest}
                onWheel={(e) => {
                    if (rest.type === 'number') e.currentTarget.blur();
                    if (rest.onWheel) rest.onWheel(e);
                }}
                className={clsx(
                    'w-full px-4 py-3.5 rounded-xl text-base font-black font-mono outline-none transition-all duration-200',
                    'bg-white/70 dark:bg-white/[0.07]',
                    'backdrop-blur-sm',
                    'text-gray-900 dark:text-white',
                    error
                        ? 'border-2 border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                        : 'border-2 border-gray-200/80 dark:border-white/[0.1] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15',
                    'placeholder:text-gray-300 dark:placeholder:text-slate-700',
                    unit && 'pr-14',
                    className
                )}
            />
            {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 dark:text-slate-500 pointer-events-none">
                    {unit}
                </span>
            )}
            {/* Focus glow line at bottom */}
            <div
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                style={{ background: accent || 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
            />
        </div>
        {error && <p className="text-xs font-black text-red-500">{error}</p>}
        {helperText && !error && (
            <p className="text-xs text-gray-400 dark:text-slate-600 font-medium">{helperText}</p>
        )}
    </div>
);

/* ══════════════════════════════════════════════════════════════════════
   QuickSelect — elite themed select with animated chevron
   ══════════════════════════════════════════════════════════════════════ */
interface QuickSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    children: React.ReactNode;
    accentColor?: string;
}
export const QuickSelect: React.FC<QuickSelectProps> = ({
    label,
    children,
    className,
    accentColor,
    ...rest
}) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400 leading-none">
                {label}
            </label>
        )}
        <div className="relative group">
            <select
                {...rest}
                className={clsx(
                    'w-full appearance-none px-4 py-3.5 pr-10 rounded-xl text-base font-semibold outline-none transition-all duration-200 cursor-pointer',
                    'bg-white/70 dark:bg-white/[0.07]',
                    'backdrop-blur-sm',
                    'text-gray-900 dark:text-white',
                    'border-2 border-gray-200/80 dark:border-white/[0.1]',
                    'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15',
                    className
                )}
            >
                {children}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-slate-500 transition-transform duration-200 group-focus-within:rotate-180">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════
   InlineFormPanel — animated slide-in inline sub-form
   ══════════════════════════════════════════════════════════════════════ */
interface InlineFormPanelProps {
    visible: boolean;
    title: string;
    icon?: React.ReactNode;
    accentColor?: string;
    children: React.ReactNode;
}
export const InlineFormPanel: React.FC<InlineFormPanelProps> = ({
    visible,
    title,
    icon,
    accentColor = '#6366f1',
    children,
}) => {
    if (!visible) return null;
    return (
        <div
            className="rounded-2xl overflow-hidden backdrop-blur-sm"
            style={{
                border: `2px solid ${accentColor}35`,
                background: `linear-gradient(135deg,${accentColor}08,transparent)`,
                boxShadow: `0 4px 24px ${accentColor}15`,
            }}
        >
            <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{
                    background: `${accentColor}12`,
                    borderBottom: `1px solid ${accentColor}20`,
                }}
            >
                {icon}
                <p
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: accentColor }}
                >
                    {title}
                </p>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════
   GlassNozzleCard — premium animated nozzle reading card for StepTelemetry
   ══════════════════════════════════════════════════════════════════════ */
interface GlassNozzleCardProps {
    name: string;
    fuelType: string;
    fuelColor: string;
    fuelGlow: string;
    opening: number;
    closing: number;
    test: number;
    netLiters: number;
    revenue: number;
    rate: number;
    onClosingChange: (v: number) => void;
    onTestChange: (v: number) => void;
    index: number;
}

export const GlassNozzleCard: React.FC<GlassNozzleCardProps> = ({
    name,
    fuelType,
    fuelColor,
    fuelGlow,
    opening,
    closing,
    test,
    netLiters,
    revenue,
    rate,
    onClosingChange,
    onTestChange,
    index,
}) => {
    const [closingStr, setClosingStr] = React.useState(closing === 0 ? '' : closing.toString());
    const [testStr, setTestStr] = React.useState(test === 0 ? '' : test.toString());

    React.useEffect(() => {
        if (closing !== parseFloat(closingStr || '0')) {
            setClosingStr(closing === 0 ? '' : closing.toString());
        }
    }, [closing]);

    React.useEffect(() => {
        if (test !== parseFloat(testStr || '0')) {
            setTestStr(test === 0 ? '' : test.toString());
        }
    }, [test]);

    const handleClosingChange = (val: string) => {
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setClosingStr(val);
            const num = parseFloat(val);
            if (!isNaN(num)) onClosingChange(num);
            else if (val === '') onClosingChange(0);
        }
    };

    const handleTestChange = (val: string) => {
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setTestStr(val);
            const num = parseFloat(val);
            if (!isNaN(num)) onTestChange(num);
            else if (val === '') onTestChange(0);
        }
    };

    const isValid = closing >= opening;
    const pct = Math.min(100, netLiters > 0 ? Math.min(100, (netLiters / 1000) * 100) : 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING, delay: index * 0.07 }}
            whileHover={{ y: -4, boxShadow: `0 16px 48px ${fuelGlow}` }}
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${fuelColor}30`,
                boxShadow: `0 4px 24px ${fuelGlow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
            }}
        >
            {/* Dark mode override */}
            <div className="absolute inset-0 dark:bg-white/[0.04] rounded-2xl pointer-events-none" />

            {/* Top gradient accent */}
            <div
                className="h-[3px] rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${fuelColor}, ${fuelColor}80)` }}
            />

            {/* Animated orb */}
            <motion.div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle,${fuelGlow},transparent 70%)` }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p
                            className="text-xs font-black uppercase tracking-widest"
                            style={{ color: fuelColor }}
                        >
                            {fuelType.replace('_', ' ')}
                        </p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                            {name}
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                            Rate
                        </p>
                        <p className="text-lg font-black font-mono" style={{ color: fuelColor }}>
                            ₨{rate}
                        </p>
                    </div>
                </div>

                {/* Reading inputs */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1.5">
                            Opening
                        </p>
                        <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08]">
                            <p className="text-base font-black font-mono text-gray-400 dark:text-slate-500">
                                {opening.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1.5">
                            Closing *
                        </p>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={closingStr}
                            onChange={e => handleClosingChange(e.target.value)}
                            placeholder="0.00"
                            className={clsx(
                                'w-full px-3 py-2.5 rounded-xl text-base font-black font-mono outline-none transition-all',
                                'bg-white/90 dark:bg-white/[0.07] backdrop-blur-sm',
                                'text-gray-900 dark:text-white',
                                'placeholder:text-gray-300 dark:placeholder:text-slate-700',
                                !isValid && closing > 0
                                    ? 'border-2 border-red-400 focus:ring-4 focus:ring-red-400/20'
                                    : 'border-2 border-gray-200/80 dark:border-white/[0.1] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                            )}
                        />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1.5">
                            Test (L)
                        </p>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={testStr}
                            onChange={e => handleTestChange(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 rounded-xl text-base font-black font-mono outline-none transition-all bg-white/90 dark:bg-white/[0.07] backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-700 border-2 border-gray-200/80 dark:border-white/[0.1] focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
                        />
                    </div>
                </div>

                {/* Live stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div
                        className="rounded-xl px-3 py-2.5"
                        style={{ background: `${fuelColor}10`, border: `1px solid ${fuelColor}25` }}
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                            Net Liters
                        </p>
                        <p
                            className="text-xl font-black font-mono mt-0.5"
                            style={{ color: fuelColor }}
                        >
                            {netLiters.toFixed(2)} L
                        </p>
                    </div>
                    <div
                        className="rounded-xl px-3 py-2.5"
                        style={{
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.25)',
                        }}
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                            Revenue
                        </p>
                        <p className="text-xl font-black font-mono mt-0.5 text-emerald-600 dark:text-emerald-400">
                            ₨{Math.round(revenue).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg,${fuelColor},${fuelColor}80)`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
