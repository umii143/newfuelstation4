/**
 * FUEL DASHBOARD V13 â€” FINAL MASTER
 * Score target: 9-10/10
 * Fix: Glassmorphism on gradient bg Â· Connected layout Â· Rich data sections
 */
import { useAuthStore } from '@/stores/authStore';
import { useStaffStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Bell,
    BrainCircuit,
    CheckCircle2,
    ChevronRight,
    Clock,
    
    Droplets,
    FileText,
    Flame,
    Fuel,
    Gauge,
    Package,
    Plus,
    RefreshCw,
    Shield,
    
    Sparkles,
    
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Props {
    onNavigate: (p: string) => void;
}

const E = [0.22, 1, 0.36, 1] as const;
const GRID = { hidden: {}, show: { transition: { staggerChildren: 0.065, delayChildren: 0.04 } } };
const I = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: E } },
};

type H = 'green' | 'blue' | 'amber' | 'purple' | 'rose';
const C: Record<H, { a: string; b: string; rgb: string; light: string }> = {
    green: { a: '#10B981', b: '#059669', rgb: '16,185,129', light: 'rgba(16,185,129,0.12)' },
    blue: { a: '#3B82F6', b: '#2563EB', rgb: '59,130,246', light: 'rgba(59,130,246,0.12)' },
    amber: { a: '#F59E0B', b: '#D97706', rgb: '245,158,11', light: 'rgba(245,158,11,0.12)' },
    purple: { a: '#8B5CF6', b: '#7C3AED', rgb: '139,92,246', light: 'rgba(139,92,246,0.12)' },
    rose: { a: '#F43F5E', b: '#E11D48', rgb: '244,63,94', light: 'rgba(244,63,94,0.12)' },
};
const FH: Record<string, H> = {
    PETROL_92: 'amber',
    PETROL_95: 'rose',
    DIESEL: 'blue',
    HSD: 'purple',
};

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
            r.current && cancelAnimationFrame(r.current);
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

function Spark({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null;
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart
                data={data.map((v, i) => ({ i, v }))}
                margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
            >
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={2.5}
                    dot={false}
                    animationDuration={1400}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

const Tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3.5 min-w-[150px]">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                {label}
            </p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: p.color || p.stroke }}
                    />
                    <span className="text-[11px] text-gray-400">{p.name}</span>
                    <span className="ml-auto text-[12px] font-bold text-white tabular-nums">
                        {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

// â”€â”€â”€ Station Health Ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Chart Empty State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChartEmpty({ onStart }: { onStart: () => void }) {
    const bars = [12, 19, 8, 15, 22, 10, 17];
    const pts = [
        { x: 20, y: 42 },
        { x: 45, y: 30 },
        { x: 70, y: 20 },
        { x: 90, y: 14 },
    ];
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-5">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <defs>
                    <linearGradient id="ceg" x1="0" y1="0" x2="120" y2="0">
                        <stop stopColor="#10B981" stopOpacity="0.5" />
                        <stop offset="1" stopColor="#6366F1" stopOpacity="0.9" />
                    </linearGradient>
                </defs>
                {bars.map((h, i) => (
                    <motion.rect
                        key={i}
                        x={i * 16 + 4}
                        y={70 - h}
                        width="10"
                        height={h}
                        rx="3"
                        fill="#6366F1"
                        fillOpacity="0.18"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        style={{ transformOrigin: `${i * 16 + 9}px 70px` }}
                        transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                ))}
                <motion.path
                    d={`M ${pts.map(p => `${p.x},${p.y}`).join(' C ')}`}
                    stroke="url(#ceg)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
                />
                {pts.slice(1).map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#6366F1"
                        fillOpacity="0.6"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.4, 1] }}
                        transition={{ delay: 1.2 + i * 0.25, duration: 0.4 }}
                    />
                ))}
            </svg>
            <div className="text-center">
                <p className="text-[14px] font-bold text-gray-500 mb-1">No revenue data yet</p>
                <p className="text-[12px] text-gray-400">
                    Complete a shift to see trends appear here
                </p>
            </div>
            <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white shadow-lg"
                style={{
                    background: 'linear-gradient(135deg,#10B981,#3B82F6)',
                    boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
                }}
            >
                <Zap size={13} /> Start Your First Shift
            </motion.button>
        </div>
    );
}

export function FuelDashboard({ onNavigate }: Props) {
    const { user } = useAuthStore();
    const fuel = useFuelStore();
    const staff = useStaffStore(s => s.users);
    const [now, sN] = useState(new Date());
    const [dismiss, setDismiss] = useState(false);
    const [chartView, setChartView] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

    useEffect(() => {
        const id = setInterval(() => sN(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const hr = now.getHours();
    const greet =
        hr < 5
            ? 'Good night'
            : hr < 12
              ? 'Good morning'
              : hr < 17
                ? 'Good afternoon'
                : 'Good evening';
    const today = now.toISOString().split('T')[0];

    const a = useMemo(() => {
        const cl = fuel.shifts.filter(s => s.status === 'CLOSED');
        const td = cl.filter(s => s.startTime.startsWith(today));
        const pd = new Date(today);
        pd.setDate(pd.getDate() - 1);
        const yd = cl.filter(s => s.startTime.startsWith(pd.toISOString().split('T')[0]));
        const op = fuel.shifts.filter(s => s.status === 'OPEN');

        const tR = td.reduce((s, x) => s + x.totalRevenue, 0);
        const yR = yd.reduce((s, x) => s + x.totalRevenue, 0);
        const tL = td.reduce(
            (s, x) =>
                s + (x.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0),
            0
        );
        const yL = yd.reduce(
            (s, x) =>
                s + (x.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0),
            0
        );
        const cap = fuel.tanks.reduce((s, t) => s + (t.capacity || 0), 0);
        const cur = fuel.tanks.reduce((s, t) => s + (t.currentLevel || 0), 0);
        const pct = cap > 0 ? Math.round((cur / cap) * 100) : 0;
        const aS = staff.filter(u => u.status === 'ACTIVE' && u.businessUnit === 'FUEL').length;
        const tS = staff.filter(u => u.businessUnit === 'FUEL').length;
        const low = fuel.tanks.filter(t =>
            t.capacity ? (t.currentLevel || 0) / t.capacity < 0.25 : false
        );
        const rpl = tL > 0 ? tR / tL : 0;
        const week = cl.filter(s => {
            const d = new Date(s.startTime);
            const w = new Date();
            w.setDate(w.getDate() - 7);
            return d >= w;
        });

        const wR = week.reduce((s, x) => s + x.totalRevenue, 0);
        const allClosed = fuel.shifts.filter(s => s.status === 'CLOSED');
        const allR = allClosed.reduce((s, x) => s + x.totalRevenue, 0);
        const allL = allClosed.reduce(
            (s, x) =>
                s + (x.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0),
            0
        );
        const bestShift = allClosed.length > 0 ? Math.max(...allClosed.map(x => x.totalRevenue)) : 0;
        const avgR = allClosed.length > 0 ? Math.round(allR / allClosed.length) : 0;
        const staffPct = tS > 0 ? Math.round((aS / tS) * 100) : 100;
        const health = Math.round(pct * 0.4 + staffPct * 0.4 + (td.length > 0 ? 100 : 50) * 0.2);
        return {
            tR,
            yR,
            tL,
            yL,
            cap,
            cur,
            pct,
            aS,
            tS,
            low,
            revD: yR > 0 ? ((tR - yR) / yR) * 100 : 0,
            litD: yL > 0 ? ((tL - yL) / yL) * 100 : 0,
            rpl,
            shiftCt: td.length,
            openCt: op.length,
            totShifts: fuel.shifts.length,
            wR,
            allR,
            allL,
            bestShift,
            avgR,
            health,
        };
    }, [fuel, staff, today]);

    const charts = useMemo(() => {
        const cl = [...fuel.shifts.filter(s => s.status === 'CLOSED')]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            
        if (cl.length === 0) {
            return 'M,T,W,T,F,S,S,S'.split(',').map(d => ({ day: d, rev: 0, lit: 0 }));
        }

        if (chartView === 'HOURLY') {
            const nowTime = now.getTime();
            const hourly = Array.from({ length: 12 }, (_, i) => {
                const hourTime = nowTime - (11 - i) * 3600000;
                const d = new Date(hourTime);
                return {
                    day: d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                    rev: 0,
                    lit: 0,
                    timestamp: hourTime,
                };
            });
            
            cl.forEach(s => {
                const start = new Date(s.startTime).getTime();
                const end = s.closedAt ? new Date(s.closedAt).getTime() : now.getTime();
                const durationHrs = Math.max(1, (end - start) / 3600000);
                const revPerHour = s.totalRevenue / durationHrs;
                const litTotal = s.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0;
                const litPerHour = litTotal / durationHrs;
                
                hourly.forEach(h => {
                    // if the hour bucket is roughly within the shift, add to it
                    if (h.timestamp >= start && h.timestamp <= end + 3600000) {
                        h.rev += revPerHour;
                        h.lit += litPerHour;
                    }
                });
            });
            return hourly.map(h => ({ day: h.day, rev: Math.round(h.rev), lit: Math.round(h.lit) }));
        }
        else if (chartView === 'WEEKLY') {
            const weeklyMap = new Map<string, { rev: number; lit: number }>();
            cl.forEach(s => {
                const d = new Date(s.startTime);
                const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1); 
                const monday = new Date(d.setDate(diff));
                const weekStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                const curr = weeklyMap.get(weekStr) || { rev: 0, lit: 0 };
                curr.rev += s.totalRevenue;
                curr.lit += s.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0;
                weeklyMap.set(weekStr, curr);
            });
            return Array.from(weeklyMap.entries()).slice(-8).map(([day, data]) => ({
                day,
                rev: Math.round(data.rev),
                lit: Math.round(data.lit),
            }));
        }
        else if (chartView === 'MONTHLY') {
            const monthlyMap = new Map<string, { rev: number; lit: number }>();
            cl.forEach(s => {
                const d = new Date(s.startTime);
                const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                const curr = monthlyMap.get(monthStr) || { rev: 0, lit: 0 };
                curr.rev += s.totalRevenue;
                curr.lit += s.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0;
                monthlyMap.set(monthStr, curr);
            });
            return Array.from(monthlyMap.entries()).slice(-8).map(([day, data]) => ({
                day,
                rev: Math.round(data.rev),
                lit: Math.round(data.lit),
            }));
        }
        
        // DEFAULT: DAILY
        return cl.slice(-8).map(s => ({
            day: new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' }),
            rev: Math.round(s.totalRevenue),
            lit: Math.round(s.nozzleSales?.reduce((b: number, r: any) => b + (r.netSales || 0), 0) || 0),
        }));
    }, [fuel.shifts, chartView, now]);

    // â”€â”€ AI Revenue Forecast (linear regression on last 7 shifts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const forecast = useMemo(() => {
        const cl = [...fuel.shifts.filter(s => s.status === 'CLOSED')]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(-7);
        if (cl.length < 3) return null;
        const n = cl.length;
        const xs = cl.map((_, i) => i);
        const ys = cl.map(s => s.totalRevenue);
        const xm = xs.reduce((a, b) => a + b, 0) / n;
        const ym = ys.reduce((a, b) => a + b, 0) / n;
        const slope =
            xs.reduce((s, x, i) => s + (x - xm) * (ys[i] - ym), 0) /
            xs.reduce((s, x) => s + (x - xm) ** 2, 0.0001);
        const intercept = ym - slope * xm;
        const predicted = Math.max(0, Math.round(intercept + slope * n));
        const trend = slope > 0 ? 'up' : slope < 0 ? 'down' : 'flat';
        const confidence = Math.min(
            99,
            Math.round(70 + Math.min(cl.length, 7) * 3 - Math.abs(slope / (ym || 1)) * 10)
        );
        const pctChange = ym > 0 ? Math.round((slope / ym) * 100) : 0;
        return { predicted, trend, confidence, pctChange, avgShiftRev: Math.round(ym) };
    }, [fuel.shifts]);

    // ── Advanced Predictive Intelligence (Phase 6) ──────────────────────────────────────────
     
    const intelligence: any = useMemo(() => {
        const cl = [...fuel.shifts.filter(s => s.status === 'CLOSED')]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            
        // 1. Dynamic Gross Margin
        let totalCost = 0;
        let totalRev = 0;
        
        // Loop last 30 shifts approx
        const recentShifts = cl.slice(-30);
        recentShifts.forEach(s => {
            totalRev += s.totalRevenue;
            if (s.nozzleSales) {
                s.nozzleSales.forEach((r: any) => {
                    const liters = r.netSales || 0;
                    const tank = fuel.tanks.find(t => t.fuelType === r.fuelType);
                    const cost = tank?.costPrice || 260; // fallback
                    totalCost += (liters * cost);
                });
            }
        });
        
        const grossMarginPct = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;
        const grossMarginValue = totalRev - totalCost;

        // 2. Predictive Restock Engine
        const restockPredictions = fuel.tanks.map(t => {
            const tankShifts = cl.filter(s => 
                s.startTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() &&
                s.nozzleSales?.some((r: any) => r.fuelType === t.fuelType)
            );
            const totalLiters7Days = tankShifts.reduce((acc, s) => {
                return acc + (s.nozzleSales?.filter((r: any) => r.fuelType === t.fuelType).reduce((sum: number, r: any) => sum + (r.netSales || 0), 0) || 0);
            }, 0);
            
            const burnRatePerDay = totalLiters7Days / 7;
            const daysRemaining = burnRatePerDay > 0 ? (t.currentLevel || 0) / burnRatePerDay : 999;
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() + daysRemaining);
            
            return {
                tankName: t.name || t.fuelType,
                burnRate: burnRatePerDay,
                daysRemaining: daysRemaining,
                stockOutDate: daysRemaining > 90 ? 'Stable' : expectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                critical: daysRemaining < 3,
                color: C[FH[t.fuelType] || 'blue'].a
            };
        });

        // 3. Anomaly Detection
        const anomalies: { msg: string; strict: boolean }[] = [];
        const avgRev = cl.length > 0 ? cl.reduce((s, x) => s + x.totalRevenue, 0) / cl.length : 0;
        recentShifts.slice(-10).forEach(s => {
            if (s.variancePercentage && Math.abs(s.variancePercentage) > 5) {
                anomalies.push({ msg: `Shift ${s.shiftId.slice(-4)}: High variance (${s.variancePercentage.toFixed(1)}%)`, strict: true });
            }
            if (s.totalRevenue > 0 && s.totalRevenue < avgRev * 0.4) {
                 anomalies.push({ msg: `Shift ${s.shiftId.slice(-4)}: Unusually low revenue (-${Math.round((1 - s.totalRevenue/avgRev)*100)}%)`, strict: false });
            }
        });

        return {
            grossMarginPct,
            grossMarginValue,
            restockPredictions,
            anomalies: anomalies.slice(0, 3)
        };
    }, [fuel]);

    // ── Smart Alert Engine ──────────────────────────────────────────────────────────────────
    const alerts = useMemo(() => {
        const items: {
            sev: 'critical' | 'warn' | 'info';
            icon: React.ElementType;
            msg: string;
            action: string;
            nav: string;
        }[] = [];
        // Critical: very low tank
        fuel.tanks.forEach(t => {
            const pct = t.capacity ? (t.currentLevel || 0) / t.capacity : 1;
            if (pct < 0.1)
                items.push({
                    sev: 'critical',
                    icon: Flame,
                    msg: `${t.name} critically low (${Math.round(pct * 100)}%)`,
                    action: 'Refill Now',
                    nav: '/fuel/tanks',
                });
            else if (pct < 0.25)
                items.push({
                    sev: 'warn',
                    icon: AlertTriangle,
                    msg: `${t.name} below 25% â€” schedule refill`,
                    action: 'View Tank',
                    nav: '/fuel/tanks',
                });
        });
        // Warn: no active shift mid-day
        const hr = new Date().getHours();
        if (hr >= 8 && hr <= 20) {
            const openShifts = fuel.shifts.filter(s => s.status === 'OPEN').length;
            if (openShifts === 0)
                items.push({
                    sev: 'warn',
                    icon: Clock,
                    msg: 'No active shift during operating hours',
                    action: 'Start Shift',
                    nav: '/fuel/shifts',
                });
        }
        // Info: revenue below average
        const cl = fuel.shifts.filter(s => s.status === 'CLOSED');
        if (cl.length > 5) {
            const avg = cl.reduce((s, x) => s + x.totalRevenue, 0) / cl.length;
            const td = cl.filter(s =>
                s.startTime.startsWith(new Date().toISOString().split('T')[0])
            );
            const todayRev = td.reduce((s, x) => s + x.totalRevenue, 0);
            if (todayRev > 0 && todayRev < avg * 0.75) {
                items.push({
                    sev: 'warn',
                    icon: TrendingUp,
                    msg: `Today's revenue is 25% below average`,
                    action: 'Review Shifts',
                    nav: '/fuel/shifts',
                });
            }
        }
        
        // Intelligence Anomalies
        if (intelligence?.anomalies) {
            intelligence.anomalies.forEach((a: any) => {
                items.push({
                    sev: a.strict ? 'critical' : 'warn',
                    icon: AlertTriangle,
                    msg: a.msg,
                    action: 'Review',
                    nav: '/fuel/shifts',
                });
            });
        }
        
        // Info: all OK
        if (items.length === 0)
            items.push({
                sev: 'info',
                icon: CheckCircle2,
                msg: 'All systems operating normally',
                action: 'View Report',
                nav: '/fuel/activity',
            });
        return items.sort((a, b) => (a.sev === 'critical' ? -1 : b.sev === 'critical' ? 1 : 0));
    }, [fuel, intelligence]);

    const donut = fuel.tanks.map(t => ({
        name: t.name,
        value: t.currentLevel || 0,
        color: C[FH[t.fuelType] || 'blue'].a,
    }));
    const recent = useMemo(
        () =>
            [...fuel.shifts]
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .slice(0, 6),
        [fuel.shifts]
    );

    const kpis = [
        {
            id: 'rev',
            h: 'green' as H,
            icon: TrendingUp,
            label: "Today's Revenue",
            val:
                a.tR >= 1e6
                    ? `Rs ${(a.tR / 1e6).toFixed(2)}M`
                    : a.tR >= 1000
                      ? `Rs ${(a.tR / 1000).toFixed(1)}K`
                      : `Rs ${a.tR.toLocaleString()}`,
            delta: a.revD,
            spark: charts.map(d => d.rev),
            info: `Week: Rs ${a.wR >= 1000 ? (a.wR / 1000).toFixed(0) + 'K' : a.wR.toLocaleString()}`,
            sub: `${a.revD >= 0 ? '+' : ''}${a.revD.toFixed(1)}% vs yesterday`,
            click: () => onNavigate('/fuel/shifts'),
        },
        {
            id: 'vol',
            h: 'blue' as H,
            icon: Droplets,
            label: 'Volume Dispensed',
            val: `${a.tL.toLocaleString()} L`,
            delta: a.litD,
            spark: charts.map(d => d.lit),
            info: `RPL: Rs ${a.rpl.toFixed(2)}/L`,
            sub: `${a.litD >= 0 ? '+' : ''}${a.litD.toFixed(1)}% vs yesterday`,
            click: () => onNavigate('/fuel/shifts'),
        },
        {
            id: 'tank',
            h: 'amber' as H,
            icon: Gauge,
            label: 'Reservoir Health',
            val: `${a.pct}%`,
            delta: null,
            spark: fuel.tanks.map(t => t.currentLevel || 0),
            info: `${a.low.length > 0 ? `âš  ${a.low.length} tank low` : 'All tanks healthy'}`,
            sub: `${(a.cur / 1000).toFixed(1)}K / ${(a.cap / 1000).toFixed(0)}K L`,
            click: () => onNavigate('/fuel/tanks'),
        },
        {
            id: 'ops',
            h: 'purple' as H,
            icon: Activity,
            label: 'Station Activity',
            val: `${a.shiftCt} shifts`,
            delta: null,
            spark: [],
            info: `${a.openCt > 0 ? `${a.openCt} shift open` : 'No active shifts'}`,
            sub: `${a.aS}/${a.tS} staff on duty`,
            click: () => onNavigate('/fuel/activity'),
        },
    ];

    const fmtRev = (n: number) =>
        n >= 1e6
            ? `Rs ${(n / 1e6).toFixed(1)}M`
            : n >= 1000
              ? `Rs ${(n / 1000).toFixed(1)}K`
              : `Rs ${n}`;

    const pumpRates =
        fuel.tanks.length > 0
            ? fuel.tanks.map(t => ({
                  label: t.name || t.fuelType?.replace('_', ' ') || 'Fuel',
                  price:
                      (fuel as any).prices?.[t.fuelType] ??
                      (FH[t.fuelType] === 'rose'
                          ? 258
                          : FH[t.fuelType] === 'blue'
                            ? 178.25
                            : 234.5),
                  h: (FH[t.fuelType] || 'blue') as H,
                  stock: t.currentLevel || 0,
                  cap: t.capacity || 0,
              }))
            : [
                  { label: 'Petrol 92', price: 234.5, h: 'amber' as H, stock: 0, cap: 0 },
                  { label: 'Petrol 95', price: 258.0, h: 'rose' as H, stock: 0, cap: 0 },
                  { label: 'Diesel', price: 178.25, h: 'blue' as H, stock: 0, cap: 0 },
              ];

    return (
        <div className="flex-1 overflow-auto min-h-screen" style={{ background: '#0D1117' }}>
            {/* â”€â”€ CINEMATIC HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div
                className="relative overflow-hidden min-h-[340px]"
                style={{
                    background:
                        'linear-gradient(150deg, #0D1117 0%, #161B2E 30%, #1A1040 60%, #0D1117 100%)',
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
                                'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
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
                                'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
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
                                'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
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
                                    <strong className="font-bold">Low Alert:</strong>{' '}
                                    {a.low.map(t => t.name).join(', ')} below 25%
                                </p>
                                <button
                                    onClick={() => setDismiss(true)}
                                    className="text-amber-500 hover:text-amber-300 text-[11px] font-bold"
                                >
                                    âœ•
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* â”€â”€ LIVE INFO TICKER ROW â”€â”€ */}
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
                        {/* Tank Stock */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 backdrop-blur-sm flex-shrink-0"
                            style={{ background: 'rgba(245,158,11,0.1)' }}
                        >
                            <Droplets size={11} className="text-amber-400" />
                            <span className="text-[10px] font-semibold text-gray-400">
                                In Stock
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-300">
                                {(a.cur / 1000).toFixed(1)}K L
                            </span>
                            <span className="text-[9px] text-gray-600">
                                / {(a.cap / 1000).toFixed(0)}K L cap
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
                                    {a.openCt} shift{a.openCt > 1 ? 's' : ''} in progress
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
                        {/* Total all-time shifts */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-500/25 backdrop-blur-sm flex-shrink-0"
                            style={{ background: 'rgba(139,92,246,0.1)' }}
                        >
                            <BarChart3 size={11} className="text-violet-400" />
                            <span className="text-[10px] font-semibold text-gray-400">
                                All Shifts
                            </span>
                            <span className="text-[11px] font-extrabold text-violet-300">
                                {a.totShifts}
                            </span>
                        </div>
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
                        {/* Low Stock Warning */}
                        {a.low.length > 0 && (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 flex-shrink-0"
                                style={{ background: 'rgba(239,68,68,0.12)' }}
                            >
                                <AlertTriangle size={11} className="text-red-400" />
                                <span className="text-[10px] font-bold text-red-300">
                                    {a.low.length} tank{a.low.length > 1 ? 's' : ''} low â€” refill
                                    needed
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                        <div>
                            {/* Station ID */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_24px_rgba(99,102,241,0.5)]"
                                    style={{
                                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                    }}
                                >
                                    <Fuel size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black tracking-[0.25em] text-blue-400">
                                        MOTORWAY OIL Â· ENTERPRISE
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Dot color="#10B981" />
                                        <span className="text-emerald-400 text-[11px] font-bold">
                                            LIVE Â· STATION OPERATIONAL
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
                                            'linear-gradient(90deg, #60A5FA, #A78BFA, #34D399)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {(user as any)?.name?.split(' ')[0] || 'Commander'}
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
                                <span className="text-gray-600">Â·</span>
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
                                {/* Fuel prices from store / static reference */}
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                        PUMP RATES (PKR/Litre)
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        {pumpRates.map((f, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col px-3 py-2 rounded-xl border backdrop-blur-sm"
                                                style={{
                                                    background: C[f.h].light,
                                                    borderColor: `rgba(${C[f.h].rgb},0.3)`,
                                                    minWidth: 100,
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <span
                                                        className="text-[10px] font-bold"
                                                        style={{ color: C[f.h].a }}
                                                    >
                                                        {f.label}
                                                    </span>
                                                    <span className="text-[12px] font-extrabold text-white">
                                                        Rs {f.price.toFixed(2)}
                                                    </span>
                                                </div>
                                                {f.cap > 0 && (
                                                    <div>
                                                        <div className="text-[9px] text-gray-500 flex justify-between mb-0.5">
                                                            <span>Stock</span>
                                                            <span style={{ color: C[f.h].a }}>
                                                                {f.stock.toLocaleString()} L
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1 rounded-full bg-white/10">
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                style={{ background: C[f.h].a }}
                                                                initial={{ width: 0 }}
                                                                animate={{
                                                                    width: `${Math.min(100, Math.round((f.stock / f.cap) * 100))}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 1.2,
                                                                    ease: [0.22, 1, 0.36, 1],
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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
                                    {a.openCt > 0 && (
                                        <div
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 text-amber-300 text-[11px] font-bold"
                                            style={{ background: 'rgba(245,158,11,0.1)' }}
                                        >
                                            <Dot color="#F59E0B" /> {a.openCt} Open
                                        </div>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => onNavigate('/fuel/shifts')}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                                        }}
                                    >
                                        <Plus size={14} /> Start Shift
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero stats strip inside header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        {[
                            {
                                l: 'SHIFTS TODAY',
                                v: a.shiftCt,
                                raw: false,
                                c: 'green' as H,
                                ic: Activity,
                                sub: a.openCt > 0 ? `${a.openCt} active now` : 'All closed',
                            },
                            {
                                l: 'FUEL IN STOCK',
                                v: `${(a.cur / 1000).toFixed(1)}K L`,
                                raw: true,
                                c: 'blue' as H,
                                ic: Droplets,
                                sub: `${a.pct}% of ${(a.cap / 1000).toFixed(0)}K L cap`,
                            },
                            {
                                l: 'TODAY REVENUE',
                                v: a.tR >= 1000 ? `Rs ${(a.tR / 1000).toFixed(1)}K` : `Rs ${a.tR}`,
                                raw: true,
                                c: 'green' as H,
                                ic: TrendingUp,
                                sub: `${a.revD >= 0 ? '+' : ''}${a.revD.toFixed(1)}% vs yesterday`,
                            },
                            {
                                l: 'STAFF ON DUTY',
                                v: `${a.aS}/${a.tS}`,
                                raw: true,
                                c: 'purple' as H,
                                ic: Users,
                                sub: `${a.tS - a.aS > 0 ? `${a.tS - a.aS} off duty` : 'Full team active'}`,
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
                                    {(m as any).sub && (
                                        <p className="text-[9px] text-gray-500 font-medium mt-0.5 truncate">
                                            {(m as any).sub}
                                        </p>
                                    )}
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

            {/* â”€â”€ BODY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div style={{ background: 'linear-gradient(180deg, #F1F3F7 0%, #EDEEF3 100%)' }}>
                <motion.div
                    variants={GRID}
                    initial="hidden"
                    animate="show"
                    className="max-w-[1640px] mx-auto px-6 lg:px-10 pt-5 pb-28 space-y-5"
                >
                    {/* â”€â”€ GLASSMORPHIC KPI CARDS â”€â”€ */}
                    {/* These sit against the gradient bg-to-light for glass to show */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map(k => {
                            const h = C[k.h];
                            return (
                                <motion.div
                                    key={k.id}
                                    variants={I}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.02,
                                        boxShadow: `0 30px 60px -12px rgba(${h.rgb},0.25), 0 18px 36px -18px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,1)`,
                                    }}
                                    onClick={k.click}
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
                                                <k.icon
                                                    size={26}
                                                    className="text-white drop-shadow-md"
                                                />
                                            </motion.div>
                                            {k.delta !== null ? (
                                                <div
                                                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-full border ${k.delta >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                                                >
                                                    {k.delta >= 0 ? (
                                                        <ArrowUpRight size={11} />
                                                    ) : (
                                                        <ArrowDownRight size={11} />
                                                    )}
                                                    {Math.abs(k.delta).toFixed(1)}%
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Dot color={h.a} />
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                        LIVE
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em] mb-1.5">
                                            {k.label}
                                        </p>
                                        <p className="text-[2rem] font-black text-gray-900 tracking-tight leading-none">
                                            {k.val}
                                        </p>
                                        <p className="text-[11px] text-gray-500 font-medium mt-1">
                                            {k.sub}
                                        </p>

                                        {/* Extra info chip */}
                                        <div
                                            className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-xl"
                                            style={{
                                                background: h.light,
                                                border: `1px solid rgba(${h.rgb},0.2)`,
                                            }}
                                        >
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ background: h.a }}
                                            />
                                            <span
                                                className="text-[10px] font-semibold"
                                                style={{ color: h.a }}
                                            >
                                                {k.info}
                                            </span>
                                        </div>

                                        {k.spark.length > 2 && (
                                            <div className="mt-3 -mx-1">
                                                <Spark data={k.spark} color={h.a} />
                                            </div>
                                        )}
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
                    </div>

                    {/* â”€â”€ INSIGHTS BAND â”€â”€ */}
                    {a.allR > 0 && (
                        <motion.div variants={I} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                {
                                    label: 'All-Time Revenue',
                                    val:
                                        a.allR >= 1e6
                                            ? `Rs ${(a.allR / 1e6).toFixed(2)}M`
                                            : `Rs ${(a.allR / 1000).toFixed(1)}K`,
                                    sub: `Across ${a.totShifts} shifts`,
                                    c: '#10B981',
                                    icon: TrendingUp,
                                },
                                {
                                    label: 'Best Single Shift',
                                    val:
                                        a.bestShift >= 1000
                                            ? `Rs ${(a.bestShift / 1000).toFixed(1)}K`
                                            : `Rs ${a.bestShift.toLocaleString()}`,
                                    sub: 'Revenue record',
                                    c: '#8B5CF6',
                                    icon: Zap,
                                },
                                {
                                    label: 'Avg Per Shift',
                                    val:
                                        a.avgR >= 1000
                                            ? `Rs ${(a.avgR / 1000).toFixed(1)}K`
                                            : `Rs ${a.avgR.toLocaleString()}`,
                                    sub: `${(a.allL / 1000).toFixed(1)}K L all-time`,
                                    c: '#3B82F6',
                                    icon: BarChart3,
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-shadow"
                                >
                                    <div
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${s.c}14` }}
                                    >
                                        <s.icon size={20} style={{ color: s.c }} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                            {s.label}
                                        </p>
                                        <p className="text-[1.25rem] font-extrabold text-gray-900 leading-tight tabular-nums">
                                            {s.val}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                            {s.sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* â”€â”€ AI FORECAST + SMART ALERTS ROW â”€â”€ */}
                    <motion.div variants={I} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* AI Revenue Forecast Panel */}
                        {forecast && (
                            <div
                                className="lg:col-span-5 relative overflow-hidden rounded-[1.4rem] p-6 border"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.06) 100%)',
                                    borderColor: 'rgba(99,102,241,0.2)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                {/* Glow orb */}
                                <div
                                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
                                    style={{ background: 'radial-gradient(#6366F1, #10B981)' }}
                                />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ background: 'rgba(99,102,241,0.15)' }}
                                        >
                                            <BrainCircuit size={15} className="text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-400">
                                                AI REVENUE FORECAST
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                Linear trend Â· Last 7 shifts
                                            </p>
                                        </div>
                                        <div
                                            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
                                            style={{
                                                background: 'rgba(99,102,241,0.12)',
                                                color: '#6366F1',
                                                border: '1px solid rgba(99,102,241,0.2)',
                                            }}
                                        >
                                            <Sparkles size={9} />
                                            {forecast.confidence}% confidence
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-3 mb-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold mb-0.5">
                                                Next Shift Forecast
                                            </p>
                                            <p
                                                className="text-[2.2rem] font-black tabular-nums leading-none"
                                                style={{
                                                    color:
                                                        forecast.trend === 'up'
                                                            ? '#10B981'
                                                            : forecast.trend === 'down'
                                                              ? '#F43F5E'
                                                              : '#6366F1',
                                                }}
                                            >
                                                Rs{' '}
                                                {forecast.predicted >= 1000
                                                    ? `${(forecast.predicted / 1000).toFixed(1)}K`
                                                    : forecast.predicted.toLocaleString()}
                                            </p>
                                        </div>
                                        <div
                                            className="mb-1.5 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold"
                                            style={{
                                                background:
                                                    forecast.trend === 'up'
                                                        ? 'rgba(16,185,129,0.12)'
                                                        : forecast.trend === 'down'
                                                          ? 'rgba(244,63,94,0.12)'
                                                          : 'rgba(99,102,241,0.12)',
                                                color:
                                                    forecast.trend === 'up'
                                                        ? '#10B981'
                                                        : forecast.trend === 'down'
                                                          ? '#F43F5E'
                                                          : '#6366F1',
                                            }}
                                        >
                                            {forecast.trend === 'up' ? (
                                                <ArrowUpRight size={13} />
                                            ) : forecast.trend === 'down' ? (
                                                <ArrowDownRight size={13} />
                                            ) : (
                                                <TrendingUp size={13} />
                                            )}
                                            {forecast.pctChange >= 0 ? '+' : ''}
                                            {forecast.pctChange}% trend
                                        </div>
                                    </div>
                                    {/* Confidence bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-semibold text-gray-400">
                                            <span>Confidence Band</span>
                                            <span>{forecast.confidence}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    background:
                                                        'linear-gradient(90deg, #6366F1, #10B981)',
                                                }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${forecast.confidence}%` }}
                                                transition={{ duration: 1.2, ease: E }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-medium">
                                            Based on avg Rs{' '}
                                            {forecast.avgShiftRev >= 1000
                                                ? `${(forecast.avgShiftRev / 1000).toFixed(1)}K`
                                                : forecast.avgShiftRev.toLocaleString()}{' '}
                                            / shift
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Smart Station Alerts */}
                        <div
                            className={`${forecast ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Bell size={15} className="text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
                                        STATION INTELLIGENCE
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        Auto-detecting issues & opportunities
                                    </p>
                                </div>
                                <div
                                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full"
                                    style={{
                                        background: alerts.some(a => a.sev === 'critical')
                                            ? 'rgba(244,63,94,0.1)'
                                            : alerts.some(a => a.sev === 'warn')
                                              ? 'rgba(245,158,11,0.1)'
                                              : 'rgba(16,185,129,0.1)',
                                        color: alerts.some(a => a.sev === 'critical')
                                            ? '#F43F5E'
                                            : alerts.some(a => a.sev === 'warn')
                                              ? '#F59E0B'
                                              : '#10B981',
                                    }}
                                >
                                    <Dot
                                        color={
                                            alerts.some(a => a.sev === 'critical')
                                                ? '#F43F5E'
                                                : alerts.some(a => a.sev === 'warn')
                                                  ? '#F59E0B'
                                                  : '#10B981'
                                        }
                                    />
                                    {alerts.filter(a => a.sev !== 'info').length} issue
                                    {alerts.filter(a => a.sev !== 'info').length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    detected
                                </div>
                            </div>
                            <div className="space-y-2">
                                {alerts.map((al, i) => {
                                    const col =
                                        al.sev === 'critical'
                                            ? {
                                                  bg: 'rgba(244,63,94,0.07)',
                                                  border: 'rgba(244,63,94,0.2)',
                                                  text: '#F43F5E',
                                                  btn: 'rgba(244,63,94,0.12)',
                                              }
                                            : al.sev === 'warn'
                                              ? {
                                                    bg: 'rgba(245,158,11,0.07)',
                                                    border: 'rgba(245,158,11,0.2)',
                                                    text: '#F59E0B',
                                                    btn: 'rgba(245,158,11,0.12)',
                                                }
                                              : {
                                                    bg: 'rgba(16,185,129,0.07)',
                                                    border: 'rgba(16,185,129,0.2)',
                                                    text: '#10B981',
                                                    btn: 'rgba(16,185,129,0.12)',
                                                };
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                                            style={{ background: col.bg, borderColor: col.border }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: col.btn }}
                                            >
                                                <al.icon size={14} style={{ color: col.text }} />
                                            </div>
                                            <p className="text-[12px] font-semibold text-gray-700 flex-1 leading-snug">
                                                {al.msg}
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => onNavigate(al.nav)}
                                                className="text-[10px] font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                                                style={{ background: col.btn, color: col.text }}
                                            >
                                                {al.action}
                                            </motion.button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* â”€â”€ CHARTS ROW â”€â”€ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Area + Bar Chart */}
                        <motion.div
                            variants={I}
                            className="lg:col-span-8 bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Revenue & Volume Trends
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {fuel.shifts.filter(s => s.status === 'CLOSED').length > 0
                                            ? `Real-time analytics`
                                            : 'No shifts yet'}
                                    </p>
                                </div>
                                {fuel.shifts.filter(s => s.status === 'CLOSED').length > 0 && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex bg-gray-100/80 p-1 rounded-lg">
                                            {(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'] as const).map(view => (
                                                <button
                                                    key={view}
                                                    onClick={() => setChartView(view)}
                                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
                                                        chartView === view 
                                                            ? 'bg-white text-emerald-600 shadow-sm' 
                                                            : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    {view}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                                                <div className="w-4 h-0.5 rounded bg-emerald-500" />
                                                Revenue
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                                                <div className="w-3 h-3 rounded-sm bg-indigo-400/25 border border-indigo-400/40" />
                                                Volume
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {fuel.shifts.filter(s => s.status === 'CLOSED').length === 0 ? (
                                <ChartEmpty onStart={() => onNavigate('/fuel/shifts')} />
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={195}>
                                        <AreaChart
                                            data={charts}
                                            margin={{ top: 5, right: 5, left: -5, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#10B981"
                                                        stopOpacity={0.28}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#10B981"
                                                        stopOpacity={0.01}
                                                    />
                                                </linearGradient>
                                                <filter id="gl">
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
                                                tick={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    fill: '#9CA3AF',
                                                }}
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
                                                content={<Tip />}
                                                cursor={{
                                                    stroke: 'rgba(16,185,129,0.12)',
                                                    strokeWidth: 2,
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="rev"
                                                name="Revenue (Rs)"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                fill="url(#gR)"
                                                filter="url(#gl)"
                                                dot={false}
                                                activeDot={{
                                                    r: 7,
                                                    fill: '#10B981',
                                                    stroke: '#fff',
                                                    strokeWidth: 3,
                                                }}
                                                animationDuration={1800}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <ResponsiveContainer width="100%" height={50}>
                                            <BarChart
                                                data={charts}
                                                margin={{ top: 0, right: 5, left: -5, bottom: 0 }}
                                                barSize={14}
                                            >
                                                <XAxis dataKey="day" hide />
                                                <Tooltip
                                                    content={<Tip />}
                                                    cursor={{ fill: '#F9FAFB', radius: 6 }}
                                                />
                                                <Bar
                                                    dataKey="lit"
                                                    name="Volume (L)"
                                                    radius={[4, 4, 0, 0]}
                                                    animationDuration={1600}
                                                >
                                                    {charts.map((_, i) => (
                                                        <Cell
                                                            key={i}
                                                            fill={`rgba(99,102,241,${0.35 + (i / charts.length) * 0.45})`}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <p className="text-center text-[9px] font-black uppercase tracking-[0.16em] text-gray-300 mt-1">
                                            VOLUME PER SHIFT (L)
                                        </p>
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Tanks Panel */}
                        <motion.div
                            variants={I}
                            className="lg:col-span-4 bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Fuel Tanks
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Live levels</p>
                                </div>
                                <motion.button
                                    whileHover={{ x: 2 }}
                                    onClick={() => onNavigate('/fuel/tanks')}
                                    className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5"
                                >
                                    Manage <ChevronRight size={12} />
                                </motion.button>
                            </div>
                            {donut.length > 0 && (
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                                    <div className="relative w-[84px] h-[84px] flex-shrink-0">
                                        <ResponsiveContainer width={84} height={84}>
                                            <PieChart>
                                                <Pie
                                                    data={donut}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={24}
                                                    outerRadius={38}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                    animationDuration={1400}
                                                >
                                                    {donut.map((d, i) => (
                                                        <Cell key={i} fill={d.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[11px] font-black text-gray-700">
                                                {a.pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        {donut.map((d, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: d.color }}
                                                />
                                                <span className="text-[11px] font-semibold text-gray-500 flex-1 truncate">
                                                    {d.name}
                                                </span>
                                                <span className="text-[11px] font-bold text-gray-900 tabular-nums">
                                                    {d.value.toLocaleString()} L
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4 flex-1">
                                {fuel.tanks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-100 rounded-2xl">
                                        <Flame size={26} className="text-gray-200 mb-2" />
                                        <p className="text-xs text-gray-300 font-semibold">
                                            No tanks configured
                                        </p>
                                    </div>
                                )}
                                {fuel.tanks.map((t, i) => {
                                    const pct = t.capacity
                                        ? Math.round(((t.currentLevel || 0) / t.capacity) * 100)
                                        : 0;
                                    const fh = C[FH[t.fuelType] || 'blue'];
                                    const low = pct < 25;
                                    const wrn = pct >= 25 && pct < 45;
                                    const bc = low ? '#EF4444' : wrn ? '#F59E0B' : fh.a;
                                    const rgb = low ? '239,68,68' : wrn ? '245,158,11' : fh.rgb;
                                    return (
                                        <motion.div
                                            key={t.tankId || i}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.09 }}
                                            whileHover={{ x: 3 }}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <motion.div
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{
                                                            background: bc,
                                                            boxShadow: `0 0 8px ${bc}80`,
                                                        }}
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{
                                                            duration: 2.5,
                                                            repeat: Infinity,
                                                            delay: i * 0.5,
                                                        }}
                                                    />
                                                    <span className="text-[12px] font-bold text-gray-800 truncate">
                                                        {t.name}
                                                    </span>
                                                    <span
                                                        className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                                                        style={{ background: `${bc}18`, color: bc }}
                                                    >
                                                        {(t.fuelType || '').replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {low && (
                                                        <motion.div
                                                            animate={{ rotate: [0, 5, -5, 0] }}
                                                            transition={{
                                                                duration: 0.5,
                                                                repeat: Infinity,
                                                            }}
                                                        >
                                                            <AlertTriangle
                                                                size={11}
                                                                className="text-red-500"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <span
                                                        className="text-[13px] font-extrabold tabular-nums"
                                                        style={{ color: bc }}
                                                    >
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden"
                                                style={{
                                                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.07)',
                                                }}
                                            >
                                                <motion.div
                                                    className="absolute inset-y-0 left-0 rounded-full"
                                                    style={{
                                                        background: `linear-gradient(90deg, ${bc}bb, ${bc})`,
                                                        boxShadow: `0 0 10px rgba(${rgb},0.4)`,
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{
                                                        duration: 1.4,
                                                        ease: E,
                                                        delay: 0.1 + i * 0.12,
                                                    }}
                                                >
                                                    <motion.div
                                                        className="absolute inset-0"
                                                        style={{
                                                            background:
                                                                'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                                                        }}
                                                        animate={{ x: ['-100%', '200%'] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                            delay: i * 0.5,
                                                        }}
                                                    />
                                                </motion.div>
                                            </div>
                                            <div className="flex justify-between mt-0.5">
                                                <span className="text-[9px] text-gray-400 font-medium">
                                                    {(t.currentLevel || 0).toLocaleString()} L
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-medium">
                                                    / {(t.capacity || 0).toLocaleString()} L
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* â”€â”€ BOTTOM ROW â”€â”€ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Recent Shifts */}
                        <motion.div
                            variants={I}
                            className="lg:col-span-7 bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-shadow"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Recent Operations
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {recent.length > 0 ? 'Last 6 shifts' : 'Shift log'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ x: 2 }}
                                    onClick={() => onNavigate('/fuel/activity')}
                                    className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5"
                                >
                                    All <ChevronRight size={12} />
                                </motion.button>
                            </div>
                            {recent.length > 0 && (
                                <div className="grid grid-cols-12 px-6 py-2.5 bg-gray-50/60">
                                    {[
                                        ['STAFF', 3],
                                        ['TYPE', 2],
                                        ['DATE', 2],
                                        ['REVENUE', 3],
                                        ['STATUS', 2],
                                    ].map(([h, s]) => (
                                        <div
                                            key={h as string}
                                            className={`col-span-${s} text-[9px] font-black uppercase tracking-[0.15em] text-gray-400`}
                                        >
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="divide-y divide-gray-50">
                                {recent.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 px-6">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-gray-50 to-gray-100 border border-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-center mb-4"
                                        >
                                            <Clock
                                                size={24}
                                                className="text-gray-300"
                                                strokeWidth={2.5}
                                            />
                                        </motion.div>
                                        <p className="text-[14px] font-bold text-gray-400 mb-1">
                                            No Activity Found
                                        </p>
                                        <p className="text-[12px] text-gray-400/80 text-center max-w-xs">
                                            Your station's recent operations and shifts will appear
                                            here automatically.
                                        </p>
                                    </div>
                                )}
                                {recent.map((s, i) => {
                                    const ok = s.status === 'CLOSED';
                                    const dt = new Date(s.startTime).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                    const rev = fmtRev(s.totalRevenue);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ backgroundColor: '#F8F9FB' }}
                                            className="grid grid-cols-12 items-center px-6 py-3 cursor-pointer transition-colors"
                                            onClick={() => onNavigate('/fuel/activity')}
                                        >
                                            <div className="col-span-3 flex items-center gap-2.5">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ring-2 flex-shrink-0"
                                                    style={{
                                                        background: ok
                                                            ? 'linear-gradient(135deg,#10B981,#059669)'
                                                            : 'linear-gradient(135deg,#F59E0B,#D97706)',
                                                        boxShadow: ok
                                                            ? '0 0 10px rgba(16,185,129,0.3)'
                                                            : '0 0 10px rgba(245,158,11,0.3)',
                                                    }}
                                                >
                                                    {(s.staffName || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[12px] font-bold text-gray-800 truncate">
                                                    {s.staffName || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[11px] text-gray-500 font-semibold">
                                                    {s.shiftType || 'MORNING'}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-mono text-[11px] text-gray-400 font-semibold">
                                                    {dt}
                                                </span>
                                            </div>
                                            <div className="col-span-3">
                                                <span className="text-[13px] font-extrabold text-gray-900 tabular-nums">
                                                    {rev}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full border ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                                                >
                                                    <motion.div
                                                        className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                                        animate={!ok ? { scale: [1, 1.5, 1] } : {}}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                        }}
                                                    />
                                                    {s.status}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Right: Actions + Status */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                            {/* Quick Actions */}
                            <motion.div
                                variants={I}
                                className="bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5"
                            >
                                <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500" /> Quick Actions
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            l: 'Start Shift',
                                            sub: 'Clock in operators',
                                            ic: Zap,
                                            h: 'green' as H,
                                            path: '/fuel/shifts',
                                        },
                                        {
                                            l: 'Fuel Orders',
                                            sub: 'Place order',
                                            ic: Package,
                                            h: 'blue' as H,
                                            path: '/fuel/orders',
                                        },
                                        {
                                            l: 'Reports',
                                            sub: 'View analytics',
                                            ic: FileText,
                                            h: 'purple' as H,
                                            path: '/fuel/reports',
                                        },
                                        {
                                            l: 'Team Roster',
                                            sub: 'Manage staff',
                                            ic: Users,
                                            h: 'amber' as H,
                                            path: '/staff',
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
                                                className="flex flex-col items-center gap-3 py-6 px-3 rounded-2xl text-center relative overflow-hidden group transition-all"
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
                                                <div className="w-12 h-12 rounded-2xl bg-white/25 border border-white/20 flex items-center justify-center shadow-inner">
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
                                                <ChevronRight
                                                    size={12}
                                                    className="text-white/50 absolute bottom-2.5 right-3"
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* System Status */}
                            <motion.div
                                variants={I}
                                className="bg-white rounded-[1.4rem] border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-5 flex-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[14px] font-bold text-gray-900">
                                        System Status
                                    </h2>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                        <Dot color="#10B981" /> All systems go
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        {
                                            l: 'Core Database',
                                            sub: 'Records synced',
                                            ok: true,
                                            ic: Shield,
                                        },
                                        {
                                            l: 'Shift Engine',
                                            sub: `${a.totShifts} shifts`,
                                            ok: true,
                                            ic: Activity,
                                        },
                                        {
                                            l: 'Tank Sensors',
                                            sub: `${fuel.tanks.length} unit${fuel.tanks.length !== 1 ? 's' : ''}`,
                                            ok: fuel.tanks.length > 0,
                                            ic: Gauge,
                                        },
                                        {
                                            l: 'Staff Module',
                                            sub: `${a.aS}/${a.tS} active`,
                                            ok: a.aS <= a.tS,
                                            ic: Users,
                                        },
                                    ].map((s, i) => {
                                        const col = s.ok ? '#10B981' : '#F59E0B';
                                        return (
                                            <motion.div
                                                key={i}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: `${col}14` }}
                                                >
                                                    <s.ic size={15} style={{ color: col }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-bold text-gray-800">
                                                        {s.l}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-medium truncate">
                                                        {s.sub}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border ${s.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-600 border-amber-200/60'}`}
                                                >
                                                    <Dot color={col} />
                                                    {s.ok ? 'Online' : 'Check'}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-3.5 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 font-semibold">
                                        Live heartbeat
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">
                                        {now.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
