/**
 * DashboardKit — Enterprise UI Primitives
 * All components follow an 8px spacing grid, layered elevation system,
 * GPU-accelerated animations, and micro-interactions on every element.
 */
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

/* ─── Elevation tokens ───────────────────────────────────────── */
export const E = {
    flat: 'shadow-none',
    sm: 'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)]',
    md: 'shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]',
    lg: 'shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)]',
    xl: 'shadow-[0_16px_48px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)]',
    focus: 'ring-2 ring-blue-500/30 ring-offset-1',
};

/* ─── Colour palettes ────────────────────────────────────────── */
export type Hue =
    | 'blue'
    | 'cyan'
    | 'indigo'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'violet'
    | 'sky'
    | 'slate';
export const H: Record<
    Hue,
    { a: string; b: string; g: string; light: string; text: string; badge: string }
> = {
    blue: {
        a: '#1d4ed8',
        b: '#0ea5e9',
        g: 'rgba(29,78,216,.3)',
        light: 'rgba(29,78,216,.07)',
        text: '#1d4ed8',
        badge: 'bg-blue-50 text-blue-700 border border-blue-100',
    },
    cyan: {
        a: '#0891b2',
        b: '#06b6d4',
        g: 'rgba(8,145,178,.3)',
        light: 'rgba(8,145,178,.07)',
        text: '#0891b2',
        badge: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    },
    indigo: {
        a: '#4338ca',
        b: '#6366f1',
        g: 'rgba(67,56,202,.3)',
        light: 'rgba(67,56,202,.07)',
        text: '#4338ca',
        badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    },
    emerald: {
        a: '#059669',
        b: '#10b981',
        g: 'rgba(5,150,105,.3)',
        light: 'rgba(5,150,105,.07)',
        text: '#059669',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    },
    amber: {
        a: '#d97706',
        b: '#f59e0b',
        g: 'rgba(217,119,6,.3)',
        light: 'rgba(217,119,6,.07)',
        text: '#d97706',
        badge: 'bg-amber-50 text-amber-700 border border-amber-100',
    },
    rose: {
        a: '#e11d48',
        b: '#f43f5e',
        g: 'rgba(225,29,72,.25)',
        light: 'rgba(225,29,72,.06)',
        text: '#e11d48',
        badge: 'bg-rose-50 text-rose-700 border border-rose-100',
    },
    violet: {
        a: '#7c3aed',
        b: '#8b5cf6',
        g: 'rgba(124,58,237,.3)',
        light: 'rgba(124,58,237,.07)',
        text: '#7c3aed',
        badge: 'bg-violet-50 text-violet-700 border border-violet-100',
    },
    sky: {
        a: '#0284c7',
        b: '#38bdf8',
        g: 'rgba(2,132,199,.3)',
        light: 'rgba(2,132,199,.07)',
        text: '#0284c7',
        badge: 'bg-sky-50 text-sky-700 border border-sky-100',
    },
    slate: {
        a: '#475569',
        b: '#64748b',
        g: 'rgba(71,85,105,.2)',
        light: 'rgba(71,85,105,.06)',
        text: '#475569',
        badge: 'bg-slate-50 text-slate-700 border border-slate-200',
    },
};

/* ─── Formatters ─────────────────────────────────────────────── */
export const fmt = (n: number) => n.toLocaleString('en-PK', { maximumFractionDigits: 0 });
export const fmtK = (n: number) =>
    n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
          ? `${(n / 1_000).toFixed(1)}K`
          : fmt(n);

/* ─── RAF counter hook ───────────────────────────────────────── */
export function useCounter(target: number, ms = 1200) {
    const [v, setV] = useState(0);
    const raf = useRef<number | null>(null);
    useEffect(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - t0) / ms, 1);
            setV(Math.round(target * (1 - (1 - p) ** 4)));
            if (p < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => {
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [target, ms]);
    return v;
}

/* ─── Spring config ──────────────────────────────────────────── */
export const SP = { type: 'spring' as const, stiffness: 420, damping: 34 };
export const FU = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: SP },
};
export const ST = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.03 } },
};

/* ══ Glass card ════════════════════════════════════════════════ */
export const Glass: React.FC<{
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    hover?: boolean;
    onClick?: () => void;
}> = ({ children, className, style, hover, onClick }) => (
    <div
        onClick={onClick}
        className={clsx(
            'relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 transition-all duration-200',
            E.md,
            hover && 'cursor-pointer hover:border-gray-300 hover:' + E.lg,
            className
        )}
        style={style}
    >
        {children}
    </div>
);

/* ══ KPI card ══════════════════════════════════════════════════ */
export interface KIProp {
    label: string;
    raw: number;
    prefix?: string;
    suffix?: string;
    caption: string;
    icon: React.ReactNode;
    hue: Hue;
    idx: number;
    trend?: 'up' | 'down' | 'flat';
    onClick?: () => void;
}
export const KPI: React.FC<KIProp> = ({
    label,
    raw,
    prefix = '',
    suffix = '',
    caption,
    icon,
    hue,
    idx,
    trend = 'flat',
    onClick,
}) => {
    const c = H[hue];
    const v = useCounter(raw);
    return (
        <motion.div
            variants={FU}
            whileHover={{ y: -4, scale: 1.018 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 cursor-pointer group"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.04)' }}
            transition={{ duration: 0.15 }}
        >
            {/* Accent line */}
            <div
                className="h-[3px] rounded-t-2xl"
                style={{ background: `linear-gradient(90deg,${c.a},${c.b})` }}
            />
            {/* Hover bg wash */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: c.light }}
            />
            {/* Glow orb */}
            <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle,${c.g},transparent 70%)` }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.75, 0.45] }}
                transition={{ duration: 4 + idx, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[280%] transition-transform duration-[750ms]" />
            </div>

            <div className="relative p-5 space-y-4">
                <div className="flex items-start justify-between">
                    <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg,${c.a},${c.b})`,
                            boxShadow: `0 4px 14px ${c.g}`,
                        }}
                        whileHover={{ rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 0.4 }}
                    >
                        {icon}
                    </motion.div>
                    <span
                        className={clsx(
                            'flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black',
                            trend === 'up'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : trend === 'down'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : 'bg-gray-50 text-gray-500 border border-gray-100'
                        )}
                    >
                        {trend === 'up' ? (
                            <TrendingUp size={8} />
                        ) : trend === 'down' ? (
                            <TrendingDown size={8} />
                        ) : (
                            <Activity size={8} />
                        )}
                        {caption}
                    </span>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[.18em] text-gray-400 mb-1">
                        {label}
                    </p>
                    <p className="text-[2rem] font-black font-mono text-gray-900 leading-none tabular-nums">
                        {prefix}
                        {fmt(v)}
                        <span className="text-base font-bold text-gray-400 ml-0.5">{suffix}</span>
                    </p>
                </div>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${c.a},${c.b})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, 22 + idx * 20)}%` }}
                        transition={{
                            duration: 1.2,
                            delay: idx * 0.1,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

/* ══ SVG ring gauge ════════════════════════════════════════════ */
export const Ring: React.FC<{
    name: string;
    label: string;
    pct: number;
    level: number;
    cap: number;
    color: string;
    glow: string;
    delay?: number;
}> = ({ name, label, pct, level, cap, color, glow, delay = 0 }) => {
    const R = 38,
        C = 2 * Math.PI * R;
    const isLow = pct < 25;
    return (
        <motion.div
            whileHover={{ scale: 1.06, y: -4 }}
            transition={SP}
            className="flex flex-col items-center gap-2 group cursor-pointer"
        >
            <div className="relative w-28 h-28">
                {/* Ambient glow */}
                <motion.div
                    className="absolute inset-2 rounded-full blur-xl pointer-events-none"
                    style={{ background: glow, opacity: 0.3 }}
                    animate={{ opacity: isLow ? [0.3, 0.6, 0.3] : [0.25, 0.4, 0.25] }}
                    transition={{ duration: isLow ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <svg viewBox="0 0 84 84" className="w-28 h-28 -rotate-90 drop-shadow-md">
                    {/* Track */}
                    <circle
                        cx="42"
                        cy="42"
                        r={R}
                        fill="none"
                        stroke="rgba(0,0,0,.06)"
                        strokeWidth="7"
                    />
                    {/* Fill */}
                    <motion.circle
                        cx="42"
                        cy="42"
                        r={R}
                        fill="none"
                        stroke={color}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        initial={{ strokeDashoffset: C }}
                        animate={{ strokeDashoffset: C - (pct / 100) * C }}
                        transition={{ duration: 1.6, delay, ease: [0.34, 1, 0.64, 1] }}
                        style={{ filter: `drop-shadow(0 0 5px ${glow})` }}
                    />
                </svg>
                {/* Centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-base font-black font-mono tabular-nums" style={{ color }}>
                        {pct}%
                    </span>
                    {isLow && (
                        <motion.div
                            animate={{ opacity: [1, 0.1, 1] }}
                            transition={{ duration: 0.7, repeat: Infinity }}
                        >
                            <AlertTriangle size={10} className="text-rose-500" />
                        </motion.div>
                    )}
                </div>
            </div>
            <div className="text-center space-y-0.5">
                <p className="text-xs font-black text-gray-800 leading-tight">{name}</p>
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>
                    {label}
                </p>
                <p className="text-[9px] font-mono text-gray-400">
                    {fmt(level)} / {fmt(cap)} L
                </p>
            </div>
        </motion.div>
    );
};

/* ══ Quick command tile ════════════════════════════════════════ */
export const CMD: React.FC<{
    emoji: string;
    label: string;
    sub: string;
    hue: Hue;
    onClick: () => void;
}> = ({ emoji, label, sub, hue, onClick }) => {
    const c = H[hue];
    return (
        <motion.button
            whileHover={{ x: 3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative overflow-hidden rounded-xl p-3 flex items-center gap-3 w-full text-left group transition-all duration-150 bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/25"
        >
            {/* Left accent bar */}
            <div
                className="absolute left-0 inset-y-0 w-[3px] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: `linear-gradient(${c.a},${c.b})` }}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[380%] transition-transform duration-[650ms]" />
            </div>
            {/* Hover wash */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: c.light }}
            />
            {/* Icon */}
            <div
                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base relative shadow-sm"
                style={{
                    background: `linear-gradient(135deg,${c.a},${c.b})`,
                    boxShadow: `0 3px 10px ${c.g}`,
                }}
            >
                {emoji}
            </div>
            <div className="flex-1 min-w-0 relative">
                <p className="text-sm font-black text-gray-800 leading-tight truncate">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate font-medium">{sub}</p>
            </div>
            <motion.div
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative"
                style={{ color: c.a }}
                animate={{}}
                whileHover={{ x: 2 }}
            >
                <ArrowRight size={13} />
            </motion.div>
        </motion.button>
    );
};

/* ══ Chart tooltip ═════════════════════════════════════════════ */
export const ChartTip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-xl text-xs backdrop-blur-sm">
            <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                {label}
            </p>
            {payload.map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: e.color || e.stroke }}
                    />
                    <span className="font-black text-gray-800">
                        {e.name === 'rev' ? `₨${fmt(e.value)}` : `${fmt(e.value)} L`}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ══ Section header ════════════════════════════════════════════ */
export const SH: React.FC<{
    icon: React.ReactNode;
    hue: Hue;
    title: string;
    sub?: string;
    right?: React.ReactNode;
}> = ({ icon, hue, title, sub, right }) => {
    const c = H[hue];
    return (
        <div className="flex items-center gap-3 mb-5">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                    background: `linear-gradient(135deg,${c.a},${c.b})`,
                    boxShadow: `0 4px 12px ${c.g}`,
                }}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-gray-900 leading-tight">{title}</h3>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{sub}</p>}
            </div>
            {right}
        </div>
    );
};

/* ══ Pill stat ═════════════════════════════════════════════════ */
export const Pill: React.FC<{ hue: Hue; children: React.ReactNode }> = ({ hue, children }) => (
    <span
        className={clsx(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black',
            H[hue].badge
        )}
    >
        {children}
    </span>
);
