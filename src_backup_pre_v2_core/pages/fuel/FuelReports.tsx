import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Fuel, TrendingUp, Droplets, Gauge, AlertCircle, 
    Download, Activity, Clock, User, ArrowRight,
    LayoutDashboard, History, Zap, ShieldCheck
} from 'lucide-react';
import { useFuelStore } from '@/stores/fuelStore';
import { useAuditStore } from '@/stores/ledgerStore'; // Audit log resides here
import { QuantumRegister, QuantumColumn } from '@/components/shared/QuantumRegister';
import { Card, PageHeader } from '@/components/ui';
import { exportToCSV } from '@/utils/export';
import { isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

type ReportTab = 'OVERVIEW' | 'REGISTER';

interface FuelReportsProps {
    onNavigate?: (path: string) => void;
}

export const FuelReportsPage: React.FC<FuelReportsProps> = ({ onNavigate }) => {
    const navigate = onNavigate || ((path: string) => { window.location.href = path; });
    const { shifts, tanks } = useFuelStore();
    const { logs } = useAuditStore();
    
    // State
    const [activeTab, setActiveTab] = useState<ReportTab>('OVERVIEW');
    const [dateRange] = useState({
        start: startOfDay(subDays(new Date(), 7)).toISOString(),
        end: endOfDay(new Date()).toISOString()
    });

    // Filtered Data
    const filteredShifts = useMemo(() => {
        return shifts.filter(s => {
            const date = parseISO(s.startTime);
            return isWithinInterval(date, { 
                start: parseISO(dateRange.start), 
                end: parseISO(dateRange.end) 
            });
        });
    }, [shifts, dateRange]);

    const fuelLogs = useMemo(() => {
        return logs.filter(l => l.module === 'FUEL' || l.module === 'LEDGER')
            .filter(l => {
                const date = parseISO(l.timestamp);
                return isWithinInterval(date, { 
                    start: parseISO(dateRange.start), 
                    end: parseISO(dateRange.end) 
                });
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, dateRange]);

    // KPI Aggregation
    const kpis = useMemo(() => {
        const rev = filteredShifts.reduce((acc, s) => acc + s.totalRevenue, 0);
        const vol = filteredShifts.reduce((acc, s) => acc + (s.totalLitersSold || 0), 0);
        const variance = filteredShifts.reduce((acc, s) => acc + (s.variance || 0), 0);
        const stockValue = tanks.reduce((acc, t) => acc + (t.currentLevel * (t.costPrice || 260)), 0);
        return { rev, vol, variance, stockValue };
    }, [filteredShifts, tanks]);

    // Charts Data
    const revenueTrend = useMemo(() => {
        const map: Record<string, { date: string, revenue: number, volume: number }> = {};
        filteredShifts.forEach(s => {
            const day = s.startTime.split('T')[0];
            if (!map[day]) map[day] = { date: day, revenue: 0, volume: 0 };
            map[day].revenue += s.totalRevenue;
            map[day].volume += s.totalLitersSold || 0;
        });
        return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredShifts]);

    // Register Columns — THEME-RESPONSIVE
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
            label: 'Activity', 
            type: 'text',
            formatValue: (_val: any, l: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">{l.action.replace('_', ' ')}</span>
                    <span className="text-slate-500 dark:text-white/40 text-xs">{l.details}</span>
                </div>
            )
        },
        { 
            key: 'module',
            label: 'Module', 
            type: 'badge',
            formatValue: (_val: any, l: any) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                    l.module === 'FUEL' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                }`}>
                    {l.module}
                </span>
            )
        },
        { 
            key: 'referenceId',
            label: 'Reference ID', 
            type: 'text',
            formatValue: (_val: any, l: any) => <code className="text-[10px] text-slate-500 dark:text-white/30">{l.referenceId || 'N/A'}</code>,
            width: '150px'
        }
    ];

    return (
        <div className="min-h-screen text-slate-900 dark:text-white p-6 md:p-8 space-y-8 pb-20 transition-colors">
            <PageHeader
                title="Fuel Master Command"
                subtitle="Elite Business Intelligence Hub — Multi-Tank Analytics & Audit Register"
                actions={
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-white/60">
                            <Download className="w-4 h-4" />
                            Secure PDF
                        </button>
                    </div>
                }
            />

            {/* Navigation Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl w-fit">
                    {[
                        { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Performance pulse' },
                        { id: 'REGISTER', icon: History, label: 'The Master Register' },
                    ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ReportTab)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all relative ${
                            activeTab === tab.id ? 'text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60'
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon className="w-4 h-4 relative z-10" />
                        <span className="text-xs font-bold uppercase tracking-widest relative z-10">{tab.label}</span>
                    </button>
                ))}
                </div>
                
                <button
                    onClick={() => navigate('/reports?module=FUEL')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20 group"
                >
                    View All 115+ Enterprise Reports
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Net Revenue', val: `₨ ${kpis.rev.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Volume Sold', val: `${kpis.vol.toLocaleString()} L`, icon: Fuel, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'Float Variance', val: `₨ ${kpis.variance.toLocaleString()}`, icon: AlertCircle, color: kpis.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
                                { label: 'Stock Valuation', val: `₨ ${kpis.stockValue.toLocaleString()}`, icon: Gauge, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                            ].map((kpi, idx) => (
                                <Card key={idx} className="p-6 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all group">
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
                                            animate={{ width: '70%' }}
                                            className={`h-full ${kpi.bg.replace('/10', '')}`}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-white">
                                        <Zap className="text-blue-400 w-5 h-5" />
                                        Revenue Pulse (Weekly Trend)
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueTrend}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/5" vertical={false} />
                                            <XAxis dataKey="date" className="text-slate-400" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis className="text-slate-400" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₨${v/1000}k`} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px', border: 'none' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700 dark:text-white">
                                        <Droplets className="text-emerald-400 w-5 h-5" />
                                        Inventory Distribution
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={tanks}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/5" vertical={false} />
                                            <XAxis dataKey="name" className="text-slate-400" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis className="text-slate-400" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px', border: 'none' }} />
                                            <Bar dataKey="currentLevel" fill="#10b981" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'REGISTER' && (
                    <motion.div
                        key="register"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-[calc(100vh-320px)]"
                    >
                        <QuantumRegister
                            title="Master Activity Register"
                            subtitle="Zero-Escape tracking of every minor process in the Fuel unit"
                            data={fuelLogs}
                            columns={registerColumns}
                            onExportExcel={() => exportToCSV(fuelLogs, `Fuel_Master_Register_${new Date().toISOString().split('T')[0]}.csv`)}
                            onExportPDF={() => console.log('Exporting PDF...')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Bottom Guard */}
            <div className="fixed bottom-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#06080f]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 flex items-center justify-center px-8 z-50 transition-colors">
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Master Register v4.0 Active
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Atomic Sync Parity Certified
                    </div>
                </div>
            </div>
        </div>
    );
};
