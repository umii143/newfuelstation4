import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, TrendingUp, BarChart3, Gauge, 
    Download, History, ArrowRight,
    LayoutDashboard, ShieldCheck, Package, Flame, Clock, User
} from 'lucide-react';
import { useCNGStore } from '@/stores/cngStore';
import { useAuditStore } from '@/stores/ledgerStore';
import { QuantumRegister, QuantumColumn } from '@/components/shared/QuantumRegister';
import { Card, PageHeader } from '@/components/ui';
import { DateRangeFilter, DateRange } from '@/components/audit/DateRangeFilter';
import { exportToCSV } from '@/utils/export';
import { isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import {
    Area, AreaChart, CartesianGrid,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

type ReportTab = 'OVERVIEW' | 'REGISTER';

const getInit = (): DateRange => {
    const now = new Date();
    return {
        startDate: startOfDay(subDays(now, 7)).toISOString(),
        endDate: endOfDay(now).toISOString(),
        preset: 'LAST_7_DAYS',
    };
};

interface CNGReportsProps {
    onNavigate?: (path: string) => void;
}

export const CNGReportsPage: React.FC<CNGReportsProps> = ({ onNavigate }) => {
    const navigate = onNavigate || ((path: string) => { window.location.href = path; });
    const { shifts, decantingRecords, compressors } = useCNGStore();
    const { logs } = useAuditStore();
    
    // State
    const [activeTab, setActiveTab] = useState<ReportTab>('OVERVIEW');
    const [dateRange, setDateRange] = useState<DateRange>(getInit());

    // Helpers
    const inRange = (dateStr: string) => {
        try {
            return isWithinInterval(parseISO(dateStr), {
                start: parseISO(dateRange.startDate),
                end: parseISO(dateRange.endDate),
            });
        } catch { return false; }
    };

    // Filtered Data
    const filteredShifts = useMemo(() => shifts.filter(s => inRange(s.date)), [shifts, dateRange]);
    const filteredDecanting = useMemo(() => decantingRecords.filter(r => inRange(r.date)), [decantingRecords, dateRange]);
    const cngLogs = useMemo(() => {
        return logs.filter(l => l.module === 'CNG')
            .filter(l => inRange(l.timestamp))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, dateRange]);

    // KPI Aggregation
    const kpis = useMemo(() => {
        const totalRevenue = filteredShifts.reduce((s, sh) => s + sh.totalRevenue, 0);
        const totalKGSold = filteredShifts.reduce((s, sh) => s + sh.totalLitersSold, 0);
        const gasCost = filteredDecanting.reduce((s, r) => s + r.totalCost, 0);
        const grossProfit = totalRevenue - gasCost;
        const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        return { totalRevenue, totalKGSold, gasCost, grossProfit, margin };
    }, [filteredShifts, filteredDecanting]);

    // Register Columns — THEME-RESPONSIVE cell renderers
    const registerColumns: QuantumColumn<any>[] = [
        { 
            key: 'timestamp',
            label: 'Timestamp', 
            type: 'text',
            formatValue: (_val: any, l: any) => (
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-white/40">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {l.performer && (
                        <span className="flex items-center gap-1 text-slate-400">
                            <User className="w-3 h-3" />
                            {l.performer}
                        </span>
                    )}
                </div>
            ),
            width: '200px'
        },
        { 
            key: 'action',
            label: 'Process Activity', 
            type: 'text',
            formatValue: (_val: any, l: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">{l.action.replace('_', ' ')}</span>
                    <span className="text-slate-500 dark:text-white/40 text-xs">{l.details}</span>
                </div>
            )
        },
        { 
            key: 'referenceId',
            label: 'Action ID', 
            type: 'text',
            formatValue: (_val: any, l: any) => <code className="text-[10px] text-slate-500 dark:text-white/30">{l.referenceId || 'N/A'}</code>,
            width: '150px'
        }
    ];


    return (
        <div className="min-h-screen text-slate-900 dark:text-white p-6 md:p-8 space-y-8 pb-20 transition-colors">
            <PageHeader
                title="CNG Intelligence Hub"
                subtitle="Quantum analytics for pressure systems, decanting cost-parity, and trade reconciliation"
                actions={
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
                        <Download className="w-4 h-4" />
                        Audit Export
                    </button>
                }
            />

            {/* Date Focus */}
            <Card className="p-6 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                <DateRangeFilter value={dateRange} onChange={(r) => setDateRange(r ?? getInit())} />
            </Card>

            {/* Integrated Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl w-fit">
                    {[
                        { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Pulse' },
                        { id: 'REGISTER', icon: History, label: 'The Register' },
                    ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all relative min-h-[44px] ${
                            activeTab === tab.id ? 'text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabCNG"
                                className="absolute inset-0 bg-emerald-600 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon className="w-4 h-4 relative z-10" />
                        <span className="text-xs font-bold uppercase tracking-widest relative z-10">{tab.label}</span>
                    </button>
                ))}
                </div>
                
                <button
                    onClick={() => navigate('/reports?module=CNG')}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20 group"
                >
                    View All 55+ Enterprise Reports
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { label: 'CNG Revenue', val: `₨ ${kpis.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'KG Dispensed', val: `${kpis.totalKGSold.toLocaleString()} KG`, icon: Zap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Procurement Cost', val: `₨ ${kpis.gasCost.toLocaleString()}`, icon: Package, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
                                { label: 'Gross Margin', val: `${kpis.margin.toFixed(1)}%`, icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((kpi, idx) => (
                                <Card key={idx} className="p-6 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                                            <kpi.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest">{kpi.label}</span>
                                            <h3 className="text-2xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">{kpi.val}</h3>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            className={`h-full ${kpi.bg.replace('/10', '')}`}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-8 uppercase tracking-widest text-slate-500 dark:text-white/60">
                                    <Flame className="text-orange-500 w-5 h-5" />
                                    Revenue vs Cost Trend
                                </h3>
                                <div className="h-[200px] sm:h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={filteredShifts}>
                                            <defs>
                                                <linearGradient id="cngRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/5" vertical={false} />
                                            <XAxis dataKey="date" className="text-slate-400 dark:text-white/30" fontSize={10} />
                                            <YAxis className="text-slate-400 dark:text-white/30" fontSize={10} tickFormatter={(v) => `₨${v/1000}k`} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px', border: 'none' }} />
                                            <Area type="monotone" dataKey="totalRevenue" stroke="#10b981" strokeWidth={3} fill="url(#cngRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-8 uppercase tracking-widest text-slate-500 dark:text-white/60">
                                    <Gauge className="text-blue-500 w-5 h-5" />
                                    Operational Uptime
                                </h3>
                                <div className="space-y-6">
                                    {compressors.map(c => (
                                        <div key={c.compressorId} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold flex items-center gap-2 text-slate-700 dark:text-white">
                                                    <div className={`w-2 h-2 rounded-full ${c.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                    {c.name}
                                                </span>
                                                <span className="text-slate-400 dark:text-white/40 uppercase tracking-widest">{c.status}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[92%]" />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center border border-slate-200 dark:border-transparent">
                                            <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase font-black mb-1">Avg pressure</p>
                                            <p className="text-xl font-black font-mono text-slate-900 dark:text-white">195 bar</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center border border-slate-200 dark:border-transparent">
                                            <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase font-black mb-1">Efficiency Ratio</p>
                                            <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">98.2%</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'REGISTER' && (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-[calc(100vh-420px)]"
                    >
                        <QuantumRegister
                            title="CNG Master Register"
                            subtitle="Complete audit trail of pressure updates, decanting entries and shift finalizations"
                            data={cngLogs}
                            columns={registerColumns}
                            onExportExcel={() => exportToCSV(cngLogs, `CNG_Master_Register_${new Date().toISOString().split('T')[0]}.csv`)}
                            onExportPDF={() => console.log('Exporting PDF...')}
                        />
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Quality Guard — sits above bottom nav on mobile via .quality-bar CSS class */}
            <div className="quality-bar bg-white/80 dark:bg-[#06080f]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        CNG Intelligence v4.0 Active
                    </div>
                </div>
            </div>
        </div>
    );
};
