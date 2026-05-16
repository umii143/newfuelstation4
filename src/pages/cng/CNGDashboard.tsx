import { ActivityFeed } from '@/components/dashboard/DashboardWidgets';

import { useAuthStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle,
    Clock,
    Cpu,
    DollarSign,
    ExternalLink,
    Gauge,
    Plus,
    RefreshCw,
    TrendingUp,
    Users,
    Wind,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Sample data for charts
const _pressureData = [
    { name: '00:00', bank1: 220, bank2: 215, bank3: 210 },
    { name: '04:00', bank1: 210, bank2: 205, bank3: 200 },
    { name: '08:00', bank1: 195, bank2: 190, bank3: 185 },
    { name: '12:00', bank1: 170, bank2: 165, bank3: 160 },
    { name: '16:00', bank1: 185, bank2: 180, bank3: 175 },
    { name: '20:00', bank1: 200, bank2: 195, bank3: 190 },
    { name: '23:59', bank1: 215, bank2: 210, bank3: 205 },
];
void _pressureData;

const revenueAndVolumeData = [
    { day: 'Mon', rev: 250000, kg: 1250 },
    { day: 'Tue', rev: 284000, kg: 1420 },
    { day: 'Wed', rev: 236000, kg: 1180 },
    { day: 'Thu', rev: 316000, kg: 1580 },
    { day: 'Fri', rev: 344000, kg: 1720 },
    { day: 'Sat', rev: 390000, kg: 1950 },
    { day: 'Sun', rev: 330000, kg: 1650 },
];

const hourlySalesData = [
    { hour: '06:00', rev: 12000, kg: 60 },
    { hour: '09:00', rev: 45000, kg: 225 },
    { hour: '12:00', rev: 68000, kg: 340 },
    { hour: '15:00', rev: 82000, kg: 410 },
    { hour: '18:00', rev: 115000, kg: 575 },
    { hour: '21:00', rev: 55000, kg: 275 },
    { hour: '23:59', rev: 18000, kg: 90 },
];

const cascadeDistribution = [
    { name: 'Bank 1 (250bar)', value: 40, color: '#3B82F6' },
    { name: 'Bank 2 (220bar)', value: 35, color: '#10B981' },
    { name: 'Bank 3 (200bar)', value: 25, color: '#F59E0B' },
];

type H = 'green' | 'blue' | 'amber' | 'purple' | 'rose' | 'emerald' | 'cyan';
const C: Record<string, { a: string; b: string; rgb: string; light: string }> = {
    green: { a: '#10B981', b: '#059669', rgb: '16,185,129', light: 'rgba(16,185,129,0.12)' },
    blue: { a: '#3B82F6', b: '#2563EB', rgb: '59,130,246', light: 'rgba(59,130,246,0.12)' },
    amber: { a: '#F59E0B', b: '#D97706', rgb: '245,158,11', light: 'rgba(245,158,11,0.12)' },
    purple: { a: '#8B5CF6', b: '#7C3AED', rgb: '139,92,246', light: 'rgba(139,92,246,0.12)' },
    rose: { a: '#F43F5E', b: '#E11D48', rgb: '244,63,94', light: 'rgba(244,63,94,0.12)' },
    emerald: { a: '#10B981', b: '#059669', rgb: '16,185,129', light: 'rgba(16,185,129,0.12)' },
    cyan: { a: '#06B6D4', b: '#0891B2', rgb: '6,182,212', light: 'rgba(6,182,212,0.12)' },
};

interface CNGDashboardProps {
    onNavigate: (path: string) => void;
}

// ─── Shared Animated Components ──────────────────────────────────────────────
function Dot({ color }: { color: string }) {
    return (
        <span className="relative inline-flex w-2 h-2 flex-shrink-0">
            <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: color }}
                animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="relative rounded-full w-full h-full" style={{ background: color }} />
        </span>
    );
}

function Count({ to, p = '', s = '' }: { to: number; p?: string; s?: string }) {
    const [v, set] = useState(0);
    const r = useRef<number>();
    useEffect(() => {
        const t0 = Date.now();
        const tick = () => {
            const pt = Math.min(1, (Date.now() - t0) / 1600);
            set(to * (1 - Math.pow(1 - pt, 4)));
            if (pt < 1) r.current = requestAnimationFrame(tick);
        };
        r.current = requestAnimationFrame(tick);
        return () => {
            if (r.current) {
                cancelAnimationFrame(r.current);
            }
        };
    }, [to]);
    return (
        <>
            {p}
            {Math.round(v).toLocaleString()}
            {s}
        </>
    );
}

// ─── Station Health Ring ───────────────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
    const r = 36,
        circ = 2 * Math.PI * r;
    const col = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
    const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Fair' : 'Needs Attention';
    return (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative" style={{ width: 96, height: 96 }}>
                <svg
                    width="96"
                    height="96"
                    viewBox="0 0 96 96"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <circle
                        cx="48"
                        cy="48"
                        r={r}
                        fill="none"
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="7"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r={r}
                        fill="none"
                        stroke={col}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={`${circ}`}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                        style={{ filter: `drop-shadow(0 0 8px ${col}80)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[1.3rem] font-black text-white tabular-nums">
                        {score}%
                    </span>
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
                        health
                    </span>
                </div>
            </div>
            <div className="text-center">
                <p
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: col }}
                >
                    {label}
                </p>
                <p className="text-[8px] text-gray-600 font-semibold">Station Score</p>
            </div>
        </div>
    );
}

export const CNGDashboard: React.FC<CNGDashboardProps> = ({ onNavigate }) => {
    const { cascades, compressors, shifts } = useCNGStore();
    const { user } = useAuthStore();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const greet =
        now.getHours() < 12
            ? 'Good Morning'
            : now.getHours() < 18
              ? 'Good Afternoon'
              : 'Good Evening';

    const today = new Date().toISOString().split('T')[0];
    const todayShifts = shifts.filter((s: any) => s.date === today);
    const activeShifts = shifts.filter((s: any) => s.status === 'ACTIVE');
    const openCt = activeShifts.length;
    const shiftCt = todayShifts.length;

    const todayRevenue = todayShifts.reduce((sum: number, s: any) => sum + s.totalRevenue, 0);
    const todayKG = todayShifts.reduce((sum: number, s: any) => sum + s.totalLitersSold, 0);
    const avgVariance = 0; // Disable visual noise from variance unless specifically selected

    const animatedRevenue = todayRevenue;
    const animatedKG = todayKG;

    const activeCompressors = compressors.filter((c: any) => c.status === 'OPERATIONAL').length;

    const a = {
        shiftCt,
        openCt,
        totShifts: shifts.length,
        cur: cascades.reduce((sum: number, c: any) => sum + c.currentPressure, 0),
        cap: cascades.reduce((sum: number, c: any) => sum + c.maxPressure, 0),
        wR: shifts.slice(-7).reduce((sum: number, s: any) => sum + s.totalRevenue, 0),
        tR: todayRevenue,
        aS: activeShifts.length,
        tS: 2,
        low: cascades.filter((c: any) => c.currentPressure < 150),
        health: Math.round((activeCompressors / Math.max(compressors.length, 1)) * 100),
        revD: 15.3,
        pct:
            cascades.length > 0
                ? Math.round(
                      (cascades.reduce((sum: number, c: any) => sum + c.currentPressure, 0) /
                          cascades.reduce((sum: number, c: any) => sum + c.maxPressure, 0)) *
                          100
                  )
                : 0,
    };

    const stats = [
        {
            title: 'CNG REVENUE TODAY',
            value: todayRevenue.toLocaleString(),
            rawValue: todayRevenue,
            h: 'emerald' as H,
            icon: TrendingUp,
            trend: 'up',
            change: '+12.5%',
            alert: false,
        },
        {
            title: 'KG DISPENSED TTD',
            value: todayKG.toLocaleString(),
            rawValue: todayKG,
            h: 'blue' as H,
            icon: Wind,
            trend: 'up',
            change: '+8.2%',
            alert: false,
        },
        {
            title: 'ACTIVE STAFF',
            value: activeShifts.length.toString(),
            rawValue: activeShifts.length,
            h: 'purple' as H,
            icon: Users,
            trend: 'up',
            change: '+2',
            alert: false,
        },
        {
            title: 'OPEN SHIFTS',
            value: openCt.toString(),
            rawValue: openCt,
            h: 'amber' as H,
            icon: Activity,
            trend: 'neutral',
            change: '',
            alert: false,
        },
    ];

    const [dismiss, setDismiss] = useState(false);

    const recentShifts = [
        {
            name: 'Ali Hassan',
            status: 'ACTIVE',
            date: '2/11/2026',
            shift: 'Shift #3',
            amount: 'Rs 85,450',
            kg: '1,240 KG',
            change: '+Rs 12,300',
            trend: 'up',
            statusColor: 'emerald',
        },
        {
            name: 'Ahmed Khan',
            status: 'CLOSED',
            date: '2/10/2026',
            shift: 'Shift #2',
            amount: 'Rs 73,200',
            kg: '1,050 KG',
            change: '+Rs 8,100',
            trend: 'up',
            statusColor: 'gray',
        },
        {
            name: 'Umar Ali',
            status: 'CLOSED',
            date: '2/9/2026',
            shift: 'Shift #1',
            amount: 'Rs 91,500',
            kg: '1,380 KG',
            change: '+Rs 15,400',
            trend: 'up',
            statusColor: 'gray',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        },
    };

    return (
        <div className="flex-1 overflow-auto min-h-screen" style={{ background: '#0D1117' }}>
            {/* ── CINEMATIC HEADER ──────────────────────────────── */}
            <div
                className="relative overflow-hidden min-h-[340px]"
                style={{
                    background:
                        'linear-gradient(150deg, #0D1117 0%, #064E3B 30%, #0F172A 60%, #0D1117 100%)',
                }}
            >
                {/* BG orbs */}
                {[
                    {
                        style: {
                            top: '-80px',
                            left: '-60px',
                            width: '400px',
                            height: '400px',
                            background:
                                'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
                        },
                        dur: 9,
                    },
                    {
                        style: {
                            top: '-40px',
                            right: '-80px',
                            width: '350px',
                            height: '350px',
                            background:
                                'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)',
                        },
                        dur: 12,
                    },
                    {
                        style: {
                            bottom: '0',
                            left: '40%',
                            width: '500px',
                            height: '200px',
                            background:
                                'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                        },
                        dur: 7,
                    },
                ].map((orb, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-3xl pointer-events-none"
                        style={orb.style as React.CSSProperties}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
                {/* Grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 max-w-[1640px] mx-auto px-6 lg:px-10 pt-6 pb-8">
                    {/* Alert */}
                    <AnimatePresence>
                        {!dismiss && a.low.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border border-amber-500/30 backdrop-blur-sm"
                                style={{ background: 'rgba(245,158,11,0.1)' }}
                            >
                                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                                <p className="text-[12px] text-amber-200 flex-1 font-medium">
                                    <strong className="font-bold">Low Pressure Alert:</strong>{' '}
                                    {a.low.map((t: any) => t.name).join(', ')} below 150 bar
                                </p>
                                <button
                                    onClick={() => setDismiss(true)}
                                    className="text-amber-500 hover:text-amber-300 text-[11px] font-bold"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── LIVE INFO TICKER ROW ── */}
                    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                        {/* Weekly Revenue */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/25 backdrop-blur-sm flex-shrink-0"
                            style={{ background: 'rgba(16,185,129,0.1)' }}
                        >
                            <TrendingUp size={11} className="text-emerald-400" />
                            <span className="text-[10px] font-semibold text-gray-400">
                                7-Day Revenue
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-300">
                                {a.wR >= 1e6
                                    ? `Rs ${(a.wR / 1e6).toFixed(2)}M`
                                    : `Rs ${(a.wR / 1000).toFixed(1)}K`}
                            </span>
                        </div>
                        {/* Avg/Shift */}
                        {a.totShifts > 0 && (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/25 backdrop-blur-sm flex-shrink-0"
                                style={{ background: 'rgba(59,130,246,0.1)' }}
                            >
                                <Activity size={11} className="text-blue-400" />
                                <span className="text-[10px] font-semibold text-gray-400">
                                    Avg/Shift
                                </span>
                                <span className="text-[11px] font-extrabold text-blue-300">
                                    Rs{' '}
                                    {Math.round(a.wR / Math.max(a.totShifts, 1)).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {/* Bank Pressure */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 backdrop-blur-sm flex-shrink-0"
                            style={{ background: 'rgba(245,158,11,0.1)' }}
                        >
                            <Gauge size={11} className="text-amber-400" />
                            <span className="text-[10px] font-semibold text-gray-400">
                                Live Pressure
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-300">
                                {a.cur.toFixed(0)} Bar
                            </span>
                            <span className="text-[9px] text-gray-600">
                                / {a.cap.toFixed(0)} max
                            </span>
                        </div>
                        {/* Open Shifts */}
                        {a.openCt > 0 ? (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/30 flex-shrink-0"
                                style={{ background: 'rgba(245,158,11,0.12)' }}
                            >
                                <Dot color="#F59E0B" />
                                <span className="text-[10px] font-bold text-amber-300">
                                    {a.openCt} shift{a.openCt > 1 ? 's' : ''} running
                                </span>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-700 flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                <Clock size={11} className="text-gray-500" />
                                <span className="text-[10px] font-semibold text-gray-500">
                                    No active shifts
                                </span>
                            </div>
                        )}
                        {/* Staff ratio */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/25 backdrop-blur-sm flex-shrink-0"
                            style={{ background: 'rgba(139,92,246,0.08)' }}
                        >
                            <Users size={11} className="text-purple-400" />
                            <span className="text-[10px] font-semibold text-gray-400">Staff</span>
                            <span className="text-[11px] font-extrabold text-purple-300">
                                {a.aS}/{a.tS} active
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                        <div>
                            {/* Station ID */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_24px_rgba(16,185,129,0.5)]"
                                    style={{
                                        background: 'linear-gradient(135deg, #10B981, #14B8A6)',
                                    }}
                                >
                                    <Zap size={20} className="text-white fill-emerald-300" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black tracking-[0.25em] text-emerald-400">
                                        MOTORWAY CNG · ENTERPRISE
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Dot color="#10B981" />
                                        <span className="text-emerald-400 text-[11px] font-bold">
                                            LIVE · COMPRESSORS ACTUATED
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Greeting */}
                            <h1 className="text-[3rem] font-black leading-none tracking-tight mb-3">
                                <span className="text-white">{greet}, </span>
                                <span
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #34D399, #2DD4BF, #3B82F6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {(user as any)?.name?.split(' ')[0] ||
                                        (user as any)?.username?.split(' ')[0] ||
                                        'Commander'}
                                </span>
                            </h1>

                            {/* Date + clock */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-gray-400 text-[12px]">
                                    {now.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                                <span className="text-gray-600">·</span>
                                <span
                                    className="font-mono font-bold text-[13px] text-white px-2.5 py-1 rounded-lg border border-white/10"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}
                                >
                                    {now.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </span>
                                {a.shiftCt > 0 && (
                                    <span className="text-emerald-400 text-[12px] font-semibold">
                                        {a.shiftCt} shift{a.shiftCt > 1 ? 's' : ''} today
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right header panel */}
                        <div className="flex items-start gap-5">
                            {/* Station Health Ring */}
                            <HealthRing score={a.health} />

                            <div className="flex flex-col items-end gap-3">
                                {/* CNG Rate */}
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                        CURRENT RATE (PKR/KG)
                                    </span>
                                    <div
                                        className="flex flex-col px-4 py-2 rounded-xl border backdrop-blur-sm"
                                        style={{
                                            background: '#ecfdf5',
                                            borderColor: 'rgba(16,185,129,0.3)',
                                            minWidth: 120,
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-0.5">
                                            <span className="text-[10px] font-bold text-emerald-600">
                                                CNG
                                            </span>
                                            <span className="text-[12px] font-extrabold text-emerald-900">
                                                Rs 285.00
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all backdrop-blur-sm"
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <RefreshCw size={12} /> Refresh
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => onNavigate('/cng/shifts')}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white shadow-[0_8px_24px_rgba(16,185,129,0.4)]"
                                        style={{
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                        }}
                                    >
                                        <Plus size={14} /> Start Shift
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero stats strip inside header */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                        {[
                            {
                                l: 'SHIFTS TODAY',
                                v: a.shiftCt,
                                raw: false,
                                c: 'emerald' as H,
                                ic: Activity,
                                sub: a.openCt > 0 ? `${a.openCt} running now` : 'All closed',
                            },
                            {
                                l: 'GAS IN TANKS',
                                v: `${a.cur.toFixed(0)} Bar`,
                                raw: true,
                                c: 'blue' as H,
                                ic: Wind,
                                sub: `${a.pct}% of capacity`,
                            },
                            {
                                l: 'TODAY REVENUE',
                                v: a.tR >= 1000 ? `Rs ${(a.tR / 1000).toFixed(1)}K` : `Rs ${a.tR}`,
                                raw: true,
                                c: 'emerald' as H,
                                ic: TrendingUp,
                                sub: `${a.revD >= 0 ? '+' : ''}${a.revD.toFixed(1)}% vs yesterday`,
                            },
                            {
                                l: 'ACTIVE COMPRESSORS',
                                v: `${activeCompressors}/${compressors.length}`,
                                raw: true,
                                c: 'purple' as H,
                                ic: Cpu,
                                sub: `${compressors.length - activeCompressors > 0 ? `${compressors.length - activeCompressors} offline` : '100% operational'}`,
                            },
                        ].map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${C[m.c].light}, rgba(255,255,255,0.03))`,
                                    borderColor: `rgba(${C[m.c].rgb},0.25)`,
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: C[m.c].light }}
                                >
                                    <m.ic size={16} style={{ color: C[m.c].a }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black tracking-[0.15em] text-gray-500">
                                        {m.l}
                                    </p>
                                    <p
                                        className="text-[1.1rem] font-extrabold tabular-nums leading-tight"
                                        style={{ color: C[m.c].a }}
                                    >
                                        {m.raw ? m.v : <Count to={Number(m.v)} />}
                                    </p>
                                    <p className="text-[9px] text-gray-500 font-medium mt-0.5 truncate">
                                        {m.sub}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fade into body */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, #F1F3F7)' }}
                />
            </div>

            {/* ── BODY ────────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(180deg, #F1F3F7 0%, #EDEEF3 100%)' }}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-[1800px] mx-auto px-6 lg:px-8 pt-5 pb-20 space-y-5"
                >
                    {/* ── GLASSMORPHIC 3D KPI CARDS ── */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8"
                    >
                        {stats.map((stat, index) => {
                            const h = C[stat.h];
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.02,
                                        boxShadow: `0 30px 60px -12px rgba(${h.rgb},0.25), 0 18px 36px -18px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,1)`,
                                    }}
                                    className="relative cursor-pointer rounded-[2rem] overflow-hidden group transition-all duration-500"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: `1px solid rgba(255,255,255,0.8)`,
                                        boxShadow:
                                            '0 12px 32px -12px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,1)',
                                    }}
                                >
                                    {/* Top rim light */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90 z-20" />

                                    {/* 3D Dynamic Glow Orbs */}
                                    <div
                                        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                                        style={{ background: h.a }}
                                    />
                                    <div
                                        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                                        style={{ background: h.b }}
                                    />

                                    {/* Deep Shimmer */}
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background:
                                                'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.8) 50%, transparent 65%)',
                                        }}
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{
                                            duration: 1.2,
                                            ease: 'easeInOut',
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                        }}
                                    />

                                    <div className="relative z-10 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <motion.div
                                                whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1 }}
                                                transition={{ duration: 0.5 }}
                                                className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center relative group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow duration-500"
                                                style={{
                                                    background: `linear-gradient(135deg, ${h.a}, ${h.b})`,
                                                    boxShadow: `0 8px 24px -6px rgba(${h.rgb},0.6), inset 0 2px 4px rgba(255,255,255,0.3)`,
                                                }}
                                            >
                                                <stat.icon
                                                    size={26}
                                                    className="text-white drop-shadow-md"
                                                />
                                            </motion.div>

                                            {/* Badges */}
                                            <div className="flex items-center gap-2">
                                                {stat.alert && (
                                                    <motion.div
                                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-1 rounded-full border border-rose-200/50"
                                                    >
                                                        <AlertCircle size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            Alert
                                                        </span>
                                                    </motion.div>
                                                )}
                                                {stat.change && (
                                                    <div
                                                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full border ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}
                                                    >
                                                        {stat.trend === 'up' ? (
                                                            <ArrowUpRight size={11} />
                                                        ) : (
                                                            <ArrowDownRight size={11} />
                                                        )}
                                                        {stat.change}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-black text-gray-500/80 uppercase tracking-[0.2em] mb-1.5">
                                            {stat.title}
                                        </p>
                                        <p className="text-[2rem] font-black text-gray-900 tracking-tight leading-none mb-2">
                                            {stat.rawValue !== undefined ? (
                                                stat.title.includes('REVENUE') ||
                                                stat.title.includes('VARIANCE') ? (
                                                    <>
                                                        <span className="text-xl text-gray-400 mr-1 font-bold tracking-normal">
                                                            Rs
                                                        </span>
                                                        {(index === 0
                                                            ? animatedRevenue
                                                            : Math.abs(avgVariance)
                                                        ).toLocaleString()}
                                                    </>
                                                ) : stat.title.includes('SOLD') ? (
                                                    <>
                                                        {animatedKG.toLocaleString()}
                                                        <span className="text-lg text-gray-400 ml-1 font-bold tracking-normal">
                                                            KG
                                                        </span>
                                                    </>
                                                ) : (
                                                    stat.value
                                                )
                                            ) : (
                                                stat.value
                                            )}
                                        </p>
                                    </div>

                                    {/* 3D Bottom edge glow line */}
                                    <div
                                        className="absolute bottom-0 left-6 right-6 h-[3px] rounded-t-full opacity-40 group-hover:opacity-100 group-hover:h-[4px] transition-all duration-500"
                                        style={{
                                            background: `linear-gradient(90deg, transparent, ${h.a}, transparent)`,
                                            boxShadow: `0 -4px 12px rgba(${h.rgb},0.4)`,
                                        }}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* ── INTELLIGENCE CHARTS ROW ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-6 lg:mb-8">
                        {/* Weekly Revenue & Volume (Combo Chart) */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-8 bg-white/70 backdrop-blur-xl rounded-[1.4rem] border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                        Sales & Revenue Trends
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Last 7 days performance metrics
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                                        <div className="w-4 h-0.5 rounded bg-blue-500" />
                                        Expected Revenue
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                                        <div className="w-3 h-3 rounded-sm bg-emerald-400/25 border border-emerald-400/40" />
                                        KG Dispensed
                                    </div>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={195}>
                                <AreaChart
                                    data={revenueAndVolumeData}
                                    margin={{ top: 5, right: 5, left: -5, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="gRBlue" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="0%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0.28}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0.01}
                                            />
                                        </linearGradient>
                                        <filter id="glBlue">
                                            <feGaussianBlur stdDeviation="3" result="b" />
                                            <feMerge>
                                                <feMergeNode in="b" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#F3F4F6"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#9CA3AF' }}
                                        dy={7}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                        width={36}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                            fontWeight: 'bold',
                                        }}
                                        itemStyle={{ fontSize: '13px' }}
                                        cursor={{ stroke: 'rgba(59,130,246,0.12)', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rev"
                                        name="Revenue (Rs)"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fill="url(#gRBlue)"
                                        filter="url(#glBlue)"
                                        dot={{
                                            r: 4,
                                            fill: '#fff',
                                            stroke: '#3B82F6',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{
                                            r: 7,
                                            fill: '#3B82F6',
                                            stroke: '#fff',
                                            strokeWidth: 3,
                                        }}
                                        animationDuration={1800}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="mt-4 pt-4 border-t border-gray-50/50">
                                <ResponsiveContainer width="100%" height={50}>
                                    <BarChart
                                        data={revenueAndVolumeData}
                                        margin={{ top: 0, right: 5, left: -5, bottom: 0 }}
                                        barSize={14}
                                    >
                                        <XAxis dataKey="day" hide />
                                        <Tooltip cursor={{ fill: '#F9FAFB', radius: 6 }} />
                                        <Bar
                                            dataKey="kg"
                                            name="Volume (KG)"
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={1600}
                                        >
                                            {revenueAndVolumeData.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={`rgba(16,185,129,${0.35 + (i / revenueAndVolumeData.length) * 0.45})`}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <p className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-gray-300 mt-1">
                                    VOLUME DISPENSED (KG)
                                </p>
                            </div>
                        </motion.div>

                        {/* Hourly Trends Chart */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-4 bg-white/70 backdrop-blur-xl rounded-[1.4rem] border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Hourly Trends
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Today's Live Flow
                                    </p>
                                </div>
                                <div className="p-2 rounded-xl bg-purple-50 shrink-0">
                                    <Clock size={16} className="text-purple-500" />
                                </div>
                            </div>

                            <div className="flex-1 min-h-[160px] relative mt-2 pb-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={hourlySalesData}
                                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="gRHour" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="0%"
                                                    stopColor="#A855F7"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#A855F7"
                                                    stopOpacity={0.0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="hour"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: '#9CA3AF',
                                                fontWeight: 'bold',
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            cursor={{
                                                stroke: '#E9D5FF',
                                                strokeWidth: 1,
                                                strokeDasharray: '4 4',
                                            }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                                            }}
                                            labelStyle={{
                                                color: '#6B7280',
                                                fontWeight: 'bold',
                                                marginBottom: '4px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="rev"
                                            stroke="#A855F7"
                                            strokeWidth={3}
                                            fill="url(#gRHour)"
                                            dot={true}
                                            activeDot={{
                                                r: 6,
                                                fill: '#A855F7',
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                            }}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Peak Time
                                    </span>
                                </div>
                                <span className="text-sm font-black text-gray-900">18:00</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Cascade Banks & Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
                        {/* Cascade Banks - Spans 2 columns */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                                        <Gauge className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Cascade Banks Status
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Real-time pressure monitoring
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                                    onClick={() => onNavigate('/cng/tanks')}
                                >
                                    <span>Manage Banks</span>
                                    <ExternalLink className="w-4 h-4" />
                                </motion.button>
                            </div>

                            <div className="space-y-6">
                                {cascades.slice(0, 3).map((bank, index) => {
                                    const percentage = (bank.pressure / bank.maxPressure) * 100;
                                    const isLow = percentage < 30;
                                    const isWarning = percentage < 50 && !isLow;

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            whileHover={{ x: 4 }}
                                            className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50 hover:border-emerald-300/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="font-bold text-gray-900">
                                                            {bank.name}
                                                        </h3>
                                                        {!isLow && !isWarning ? (
                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <AlertCircle
                                                                className={`w-4 h-4 ${isLow ? 'text-rose-500' : 'text-amber-500'}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Max: {bank.maxPressure} bar
                                                    </p>
                                                </div>
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay: 0.7 + index * 0.1,
                                                        type: 'spring',
                                                    }}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                                                        isLow
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : isWarning
                                                              ? 'bg-amber-100 text-amber-700'
                                                              : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {percentage.toFixed(0)}%
                                                </motion.span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{
                                                            delay: 0.8 + index * 0.1,
                                                            duration: 1,
                                                            ease: 'easeOut',
                                                        }}
                                                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                                                            isLow
                                                                ? 'from-rose-500 to-rose-600'
                                                                : isWarning
                                                                  ? 'from-amber-500 to-amber-600'
                                                                  : 'from-emerald-500 to-emerald-600'
                                                        } rounded-full shadow-lg`}
                                                    >
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                            animate={{
                                                                x: ['-100%', '200%'],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: 'linear',
                                                            }}
                                                        />
                                                    </motion.div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                                                    <span>{bank.pressure} bar</span>
                                                    <span>Capacity: {bank.maxPressure} bar</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Cascade Distribution Pie Chart */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Cascade Distribution
                                    </h2>
                                    <p className="text-xs text-gray-500">By pressure level</p>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={cascadeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {cascadeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '2px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="space-y-2 mt-4">
                                {cascadeDistribution.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 + index * 0.1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">
                                            {item.value}%
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── BOTTOM ROW ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 lg:mb-8">
                        {/* Left: Recent Shifts */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-8 bg-white/70 backdrop-blur-xl rounded-[1.4rem] p-6 border-2 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Recent Shifts
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Last 7 days sequence
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                                    onClick={() => onNavigate('/cng/shifts')}
                                >
                                    <span>View All</span>
                                    <ExternalLink className="w-4 h-4" />
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {recentShifts.map((shift, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 hover:from-white/80 hover:to-white/60 border border-white/50 hover:border-emerald-300/50 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div
                                                className={`p-2 rounded-lg bg-gradient-to-br ${
                                                    shift.statusColor === 'emerald'
                                                        ? 'from-emerald-100 to-emerald-200'
                                                        : 'from-gray-100 to-gray-200'
                                                }`}
                                            >
                                                <Clock
                                                    className={`w-4 h-4 ${
                                                        shift.statusColor === 'emerald'
                                                            ? 'text-emerald-600'
                                                            : 'text-gray-600'
                                                    }`}
                                                />
                                            </div>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                                                    shift.statusColor === 'emerald'
                                                        ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {shift.status}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">
                                            {shift.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mb-3">
                                            {shift.date} • {shift.shift}
                                        </p>
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="font-bold text-gray-900 text-lg mb-1">
                                                {shift.amount}
                                            </p>
                                            <p className="text-[11px] text-gray-600 font-medium mb-2">
                                                {shift.kg}
                                            </p>
                                            <div
                                                className={`flex items-center space-x-1 text-xs font-bold ${
                                                    shift.trend === 'up'
                                                        ? 'text-emerald-600'
                                                        : 'text-rose-600'
                                                }`}
                                            >
                                                {shift.trend === 'up' ? (
                                                    <ArrowUpRight className="w-3 h-3" />
                                                ) : (
                                                    <ArrowDownRight className="w-3 h-3" />
                                                )}
                                                <span>{shift.change}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: Actions + Activity Feed */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Quick Actions Panel */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white/70 backdrop-blur-xl rounded-[1.4rem] border-2 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5"
                            >
                                <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap size={14} className="text-emerald-500" /> Quick Actions
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            l: 'Start Shift',
                                            sub: 'Clock in',
                                            ic: Zap,
                                            h: 'emerald' as H,
                                            path: '/cng/shifts',
                                        },
                                        {
                                            l: 'View Reports',
                                            sub: 'Analytics',
                                            ic: TrendingUp,
                                            h: 'blue' as H,
                                            path: '/cng/reports',
                                        },
                                        {
                                            l: 'Manage Staff',
                                            sub: 'Team admin',
                                            ic: Users,
                                            h: 'purple' as H,
                                            path: '/staff',
                                        },
                                        {
                                            l: 'Inventory',
                                            sub: 'Check logs',
                                            ic: DollarSign,
                                            h: 'amber' as H,
                                            path: '/cng/tanks', // Using tanks for inventory analogy
                                        },
                                    ].map((ac, i) => {
                                        const fh = C[ac.h];
                                        return (
                                            <motion.button
                                                key={i}
                                                whileHover={{
                                                    scale: 1.05,
                                                    y: -4,
                                                    boxShadow: `0 16px 40px rgba(${fh.rgb},0.45)`,
                                                }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => onNavigate(ac.path)}
                                                className="flex flex-col items-center gap-3 py-6 px-3 rounded-[1.2rem] text-center relative overflow-hidden group transition-all"
                                                style={{
                                                    background: `linear-gradient(145deg, ${fh.a}, ${fh.b})`,
                                                    boxShadow: `0 6px 20px rgba(${fh.rgb},0.32)`,
                                                }}
                                            >
                                                {/* Noise texture overlay */}
                                                <div
                                                    className="absolute inset-0 opacity-[0.06]"
                                                    style={{
                                                        backgroundImage:
                                                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                                                    }}
                                                />
                                                {/* Shimmer sweep */}
                                                <motion.div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                                                    style={{
                                                        background:
                                                            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                                                    }}
                                                    animate={{ x: ['-120%', '220%'] }}
                                                    transition={{
                                                        duration: 0.65,
                                                        ease: 'easeInOut',
                                                        repeat: Infinity,
                                                        repeatDelay: 3,
                                                    }}
                                                />
                                                {/* Ambient glow orb at top */}
                                                <div
                                                    className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-30"
                                                    style={{ background: '#ffffff' }}
                                                />
                                                {/* Icon */}
                                                <div className="w-12 h-12 rounded-[1rem] bg-white/20 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                    <ac.ic
                                                        size={22}
                                                        className="text-white drop-shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-extrabold text-white tracking-tight">
                                                        {ac.l}
                                                    </p>
                                                    <p className="text-[9px] text-white/70 mt-0.5 font-medium">
                                                        {ac.sub}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Recent Activity Feed */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white/70 backdrop-blur-xl rounded-[1.4rem] border-2 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 flex-1 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                                        <Activity size={14} className="text-purple-500" /> Live Feed
                                    </h2>
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200/50 text-purple-700 text-[9px] font-bold tracking-widest uppercase">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />{' '}
                                        Live
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <ActivityFeed />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
            {/* Custom Scrollbar Styles */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(16, 185, 129), rgb(20, 184, 166));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(5, 150, 105), rgb(13, 148, 136));
        }
      `}</style>
        </div>
    );
};
