import { DateRange, DateRangeFilter } from '@/components/audit/DateRangeFilter';
import { Card, PageHeader } from '@/components/ui';
import { analyticsEngine } from '@/lib/analyticsEngine';
import { useCNGStore } from '@/stores/cngStore';
import { isWithinInterval, parseISO } from 'date-fns';
import {
    Activity,
    BarChart3,
    Calendar,
    Download,
    FileText,
    Gauge,
    Package,
    TrendingUp,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInit = (): DateRange => {
    const now = new Date();
    return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: now.toISOString(),
        preset: 'THIS_MONTH',
    };
};

const fmt = (v: number) => {
    if (v >= 1_000_000) return `₨ ${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `₨ ${(v / 1_000).toFixed(1)}K`;
    return `₨ ${v.toLocaleString()}`;
};

const inRange = (dateStr: string, range: DateRange) => {
    try {
        return isWithinInterval(parseISO(dateStr), {
            start: parseISO(range.startDate),
            end: parseISO(range.endDate),
        });
    } catch {
        return false;
    }
};

// Custom Tooltip
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl p-3 text-xs">
            <p className="font-black text-[var(--text-primary)] mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-[var(--text-secondary)] capitalize">{p.name}:</span>
                    <span className="font-bold text-[var(--text-primary)]">
                        {typeof p.value === 'number' && p.name?.includes('revenue')
                            ? fmt(p.value * 1000)
                            : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CNGReportsPage: React.FC = () => {
    const { shifts, decantingRecords, compressors, cascades } = useCNGStore();
    
    const [dateRange, setDateRange] = useState<DateRange>(getInit());

    // ── Filtered datasets ────────────────────────────────────────────────────
    const filteredShifts = useMemo(
        () => shifts.filter(s => inRange(s.date, dateRange)),
        [shifts, dateRange]
    );

    const filteredDecanting = useMemo(
        () => decantingRecords.filter(r => inRange(r.date, dateRange)),
        [decantingRecords, dateRange]
    );

    // ── KPI summary ──────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const totalRevenue = filteredShifts.reduce((s, sh) => s + sh.totalRevenue, 0);
        const totalKGSold = filteredShifts.reduce((s, sh) => s + sh.totalLitersSold, 0);
        const totalCredits = filteredShifts.reduce((s, sh) => s + (sh.credits || 0), 0);
        const totalProfit = filteredShifts.reduce((s, sh) => {
            return s + (sh.nozzleSales?.reduce((p, ns) => p + (ns.margin || 0), 0) || 0);
        }, 0);

        // Cost of gas = decanting records total cost in range
        const gasCost = filteredDecanting.reduce((s, r) => s + r.totalCost, 0);
        const grossProfit = totalRevenue - gasCost;
        const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const avgPricePerKG = totalKGSold > 0 ? totalRevenue / totalKGSold : 0;

        return { totalRevenue, totalKGSold, totalCredits, totalProfit, gasCost, grossProfit, margin, avgPricePerKG };
    }, [filteredShifts, filteredDecanting]);

    // ── Revenue vs Cost trend by day ──────────────────────────────────────────
    const trendData = useMemo(() => {
        const grouped: Record<string, { kgSold: number; revenue: number; gasCost: number }> = {};
        filteredShifts.forEach(s => {
            if (!grouped[s.date]) grouped[s.date] = { kgSold: 0, revenue: 0, gasCost: 0 };
            grouped[s.date].kgSold += s.totalLitersSold;
            grouped[s.date].revenue += s.totalRevenue;
        });
        filteredDecanting.forEach(r => {
            if (!grouped[r.date]) grouped[r.date] = { kgSold: 0, revenue: 0, gasCost: 0 };
            grouped[r.date].gasCost += r.totalCost;
        });
        return Object.keys(grouped)
            .sort()
            .map(date => ({
                day: parseISO(date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
                kgSold: parseFloat(grouped[date].kgSold.toFixed(1)),
                revenue: parseFloat((grouped[date].revenue / 1000).toFixed(1)),
                gasCost: parseFloat((grouped[date].gasCost / 1000).toFixed(1)),
            }));
    }, [filteredShifts, filteredDecanting]);

    // ── Nozzle-wise performance ───────────────────────────────────────────────
    const nozzlePerf = useMemo(() => {
        const map: Record<string, { kgSold: number; revenue: number; txCount: number }> = {};
        filteredShifts.forEach(s => {
            s.nozzleSales?.forEach(ns => {
                if (!map[ns.nozzleName]) map[ns.nozzleName] = { kgSold: 0, revenue: 0, txCount: 0 };
                map[ns.nozzleName].kgSold += ns.netSales || 0;
                map[ns.nozzleName].revenue += ns.revenue || 0;
                map[ns.nozzleName].txCount += 1;
            });
        });
        return Object.entries(map)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredShifts]);

    // ── Decanting supplier breakdown ──────────────────────────────────────────
    const decantingBySupplier = useMemo(() => {
        const map: Record<string, { totalKG: number; totalCost: number; deliveries: number }> = {};
        filteredDecanting.forEach(r => {
            const key = r.supplier || 'Unknown';
            if (!map[key]) map[key] = { totalKG: 0, totalCost: 0, deliveries: 0 };
            map[key].totalKG += r.totalKG;
            map[key].totalCost += r.totalCost;
            map[key].deliveries += 1;
        });
        return Object.entries(map).map(([supplier, stats]) => ({ supplier, ...stats }));
    }, [filteredDecanting]);

    // ── Cascade/compressor live status ────────────────────────────────────────
    const operationalStatus = useMemo(() => {
        const totalCompressors = compressors.length;
        const activeCompressors = compressors.filter(c => c.status === 'OPERATIONAL').length;
        const maintenanceDue = compressors.filter(
            c => c.operatingHours >= c.nextMaintenanceHours * 0.9
        ).length;
        const avgPressure =
            cascades.length > 0
                ? cascades.reduce((s, c) => s + c.pressure, 0) / cascades.length
                : 0;
        return { totalCompressors, activeCompressors, maintenanceDue, avgPressure };
    }, [compressors, cascades]);

    const hasData = trendData.length > 0;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

    const operationalReports = [
        'Daily CNG Shift Summary',
        'Cascade Bank Pressure History',
        'Compressor Efficiency Report',
        'Nozzle-wise Sale Analysis',
    ];

    const financialReports = [
        'CNG Profit & Loss Statement',
        'Credit Sale Aging (CNG)',
        'Expense Breakdown (CNG)',
        'Decanting Cost Analysis',
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="CNG Reports & Analytics"
                subtitle="Enterprise CNG business intelligence — P&L, inventory, nozzle performance, pressure analytics"
                actions={
                    <button
                        onClick={() => analyticsEngine.exportToCSV('CNG_Shifts', filteredShifts)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                }
            />

            {/* Date Range */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">Reporting Period</span>
                </div>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                    <TrendingUp size={18} className="mb-2 opacity-60" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-2xl font-black mt-1">{fmt(kpis.totalRevenue)}</h3>
                    <p className="text-[10px] mt-2 font-bold opacity-60">Avg: {fmt(kpis.avgPricePerKG)}/KG</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                    <BarChart3 size={18} className="mb-2 opacity-60" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Gross Profit</p>
                    <h3 className="text-2xl font-black mt-1">{fmt(kpis.grossProfit)}</h3>
                    <p className="text-[10px] mt-2 font-bold opacity-60">Margin: {kpis.margin.toFixed(1)}%</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-700 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                    <Package size={18} className="mb-2 opacity-60" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">KG Sold</p>
                    <h3 className="text-2xl font-black mt-1">{kpis.totalKGSold.toLocaleString()} KG</h3>
                    <p className="text-[10px] mt-2 font-bold opacity-60">Gas Cost: {fmt(kpis.gasCost)}</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-700 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                    <FileText size={18} className="mb-2 opacity-60" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Credit Sales</p>
                    <h3 className="text-2xl font-black mt-1">{fmt(kpis.totalCredits)}</h3>
                    <p className="text-[10px] mt-2 font-bold opacity-60">
                        {kpis.totalRevenue > 0
                            ? ((kpis.totalCredits / kpis.totalRevenue) * 100).toFixed(0)
                            : 0}% of total
                    </p>
                </Card>
            </div>

            {/* Operational Status Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-3 border-l-4 border-emerald-500">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Compressors</p>
                        <p className="text-lg font-black text-[var(--text-primary)]">
                            {operationalStatus.activeCompressors}/{operationalStatus.totalCompressors}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold">Operational</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3 border-l-4 border-blue-500">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <Gauge size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Avg Pressure</p>
                        <p className="text-lg font-black text-[var(--text-primary)]">
                            {operationalStatus.avgPressure.toFixed(0)} bar
                        </p>
                        <p className="text-[10px] text-blue-600 font-bold">Cascade Banks</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3 border-l-4 border-amber-500">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Maintenance Due</p>
                        <p className="text-lg font-black text-[var(--text-primary)]">
                            {operationalStatus.maintenanceDue}
                        </p>
                        <p className="text-[10px] text-amber-600 font-bold">Units</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3 border-l-4 border-purple-500">
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                        <Package size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Deliveries</p>
                        <p className="text-lg font-black text-[var(--text-primary)]">
                            {filteredDecanting.length}
                        </p>
                        <p className="text-[10px] text-purple-600 font-bold">In Period</p>
                    </div>
                </Card>
            </div>

            {/* Revenue vs Gas Cost Trend Chart */}
            <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <TrendingUp className="text-blue-500" size={18} />
                            Revenue vs Gas Cost Trend
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Daily revenue (₨K, blue) vs gas procurement cost (₨K, rose)
                        </p>
                    </div>
                    <button
                        onClick={() => analyticsEngine.exportToCSV('CNG_Trend', trendData)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-blue-500 border border-[var(--border)] text-xs font-bold transition-colors"
                    >
                        <Download size={12} /> Export
                    </button>
                </div>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="cngRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="cngCostGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (₨K)"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                fill="url(#cngRevGrad)"
                            />
                            <Area
                                type="monotone"
                                dataKey="gasCost"
                                name="Gas Cost (₨K)"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                fill="url(#cngCostGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[280px] text-center">
                        <BarChart3 size={48} className="text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">
                            No shift data in the selected date range
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Close CNG shifts to start seeing analytics here
                        </p>
                    </div>
                )}
            </Card>

            {/* Nozzle Performance + Decanting Supplier Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nozzle-wise KG Sold */}
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Gauge className="text-emerald-500" size={18} />
                                Nozzle Performance
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Revenue by nozzle in selected period
                            </p>
                        </div>
                    </div>
                    {nozzlePerf.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={nozzlePerf} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                                <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        fontSize: 12,
                                    }}
                                    formatter={(value: number, name: string) =>
                                        name === 'revenue'
                                            ? [fmt(value), 'Revenue']
                                            : [`${value.toLocaleString()} KG`, 'KG Sold']
                                    }
                                />
                                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                    {nozzlePerf.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-[var(--text-muted)]">
                            <p className="text-sm font-medium">No nozzle data available</p>
                        </div>
                    )}
                </Card>

                {/* Decanting Supplier Breakdown */}
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Package className="text-purple-500" size={18} />
                                Decanting by Supplier
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Gas procurement breakdown
                            </p>
                        </div>
                        <button
                            onClick={() => analyticsEngine.exportToCSV('CNG_Decanting', filteredDecanting)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-purple-500 border border-[var(--border)] text-xs font-bold transition-colors"
                        >
                            <Download size={12} /> Export
                        </button>
                    </div>
                    {decantingBySupplier.length > 0 ? (
                        <div className="space-y-3 mt-2">
                            {decantingBySupplier.map((s, i) => {
                                const totalCost = decantingBySupplier.reduce((acc, r) => acc + r.totalCost, 0);
                                const pct = totalCost > 0 ? (s.totalCost / totalCost) * 100 : 0;
                                return (
                                    <div key={s.supplier} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-[var(--text-primary)]">{s.supplier}</span>
                                            <span className="text-[var(--text-secondary)]">
                                                {s.totalKG.toLocaleString()} KG · {fmt(s.totalCost)}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: COLORS[i % COLORS.length],
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                                            <span>{s.deliveries} deliveries</span>
                                            <span>{pct.toFixed(1)}% of total cost</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-[var(--text-muted)]">
                            <div className="text-center">
                                <Package size={36} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm font-medium">No decanting records</p>
                                <p className="text-xs mt-1 opacity-60">Record gas deliveries in CNG Inventory</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Nozzle Detail Table */}
            {nozzlePerf.length > 0 && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Activity className="text-blue-500" size={18} />
                            Nozzle Detailed Analysis
                        </h3>
                        <button
                            onClick={() => analyticsEngine.exportToCSV('CNG_Nozzle_Stats', nozzlePerf)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-blue-500 border border-[var(--border)] text-xs font-bold transition-colors"
                        >
                            <Download size={12} /> Export
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    {['Nozzle', 'KG Sold', 'Revenue', 'Transactions', 'Avg/Tx'].map(h => (
                                        <th
                                            key={h}
                                            className="text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] pb-3 pr-4"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {nozzlePerf.map((n, i) => (
                                    <tr key={n.name} className="hover:bg-[var(--bg-elevated)] transition-colors">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ background: COLORS[i % COLORS.length] }}
                                                />
                                                <span className="font-bold text-[var(--text-primary)]">{n.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--text-secondary)] font-medium">
                                            {n.kgSold.toLocaleString()} KG
                                        </td>
                                        <td className="py-3 pr-4 font-black text-[var(--text-primary)]">
                                            {fmt(n.revenue)}
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--text-secondary)] font-medium">
                                            {n.txCount.toLocaleString()}
                                        </td>
                                        <td className="py-3 pr-4 text-[var(--text-secondary)] font-medium">
                                            {n.txCount > 0 ? fmt(n.revenue / n.txCount) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Report Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <FileText className="text-blue-500" size={18} />
                        Operational Reports
                    </h3>
                    <div className="space-y-3">
                        {operationalReports.map(report => (
                            <div
                                key={report}
                                className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[var(--bg-active)] transition-colors cursor-pointer group border border-[var(--border)]"
                            >
                                <span className="text-sm font-bold text-[var(--text-secondary)]">
                                    {report}
                                </span>
                                <button
                                    onClick={() =>
                                        analyticsEngine.exportToCSV(
                                            `CNG_${report.replace(/\s+/g, '_')}`,
                                            filteredShifts
                                        )
                                    }
                                    className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                    title="Export CSV"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" size={18} />
                        Financial Reports
                    </h3>
                    <div className="space-y-3">
                        {financialReports.map(report => (
                            <div
                                key={report}
                                className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[var(--bg-active)] transition-colors cursor-pointer group border border-[var(--border)]"
                            >
                                <span className="text-sm font-bold text-[var(--text-secondary)]">
                                    {report}
                                </span>
                                <button
                                    onClick={() =>
                                        analyticsEngine.exportToCSV(
                                            `CNG_${report.replace(/\s+/g, '_')}`,
                                            report.includes('Decanting')
                                                ? filteredDecanting
                                                : filteredShifts
                                        )
                                    }
                                    className="text-[var(--text-secondary)] hover:text-emerald-500 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                    title="Export CSV"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
