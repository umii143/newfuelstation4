/**
 * Dashboard v4 — Elite Glassmorphism Command Center
 * 50+ senior designer quality: animated KPI cards with breathing orbs,
 * fuel tank gauges, recent shift timeline, quick-action command panel,
 * real store data from Zustand stores.
 */
import { useSettingsStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useStaffStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    Clock,
    Droplets,
    Flame,
    Settings,
    Star,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { SkeletonKPI, SkeletonList } from '@/components/shared/skeletons/SkeletonList';
import { Skeleton } from '@/components/ui/Skeleton';

/* ── Animation helpers ──────────────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 360, damping: 28 };
const FADE_UP = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
};
const STAGGER = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ── Palette ────────────────────────────────────────────────────── */
const PALETTE = {
    blue: {
        from: '#6366f1',
        to: '#8b5cf6',
        glow: 'rgba(99,102,241,0.4)',
        light: 'rgba(99,102,241,0.1)',
    },
    emerald: {
        from: '#10b981',
        to: '#34d399',
        glow: 'rgba(16,185,129,0.4)',
        light: 'rgba(16,185,129,0.1)',
    },
    amber: {
        from: '#f59e0b',
        to: '#f97316',
        glow: 'rgba(245,158,11,0.4)',
        light: 'rgba(245,158,11,0.1)',
    },
    rose: {
        from: '#f43f5e',
        to: '#fb7185',
        glow: 'rgba(244,63,94,0.4)',
        light: 'rgba(244,63,94,0.1)',
    },
    cyan: {
        from: '#06b6d4',
        to: '#0891b2',
        glow: 'rgba(6,182,212,0.4)',
        light: 'rgba(6,182,212,0.1)',
    },
    violet: {
        from: '#8b5cf6',
        to: '#a78bfa',
        glow: 'rgba(139,92,246,0.4)',
        light: 'rgba(139,92,246,0.1)',
    },
} as const;
type PaletteKey = keyof typeof PALETTE;

/* ── Fmt helper ─────────────────────────────────────────────────── */
const fmt = (n: number, decimals = 0) =>
    n.toLocaleString('en-PK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/* ══════════════════════════════════════════════════════════════════
   GlassKPICard — animated KPI card with breathing orb
   ══════════════════════════════════════════════════════════════════ */
interface KpiCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    color: PaletteKey;
    index: number;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
}
const GlassKPICard: React.FC<KpiCardProps> = ({
    label,
    value,
    sub,
    icon,
    color,
    index,
    trend = 'neutral',
    onClick,
}) => {
    const p = PALETTE[color];
    return (
        <motion.div
            variants={FADE_UP}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING}
            className="relative overflow-hidden rounded-3xl cursor-pointer group"
            onClick={onClick}
            style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(24px)',
                border: `1.5px solid rgba(255,255,255,0.8)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset`,
            }}
        >
            {/* Dark mode */}
            <div
                className="dark:block hidden absolute inset-0 rounded-3xl"
                style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)' }}
            />

            {/* Animated breathing orb */}
            <motion.div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle,${p.glow},transparent 70%)` }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Top accent bar */}
            <div
                className="h-[2px] rounded-t-3xl"
                style={{ background: `linear-gradient(90deg,${p.from},${p.to})` }}
            />

            {/* Shimmer on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] ease-in-out pointer-events-none">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </div>

            <div className="relative p-6 space-y-4">
                {/* Icon + trend */}
                <div className="flex items-start justify-between">
                    <motion.div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
                        style={{
                            background: `linear-gradient(135deg,${p.from},${p.to})`,
                            boxShadow: `0 6px 20px ${p.glow}`,
                        }}
                        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                    >
                        {icon}
                    </motion.div>
                    <div
                        className={clsx(
                            'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black',
                            trend === 'up'
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : trend === 'down'
                                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                  : 'bg-gray-100/80 dark:bg-white/[0.06] text-gray-500 dark:text-slate-400'
                        )}
                    >
                        {trend === 'up' ? (
                            <TrendingUp size={11} />
                        ) : trend === 'down' ? (
                            <TrendingUp size={11} className="rotate-180" />
                        ) : (
                            <Activity size={11} />
                        )}
                        {sub}
                    </div>
                </div>

                {/* Value */}
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                        {label}
                    </p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none tracking-tight">
                        {value}
                    </p>
                </div>

                {/* Bottom mini progress */}
                <div className="h-1 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${p.from},${p.to})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${25 + index * 18}%` }}
                        transition={{ duration: 1.2, delay: index * 0.15, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   TankGauge — animated circular tank level gauge
   ══════════════════════════════════════════════════════════════════ */
const TankGauge: React.FC<{
    name: string;
    pct: number;
    color: string;
    glow: string;
    level: number;
    cap: number;
}> = ({ name, pct, color, glow, level, cap }) => {
    const r = 32,
        circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const isLow = pct < 25;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={r}
                        fill="none"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth="7"
                    />
                    <motion.circle
                        cx="40"
                        cy="40"
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - dash }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm font-black font-mono" style={{ color }}>
                            {pct}%
                        </p>
                        {isLow && (
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                            >
                                <AlertTriangle size={12} className="text-rose-500 mx-auto" />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-center">
                <p className="text-xs font-black text-gray-900 dark:text-white">{name}</p>
                <p className="text-xs font-mono text-gray-400 dark:text-slate-500">
                    {fmt(level)}L / {fmt(cap)}L
                </p>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════
   QuickAction — premium animated action button
   ══════════════════════════════════════════════════════════════════ */
const QuickAction: React.FC<{
    label: string;
    sub: string;
    emoji: string;
    color: PaletteKey;
    onClick: () => void;
}> = ({ label, sub, emoji, color, onClick }) => {
    const p = PALETTE[color];
    return (
        <motion.button
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
            onClick={onClick}
            className="relative w-full overflow-hidden rounded-2xl p-4 flex items-center gap-4 text-left group"
            style={{
                background: `linear-gradient(135deg,${p.from}15,${p.to}08)`,
                border: `1.5px solid ${p.from}30`,
                boxShadow: `0 4px 20px ${p.glow}15`,
            }}
        >
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none">
                <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
            </div>
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg relative"
                style={{
                    background: `linear-gradient(135deg,${p.from},${p.to})`,
                    boxShadow: `0 4px 16px ${p.glow}`,
                }}
            >
                {emoji}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{sub}</p>
            </div>
            <motion.div
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `${p.from}15` }}
            >
                <ArrowUpRight size={14} style={{ color: p.from }} />
            </motion.div>
        </motion.button>
    );
};

/* ══════════════════════════════════════════════════════════════════
   RecentShiftRow — single shift in activity timeline
   ══════════════════════════════════════════════════════════════════ */
const RecentShiftRow: React.FC<{
    staff: string;
    shiftType: string;
    amount: number;
    time: string;
    status: string;
    index: number;
}> = ({ staff, shiftType, amount, time, status, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SPRING, delay: index * 0.07 }}
        className="flex items-center gap-4 py-3 border-b border-gray-100/60 dark:border-white/[0.05] last:border-0"
    >
        <div
            className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black shadow-lg',
                status === 'CLOSED'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
            )}
        >
            {staff.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{staff}</p>
            <div className="flex items-center gap-2 mt-0.5">
                <span
                    className={clsx(
                        'text-xs font-black px-2 py-0.5 rounded-lg',
                        shiftType === 'MORNING'
                            ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    )}
                >
                    {shiftType}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">{time}</span>
            </div>
        </div>
        <div className="text-right shrink-0">
            <p className="text-sm font-black font-mono text-gray-900 dark:text-white">
                ₨{fmt(amount)}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
                {status === 'CLOSED' ? (
                    <CheckCircle2 size={11} className="text-emerald-500" />
                ) : (
                    <Clock size={11} className="text-amber-500" />
                )}
                <span
                    className="text-xs font-black"
                    style={{ color: status === 'CLOSED' ? '#10b981' : '#f59e0b' }}
                >
                    {status}
                </span>
            </div>
        </div>
    </motion.div>
);

/* ══════════════════════════════════════════════════════════════════
   DashboardPage
   ══════════════════════════════════════════════════════════════════ */
interface DashboardPageProps {
    onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
    const { settings } = useSettingsStore();
    const bu = settings.businessUnit;

    const fuelStore = useFuelStore();
    const cngStore = useCNGStore();
    const productStore = useProductStore();
    const staffStore = useStaffStore();
    const salesStore = useSalesStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

    /* ── KPI computation ── */
    let kpis: KpiCardProps[] = [];
    let recentShifts: any[] = [];
    let tanks: typeof fuelStore.tanks = [];
    let quickActions: {
        label: string;
        sub: string;
        emoji: string;
        color: PaletteKey;
        path: string;
    }[] = [];

    if (bu === 'FUEL') {
        const fuelShifts = fuelStore.getFilteredShifts();
        const todayShifts = fuelShifts.filter(s => s.startTime.startsWith(todayStr));
        const closedToday = todayShifts.filter(s => s.status === 'CLOSED');
        const todaySales = closedToday.reduce((a, s) => a + s.totalRevenue, 0);
        
        const activeStaffList = staffStore.getActiveStaff();
        const activeStaff = activeStaffList.length;
        const totalStaff = staffStore.users.filter(u => u.businessUnit === 'FUEL').length;
        
        const totalCap = fuelStore.tanks.reduce((a, t) => a + t.capacity, 0);
        const curLevel = fuelStore.tanks.reduce((a, t) => a + t.currentLevel, 0);
        const tankPct = totalCap ? Math.round((curLevel / totalCap) * 100) : 0;
        tanks = fuelStore.tanks;
        recentShifts = [...fuelShifts]
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 6)
            .map(s => ({
                staff: s.staffName || 'Unknown',
                shiftType: s.shiftType,
                amount: s.totalRevenue,
                time: new Date(s.startTime).toLocaleTimeString('en-PK', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                status: s.status,
            }));

        kpis = [
            {
                label: 'Today Revenue',
                value: `₨${fmt(todaySales)}`,
                sub: `${closedToday.length} Shifts`,
                icon: <TrendingUp size={22} className="text-white" />,
                color: 'blue',
                index: 0,
                trend: todaySales > 0 ? 'up' : 'neutral',
            },
            {
                label: 'Active Staff',
                value: `${activeStaff} / ${totalStaff || 1}`,
                sub: 'Fuel Team',
                icon: <Users size={22} className="text-white" />,
                color: 'emerald',
                index: 1,
                trend: 'neutral',
            },
            {
                label: 'Tank Level',
                value: `${tankPct}%`,
                sub: `${fmt(curLevel)} L`,
                icon: <Droplets size={22} className="text-white" />,
                color: 'amber',
                index: 2,
                trend: tankPct < 25 ? 'down' : 'up',
            },
            {
                label: 'Total Shifts',
                value: `${fuelStore.getFilteredShifts().length}`,
                sub: 'All Time',
                icon: <BarChart3 size={22} className="text-white" />,
                color: 'violet',
                index: 3,
                trend: 'up',
            },
        ];
        quickActions = [
            {
                label: 'Close Fuel Shift',
                sub: 'Record + reconcile pump readings',
                emoji: '⛽',
                color: 'amber',
                path: '/fuel/shifts',
            },
            {
                label: 'View Reports',
                sub: 'Revenue, variance & analytics',
                emoji: '📊',
                color: 'blue',
                path: '/reports',
            },
            {
                label: 'Manage Staff',
                sub: 'Attendance & payroll ledger',
                emoji: '👥',
                color: 'emerald',
                path: '/staff',
            },
            {
                label: 'Bank Deposits',
                sub: 'Cash & bank reconciliation',
                emoji: '🏦',
                color: 'violet',
                path: '/financials/bank',
            },
        ];
    } else if (bu === 'CNG') {
        const cngShifts = cngStore.getFilteredShifts();
        const todayShifts = cngShifts.filter(s => s.startTime.startsWith(todayStr));
        const closedToday = todayShifts.filter(s => s.status === 'CLOSED');
        const todaySales = closedToday.reduce((a, s) => a + s.totalRevenue, 0);
        
        const activeStaffList = staffStore.getActiveStaff();
        const activeStaff = activeStaffList.length;
        const totalStaff = staffStore.users.filter(u => u.businessUnit === 'CNG').length;
        
        const activeComp = cngStore.compressors.filter(c => c.status !== 'MAINTENANCE' && c.status !== 'FAULT').length;
        const totalComp = cngStore.compressors.length;
        recentShifts = [...cngShifts]
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 6)
            .map(s => ({
                staff: s.staffName || 'Unknown',
                shiftType: s.shiftType,
                amount: s.totalRevenue,
                time: new Date(s.startTime).toLocaleTimeString('en-PK', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                status: s.status,
            }));

        kpis = [
            {
                label: 'CNG Revenue Today',
                value: `₨${fmt(todaySales)}`,
                sub: `${closedToday.length} Shifts`,
                icon: <TrendingUp size={22} className="text-white" />,
                color: 'cyan',
                index: 0,
                trend: todaySales > 0 ? 'up' : 'neutral',
            },
            {
                label: 'Active Staff',
                value: `${activeStaff} / ${totalStaff || 1}`,
                sub: 'CNG Team',
                icon: <Users size={22} className="text-white" />,
                color: 'emerald',
                index: 1,
                trend: 'neutral',
            },
            {
                label: 'Compressors Online',
                value: `${activeComp} / ${totalComp || 1}`,
                sub: 'Active Units',
                icon: <Settings size={22} className="text-white" />,
                color: 'violet',
                index: 2,
                trend: activeComp === totalComp ? 'up' : 'down',
            },
            {
                label: 'Total CNG Shifts',
                value: `${cngStore.getFilteredShifts().length}`,
                sub: 'All Time',
                icon: <BarChart3 size={22} className="text-white" />,
                color: 'blue',
                index: 3,
                trend: 'up',
            },
        ];
        quickActions = [
            {
                label: 'Close CNG Shift',
                sub: 'Record compressor readings',
                emoji: '💨',
                color: 'cyan',
                path: '/cng/shifts',
            },
            {
                label: 'CNG Reports',
                sub: 'Revenue & volume analytics',
                emoji: '📊',
                color: 'blue',
                path: '/cng/reports',
            },
            {
                label: 'Manage Staff',
                sub: 'Attendance & payroll ledger',
                emoji: '👥',
                color: 'emerald',
                path: '/staff',
            },
            {
                label: 'Bank Deposits',
                sub: 'Cash & bank reconciliation',
                emoji: '🏦',
                color: 'violet',
                path: '/financials/bank',
            },
        ];
    } else {
        const lubeSales = salesStore.getTodaySales();
        const todaySales = lubeSales.reduce((a, s) => a + (s.totalAmount || 0), 0);
        
        const activeStaffList = staffStore.getActiveStaff();
        const activeStaff = activeStaffList.length;
        const totalStaff = staffStore.users.filter(u => u.businessUnit === 'LUBE').length;
        
        const lubeProds = productStore.getFilteredProducts();
        const lowStock = lubeProds.filter(p => p.currentStock <= p.reorderPoint).length;
        const totalStock = lubeProds.reduce((a, p) => a + p.currentStock, 0);

        kpis = [
            {
                label: 'Store Revenue Today',
                value: `₨${fmt(todaySales)}`,
                sub: `${lubeSales.length} Txns`,
                icon: <TrendingUp size={22} className="text-white" />,
                color: 'blue',
                index: 0,
                trend: todaySales > 0 ? 'up' : 'neutral',
            },
            {
                label: 'Active Staff',
                value: `${activeStaff} / ${totalStaff || 1}`,
                sub: 'Lube Team',
                icon: <Users size={22} className="text-white" />,
                color: 'emerald',
                index: 1,
                trend: 'neutral',
            },
            {
                label: 'Total Stock',
                value: `${fmt(totalStock)} U`,
                sub: 'All Products',
                icon: <Droplets size={22} className="text-white" />,
                color: 'amber',
                index: 2,
                trend: 'neutral',
            },
            {
                label: 'Low Stock Alerts',
                value: `${lowStock}`,
                sub: 'SKUs',
                icon: <AlertTriangle size={22} className="text-white" />,
                color: 'rose',
                index: 3,
                trend: lowStock > 0 ? 'down' : 'up',
            },
        ];
        quickActions = [
            {
                label: 'Store POS',
                sub: 'Process a sale transaction',
                emoji: '🛒',
                color: 'blue',
                path: '/lube/pos',
            },
            {
                label: 'Inventory',
                sub: 'Manage lube stock levels',
                emoji: '📦',
                color: 'amber',
                path: '/lube/products',
            },
            {
                label: 'Manage Staff',
                sub: 'Attendance & payroll ledger',
                emoji: '👥',
                color: 'emerald',
                path: '/staff',
            },
            {
                label: 'Sales Reports',
                sub: 'Revenue & product analytics',
                emoji: '📊',
                color: 'violet',
                path: '/reports',
            },
        ];
    }

    /* ── Fuel tank color map ── */
    const TANK_COLORS: Record<string, { color: string; glow: string }> = {
        PETROL_92: { color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
        PETROL_95: { color: '#f97316', glow: 'rgba(249,115,22,0.6)' },
        DIESEL: { color: '#06b6d4', glow: 'rgba(6,182,212,0.6)' },
        HSD: { color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)' },
    };

    return (
        <motion.div variants={STAGGER} initial="hidden" animate="show" className="space-y-8 pb-20">
            {/* ══ HERO HEADER ══ */}
            <motion.div
                variants={FADE_UP}
                className="relative overflow-hidden rounded-3xl p-8"
                style={{
                    background:
                        bu === 'FUEL'
                            ? 'linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4338ca 65%,#6366f1 100%)'
                            : bu === 'CNG'
                              ? 'linear-gradient(135deg,#164e63 0%,#0e7490 35%,#0891b2 70%,#06b6d4 100%)'
                              : 'linear-gradient(135deg,#1a1a2e 0%,#16213e 35%,#0f3460 70%,#533483 100%)',
                }}
            >
                {/* Noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '150px',
                    }}
                />

                {/* Animated orbs */}
                <motion.div
                    className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle,white,transparent 65%)' }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle,white,transparent 65%)' }}
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        {/* Greeting */}
                        <motion.p
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm font-black uppercase tracking-[0.25em] text-white/60 mb-2"
                        >
                            {greeting}
                        </motion.p>
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                            Business{' '}
                            <span className="relative">
                                Intelligence
                                <motion.div
                                    className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                                    style={{
                                        background:
                                            'linear-gradient(90deg,rgba(255,255,255,0.8),rgba(255,255,255,0.2))',
                                    }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                />
                            </span>
                        </h1>
                        <p className="text-sm text-white/50 font-mono mt-2">
                            {bu} Command Center ·{' '}
                            {now.toLocaleDateString('en-PK', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* Live indicator + quick stats */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm">
                            <motion.div
                                className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-sm font-black text-white">Live System</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm">
                            <Zap size={14} className="text-amber-300" />
                            <span className="text-sm font-black text-white">{kpis[0]?.value}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onNavigate('/reports')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm text-white text-sm font-black transition-colors"
                        >
                            <BarChart3 size={15} /> Reports <ArrowUpRight size={13} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* ══ KPI GRID ══ */}
            {fuelStore.isLoading || cngStore.isLoading ? (
                <SkeletonKPI />
            ) : (
                <motion.div
                    variants={FADE_UP}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    {kpis.map((k, i) => (
                        <GlassKPICard
                            key={k.label}
                            {...k}
                            index={i}
                            onClick={() => onNavigate('/reports')}
                        />
                    ))}
                </motion.div>
            )}

            {/* ══ MAIN GRID ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── LEFT: Recent Activity + Tanks ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab selector */}
                    <motion.div
                        variants={FADE_UP}
                        className="flex items-center gap-1 p-1 rounded-2xl"
                        style={{
                            background: 'rgba(0,0,0,0.04)',
                            border: '1.5px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        {(['overview', 'activity'] as const).map(tab => (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-colors relative"
                                style={
                                    activeTab === tab
                                        ? {
                                              background: 'white',
                                              color: '#6366f1',
                                              boxShadow: '0 2px 12px rgba(99,102,241,0.15)',
                                          }
                                        : { color: '#94a3b8' }
                                }
                            >
                                {tab === 'overview' ? '📊 Overview' : '⏱ Activity'}
                            </motion.button>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {fuelStore.isLoading || cngStore.isLoading ? (
                            <motion.div
                                key="loading-activity"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <Skeleton width="40%" height={24} className="rounded-xl" />
                                <SkeletonList count={3} />
                            </motion.div>
                        ) : activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={SPRING}
                                className="space-y-5"
                            >
                                {/* Fuel tank gauges (FUEL mode only) */}
                                {bu === 'FUEL' && tanks.length > 0 && (
                                    <div
                                        className="relative overflow-hidden rounded-3xl p-6"
                                        style={{
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(24px)',
                                            border: '1.5px solid rgba(255,255,255,0.8)',
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <div
                                            className="dark:block hidden absolute inset-0 rounded-3xl"
                                            style={{ background: 'rgba(15,23,42,0.8)' }}
                                        />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center">
                                                    <Flame size={16} className="text-amber-500" />
                                                </div>
                                                <h3 className="text-base font-black text-gray-900 dark:text-white">
                                                    Fuel Tank Levels
                                                </h3>
                                                <span className="ml-auto text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                                    {tanks.length} Active
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-8 justify-around">
                                                {tanks.map(t => {
                                                    const tc = TANK_COLORS[t.fuelType] || {
                                                        color: '#6366f1',
                                                        glow: 'rgba(99,102,241,0.6)',
                                                    };
                                                    const pct = t.capacity
                                                        ? Math.round(
                                                              (t.currentLevel / t.capacity) * 100
                                                          )
                                                        : 0;
                                                    return (
                                                        <TankGauge
                                                            key={t.tankId}
                                                            name={t.name}
                                                            pct={pct}
                                                            color={tc.color}
                                                            glow={tc.glow}
                                                            level={t.currentLevel}
                                                            cap={t.capacity}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Operations health bars */}
                                <div
                                    className="relative overflow-hidden rounded-3xl p-6"
                                    style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(24px)',
                                        border: '1.5px solid rgba(255,255,255,0.8)',
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div
                                        className="dark:block hidden absolute inset-0 rounded-3xl"
                                        style={{ background: 'rgba(15,23,42,0.8)' }}
                                    />
                                    <div className="relative space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                                                <Activity size={16} className="text-indigo-500" />
                                            </div>
                                            <h3 className="text-base font-black text-gray-900 dark:text-white">
                                                Operations Health
                                            </h3>
                                            <span className="ml-auto flex items-center gap-1.5">
                                                <motion.div
                                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                                    animate={{
                                                        opacity: [1, 0.3, 1],
                                                        scale: [1, 1.3, 1],
                                                    }}
                                                    transition={{ duration: 1.8, repeat: Infinity }}
                                                />
                                                <span className="text-xs font-black text-emerald-500">
                                                    All Systems Nominal
                                                </span>
                                            </span>
                                        </div>
                                        {[
                                            { label: 'Revenue Flow', pct: 78, color: '#6366f1' },
                                            { label: 'Staff Coverage', pct: 92, color: '#10b981' },
                                            {
                                                label: 'Inventory Levels',
                                                pct: 61,
                                                color: '#f59e0b',
                                            },
                                            {
                                                label: 'System Integrity',
                                                pct: 100,
                                                color: '#34d399',
                                            },
                                        ].map((row, i) => (
                                            <div key={row.label}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-black text-gray-700 dark:text-slate-300">
                                                        {row.label}
                                                    </span>
                                                    <span
                                                        className="text-sm font-black font-mono"
                                                        style={{ color: row.color }}
                                                    >
                                                        {row.pct}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.07] overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            background: `linear-gradient(90deg,${row.color},${row.color}99)`,
                                                        }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${row.pct}%` }}
                                                        transition={{
                                                            duration: 1.2,
                                                            delay: i * 0.15,
                                                            ease: 'easeOut',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={SPRING}
                                className="relative overflow-hidden rounded-3xl p-6"
                                style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(24px)',
                                    border: '1.5px solid rgba(255,255,255,0.8)',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                                }}
                            >
                                <div
                                    className="dark:block hidden absolute inset-0 rounded-3xl"
                                    style={{ background: 'rgba(15,23,42,0.8)' }}
                                />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                                            <Clock size={16} className="text-indigo-500" />
                                        </div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white">
                                            Recent Shifts
                                        </h3>
                                        <span className="ml-auto text-xs font-mono text-gray-400 dark:text-slate-500">
                                            {recentShifts.length} records
                                        </span>
                                    </div>
                                    {recentShifts.length > 0 ? (
                                        recentShifts.map((s, i) => (
                                            <RecentShiftRow key={i} {...s} index={i} />
                                        ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Star
                                                size={40}
                                                className="mx-auto text-gray-200 dark:text-slate-700 mb-3"
                                            />
                                            <p className="text-sm font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                                                No Shifts Recorded
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-slate-700 mt-1">
                                                Close your first shift to see activity here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── RIGHT: Quick Commands ── */}
                <motion.div variants={FADE_UP} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
                            <Zap size={16} className="text-indigo-500" />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">
                            Quick Commands
                        </h3>
                    </div>

                    {quickActions.map(a => (
                        <QuickAction
                            key={a.label}
                            label={a.label}
                            sub={a.sub}
                            emoji={a.emoji}
                            color={a.color}
                            onClick={() => onNavigate(a.path)}
                        />
                    ))}

                    {/* Status card */}
                    <motion.div
                        className="relative overflow-hidden rounded-3xl p-5"
                        style={{
                            background:
                                'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))',
                            border: '1.5px solid rgba(16,185,129,0.25)',
                            boxShadow: '0 4px 20px rgba(16,185,129,0.1)',
                        }}
                        animate={{
                            boxShadow: [
                                '0 4px 20px rgba(16,185,129,0.1)',
                                '0 4px 20px rgba(16,185,129,0.2)',
                                '0 4px 20px rgba(16,185,129,0.1)',
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg,#10b981,#059669)',
                                    boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                                }}
                            >
                                <CheckCircle2 size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                                    System Verified
                                </p>
                                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-0.5">
                                    All modules operational ·{' '}
                                    {now.toLocaleTimeString('en-PK', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};
