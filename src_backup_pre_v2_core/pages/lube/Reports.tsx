import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, TrendingUp, BarChart3, Package, Activity, 
    Download, History, Clock, User, ArrowRight,
    LayoutDashboard, ShieldCheck, ShoppingBag,
    AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { useAuditStore } from '@/stores/ledgerStore';
import { QuantumRegister, QuantumColumn } from '@/components/shared/QuantumRegister';
import { Card, PageHeader } from '@/components/ui';
import { DateRangeFilter, DateRange } from '@/components/audit/DateRangeFilter';
import { exportToCSV } from '@/utils/export';
import { isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import {
    Bar, BarChart, CartesianGrid,
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

interface LubeReportsProps {
    onNavigate?: (path: string) => void;
}

export const LubeReportsPage: React.FC<LubeReportsProps> = ({ onNavigate }) => {
    const navigate = onNavigate || ((path: string) => { window.location.href = path; });
    const { products } = useProductStore();
    const { sales } = useSalesStore();
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
    const filteredSales = useMemo(() => sales.filter(s => inRange(s.timestamp) && s.status === 'COMPLETED'), [sales, dateRange]);
    const lubeLogs = useMemo(() => {
        return logs.filter(l => l.module === 'LUBE' || l.module === 'LEDGER')
            .filter(l => inRange(l.timestamp))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, dateRange]);

    // KPI Aggregation
    const kpis = useMemo(() => {
        const rev = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
        const count = filteredSales.length;
        
        // Profit Calculation
        let totalCost = 0;
        filteredSales.forEach(s => {
            s.items.forEach(item => {
                const prod = products.find(p => p.productId === item.productId);
                totalCost += (prod?.costPrice || 0) * item.quantity;
            });
        });
        
        const profit = rev - totalCost;
        const margin = rev > 0 ? (profit / rev) * 100 : 0;
        const lowStock = products.filter(p => (p.currentStock || 0) <= (p.reorderPoint || 10)).length;
        
        return { rev, count, profit, margin, lowStock };
    }, [filteredSales, products]);

    // Top Selling Products
    const topProducts = useMemo(() => {
        const map: Record<string, { name: string, qty: number, rev: number }> = {};
        filteredSales.forEach(s => {
            s.items.forEach(item => {
                if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, rev: 0 };
                map[item.productId].qty += item.quantity;
                map[item.productId].rev += item.subtotal;
            });
        });
        return Object.values(map).sort((a, b) => b.rev - a.rev).slice(0, 5);
    }, [filteredSales]);

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
        },
        { 
            key: 'action',
            label: 'Lube Activity', 
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
            label: 'Unit', 
            type: 'badge',
            formatValue: (_val: any, l: any) => (
                <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-[9px] font-black uppercase tracking-widest">
                    {l.module}
                </span>
            )
        },
        { 
            key: 'referenceId',
            label: 'Record ID', 
            type: 'text',
            formatValue: (_val: any, l: any) => <code className="text-[10px] text-slate-500 dark:text-white/30">{l.referenceId || 'N/A'}</code>,
        }
    ];


    return (
        <div className="min-h-screen text-slate-900 dark:text-white p-6 md:p-8 space-y-8 pb-20 transition-colors">
            <PageHeader
                title="Lube Operations Hub"
                subtitle="Complete visibility into motor oil inventory, POS performance, and supply chain auditability"
                actions={
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-100 dark:hover:bg-purple-600/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
                        <Download className="w-4 h-4" />
                        Export Audit
                    </button>
                }
            />

            {/* Global Context Filters */}
            <Card className="p-6 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                <DateRangeFilter value={dateRange} onChange={(r) => setDateRange(r ?? getInit())} />
            </Card>

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
                                    layoutId="activeTabLube"
                                    className="absolute inset-0 bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className="w-4 h-4 relative z-10" />
                            <span className="text-xs font-bold uppercase tracking-widest relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={() => navigate('/reports?module=LUBE')}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-purple-500/20 group"
                >
                    View All 55+ Enterprise Reports
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'OVERVIEW' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Revenue', val: `₨ ${kpis.rev.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
                                { label: 'Net Profit', val: `₨ ${kpis.profit.toLocaleString()}`, icon: ShoppingBag, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                                { label: 'Low Stock', val: `${kpis.lowStock} Items`, icon: AlertTriangle, color: kpis.lowStock > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400', bg: 'bg-rose-500/10' },
                                { label: 'GP Margin', val: `${kpis.margin.toFixed(1)}%`, icon: BarChart3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
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
                                            animate={{ width: '80%' }}
                                            className={`h-full ${kpi.bg.replace('/10', '')}`}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Product Performance Bar Chart */}
                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-8 uppercase tracking-widest text-slate-500 dark:text-white/60">
                                    <Zap className="text-purple-400 w-5 h-5" />
                                    Top Selling Lubricants (Rev)
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/5" horizontal={false} />
                                            <XAxis type="number" className="text-slate-400" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₨${v/1000}k`} />
                                            <YAxis type="category" dataKey="name" className="text-slate-600 dark:text-white" fontSize={10} axisLine={false} tickLine={false} width={80} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} cursor={{ fill: 'rgba(139,92,246,0.05)' }} />
                                            <Bar dataKey="rev" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Inventory Summary */}
                            <Card className="p-8 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-8 uppercase tracking-widest text-slate-500 dark:text-white/60">
                                    <Package className="text-blue-400 w-5 h-5" />
                                    Stock Health Status
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center border border-slate-200 dark:border-white/5">
                                            <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase font-black mb-1">In Stock</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{products.filter(p => p.currentStock > (p.reorderPoint || 10)).length}</p>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mt-2" />
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center border border-slate-200 dark:border-white/5">
                                            <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase font-black mb-1">Reorder</p>
                                            <p className="text-2xl font-black text-amber-500">{kpis.lowStock}</p>
                                            <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mt-2" />
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-center border border-slate-200 dark:border-white/5">
                                            <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase font-black mb-1">Out of Stock</p>
                                            <p className="text-2xl font-black text-rose-500">{products.filter(p => (p.currentStock || 0) <= 0).length}</p>
                                            <Activity className="w-4 h-4 text-rose-500 mx-auto mt-2" />
                                        </div>
                                    </div>

                                    {/* Action items list */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-white/30 tracking-widest mb-4">Critical Stock Alerts</p>
                                        {products.filter(p => (p.currentStock || 0) <= (p.reorderPoint || 10)).slice(0, 3).map(p => (
                                            <div key={p.productId} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                                                    <span className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest">{p.brand}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-xs font-bold font-mono ${p.currentStock <= 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                        {p.currentStock} Units Left
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 dark:text-white/30 uppercase">Min: {p.reorderPoint}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                        className="h-[calc(100vh-420px)]"
                    >
                        <QuantumRegister
                            title="Lube Master Register"
                            subtitle="Zero-Escape tracking of motor oil sales, inventory adjustments, and procurement"
                            data={lubeLogs}
                            columns={registerColumns}
                            onExportExcel={() => exportToCSV(lubeLogs, `Lube_Master_Register_${new Date().toISOString().split('T')[0]}.csv`)}
                            onExportPDF={() => console.log('Exporting PDF...')}
                        />
                    </motion.div>
                )}

            </AnimatePresence>

            {/* Quality Guard Footer */}
            <div className="fixed bottom-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#06080f]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 flex items-center justify-center px-8 z-50 transition-colors">
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        Lube Intelligence Engine v4.0 Active
                    </div>
                </div>
            </div>
        </div>
    );
};
