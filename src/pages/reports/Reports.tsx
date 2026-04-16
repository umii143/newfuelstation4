import { PageHeader } from '@/components/ui';
import { useCustomerStore, useSupplierStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { useCashBankStore } from '@/stores/ledgerStore';
import { Customer, Supplier, Tank } from '@/types';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDownLeft,
    ArrowRight,
    Calendar,
    ChevronRight,
    FileText as FileIcon,
    PieChart,
    Search,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { REPORT_CATEGORIES, REPORT_REGISTRY } from './ReportRegistry';
import ReportViewer from './ReportViewer';

export const ReportsPage: React.FC = () => {
    const { tanks } = useFuelStore();
    const { customers } = useCustomerStore();
    const { suppliers } = useSupplierStore();
    const { accounts: _accounts, entries: cashEntries } = useCashBankStore();

    const [activeCategory, setActiveCategory] = useState<string>('SALES');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
    });

    const setQuickDate = (type: 'today' | 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date();
        if (type === 'today') start.setHours(0, 0, 0, 0);
        if (type === 'week') start.setDate(start.getDate() - 7);
        if (type === 'month') start.setMonth(start.getMonth() - 1);
        if (type === 'year') start.setFullYear(start.getFullYear() - 1);
        setDateRange({ start, end });
    };

    // Data Aggregation for Top Cards
    const totalActiveCredits = useMemo(
        () =>
            customers.reduce(
                (acc: number, c: Customer) => acc + ((c?.currentBalance || 0) > 0 ? (c?.currentBalance || 0) : 0),
                0
            ),
        [customers]
    );

    const totalSupplierPayables = useMemo(
        () =>
            suppliers.reduce(
                (acc: number, s: Supplier) => acc + ((s?.currentPayable || 0) > 0 ? (s?.currentPayable || 0) : 0),
                0
            ),
        [suppliers]
    );

    const totalFuelInventoryValue = useMemo(
        () =>
            tanks.reduce(
                (acc: number, tank: Tank) => acc + tank.currentLevel * (tank.costPrice || 250),
                0
            ),
        [tanks]
    );

    const todayExpenses = useMemo(() => {
        const todayStr = dateRange.start.toISOString().split('T')[0];
        return cashEntries
            .filter(e => e.date === todayStr && e.type === 'EXPENSE')
            .reduce((acc: number, e) => acc + e.debit, 0);
    }, [cashEntries, dateRange]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);

    const healthScore = useMemo(() => {
        // Simple logic: lower expenses and higher revenue/inventory = better score
        const revenue = totalFuelInventoryValue; // Proxy for sales potential
        const expenses = todayExpenses;
        const ratio = expenses / (revenue / 30 || 1); // rough daily ratio
        return Math.min(100, Math.max(0, 100 - ratio * 100));
    }, [totalFuelInventoryValue, todayExpenses]);

    const kpis = [
        {
            label: 'Market Receivables',
            value: formatCurrency(totalActiveCredits),
            sub: 'Credits Outstanding',
            icon: Wallet,
            color: 'blue',
            grad: 'from-blue-600 to-indigo-700',
            onClick: () => setSelectedReportId('customer-ledger'),
        },
        {
            label: 'Inventory Liquidity',
            value: formatCurrency(totalFuelInventoryValue),
            sub: 'Current Stock Value',
            icon: PieChart,
            color: 'emerald',
            grad: 'from-emerald-500 to-teal-600',
            onClick: () => setSelectedReportId('inventory-movement'),
        },
        {
            label: 'Accounts Payable',
            value: formatCurrency(totalSupplierPayables),
            sub: 'Due to Suppliers',
            icon: ArrowDownLeft,
            color: 'rose',
            grad: 'from-rose-500 to-pink-600',
            onClick: () => setSelectedReportId('supplier-ledger-detailed'),
        },
        {
            label: 'Business Health',
            value: `${healthScore.toFixed(0)}%`,
            sub: healthScore > 80 ? 'EXCELLENT' : 'MONITORING',
            icon: ShieldCheck,
            color: 'purple',
            grad: 'from-purple-500 to-violet-600',
            onClick: () => setSelectedReportId('fin-profit-loss'),
        },
    ];

    const filteredReports = useMemo(() => {
        return REPORT_REGISTRY.filter(
            r =>
                r.category === activeCategory &&
                (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [activeCategory, searchTerm]);

    if (selectedReportId) {
        return (
            <ReportViewer
                reportId={selectedReportId}
                onBack={() => setSelectedReportId(null)}
                dateRange={dateRange}
            />
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <PageHeader
                        title="Quantum BI Cockpit"
                        subtitle="Elite AI-Powered Multi-Business Intelligence Engine"
                    />
                </div>

                {/* Global Time-Travel Bar (Upgraded) */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 backdrop-blur-2xl p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-wrap items-center gap-2 border border-white/60 ring-1 ring-black/5"
                >
                    <div className="flex bg-slate-900/5 p-1.5 rounded-2xl">
                        {['today', 'week', 'month', 'year'].map(period => (
                            <button
                                key={period}
                                onClick={() => setQuickDate(period as any)}
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-white hover:text-blue-600 hover:shadow-md"
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />
                    <div className="flex items-center gap-3 px-4">
                        <Calendar size={16} className="text-slate-400" />
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="text-[11px] font-black text-slate-700 outline-none bg-transparent hover:text-blue-600 cursor-pointer transition-colors"
                                value={dateRange.start.toISOString().split('T')[0]}
                                onChange={e =>
                                    setDateRange({ ...dateRange, start: new Date(e.target.value) })
                                }
                            />
                            <span className="text-slate-400 font-bold">→</span>
                            <input
                                type="date"
                                className="text-[11px] font-black text-slate-700 outline-none bg-transparent hover:text-blue-600 cursor-pointer transition-colors"
                                value={dateRange.end.toISOString().split('T')[0]}
                                onChange={e =>
                                    setDateRange({ ...dateRange, end: new Date(e.target.value) })
                                }
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Premium KPI Cockpit */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={kpi.onClick}
                        className="cursor-pointer group"
                    >
                        <div
                            className={clsx(
                                'p-8 rounded-[2.5rem] relative overflow-hidden transition-all duration-700 hover:-translate-y-2 group',
                                idx === 3
                                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl'
                                    : 'bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5'
                            )}
                        >
                            <div
                                className={clsx(
                                    'absolute -top-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-20 group-hover:opacity-40 transition-all duration-700',
                                    `bg-gradient-to-br ${kpi.grad}`
                                )}
                            />
                            <div className="flex flex-col justify-between h-full relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div
                                        className={clsx(
                                            'p-4 rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6',
                                            idx === 3
                                                ? 'bg-white/10 text-purple-400'
                                                : 'bg-white shadow-slate-200 text-slate-800 group-hover:bg-blue-600 group-hover:text-white'
                                        )}
                                    >
                                        <kpi.icon size={24} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span
                                            className={clsx(
                                                'text-[10px] font-black uppercase tracking-[.3em] mb-1',
                                                idx === 3 ? 'text-white/40' : 'text-slate-400'
                                            )}
                                        >
                                            {kpi.label}
                                        </span>
                                        <h3 className="text-2xl font-black tracking-tighter">
                                            {kpi.value}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        className={clsx(
                                            'h-1.5 flex-1 rounded-full overflow-hidden',
                                            idx === 3 ? 'bg-white/10' : 'bg-slate-100'
                                        )}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '70%' }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={clsx('h-full bg-gradient-to-r', kpi.grad)}
                                        />
                                    </div>
                                    <p
                                        className={clsx(
                                            'text-[10px] font-black uppercase tracking-[.2em]',
                                            idx === 3 ? 'text-purple-400' : 'text-slate-500'
                                        )}
                                    >
                                        {kpi.sub}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Master Audit Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        id: 'today-pulse',
                        title: "Today's Pulse",
                        desc: 'Every sale, recovery, and expense today',
                        badge: 'Master Audit',
                        icon: ShieldCheck,
                        theme: 'dark',
                    },
                    {
                        id: 'shift-reconciliation-all',
                        title: 'Shift Archives',
                        desc: 'Historical shift data with reconciliation',
                        badge: 'Financials',
                        icon: Calendar,
                        theme: 'light',
                    },
                ].map((master, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedReportId(master.id)}
                        className={clsx(
                            'p-8 rounded-[2.5rem] text-left relative overflow-hidden transition-all shadow-2xl group flex items-start gap-6 border',
                            master.theme === 'dark'
                                ? 'bg-slate-900 text-white border-white/5'
                                : 'bg-white/40 backdrop-blur-xl text-slate-900 border-white/10'
                        )}
                    >
                        <div
                            className={clsx(
                                'shrink-0 p-4 rounded-3xl transition-transform group-hover:scale-110 duration-500',
                                master.theme === 'dark'
                                    ? 'bg-white/5 text-blue-400'
                                    : 'bg-blue-600 text-white'
                            )}
                        >
                            <master.icon size={32} />
                        </div>
                        <div className="flex-1">
                            <span
                                className={clsx(
                                    'px-2 py-0.5 text-[9px] font-black uppercase tracking-[.2em] rounded border inline-block mb-3',
                                    master.theme === 'dark'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        : 'bg-slate-100 border-slate-200 text-slate-500'
                                )}
                            >
                                {master.badge}
                            </span>
                            <h3 className="text-2xl font-black tracking-tight mb-1">
                                {master.title}
                            </h3>
                            <p
                                className={clsx(
                                    'text-sm font-medium leading-relaxed',
                                    master.theme === 'dark' ? 'text-white/40' : 'text-slate-500'
                                )}
                            >
                                {master.desc}
                            </p>
                            <div
                                className={clsx(
                                    'mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-opacity',
                                    master.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                )}
                            >
                                Access Ledger Details <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Categorized Report Explorer */}
            <div className="bg-white/20 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-xl overflow-hidden min-h-[600px] flex flex-col lg:flex-row ring-1 ring-slate-900/5">
                {/* Side Navigation */}
                <div className="w-full lg:w-80 bg-white/40 border-r border-white/40 p-8 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.3em] mb-6 px-4">
                        Data Intelligence
                    </p>
                    {REPORT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={clsx(
                                'w-full px-5 py-4 rounded-2xl flex items-center justify-between group transition-all duration-300',
                                activeCategory === cat.id
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 -translate-x-1'
                                    : 'hover:bg-white text-slate-500 hover:text-slate-900'
                            )}
                        >
                            <span className="text-sm font-black tracking-tight">{cat.name}</span>
                            <ChevronRight
                                size={16}
                                className={clsx(
                                    'transition-transform',
                                    activeCategory === cat.id
                                        ? 'translate-x-1 text-blue-400'
                                        : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                )}
                            />
                        </button>
                    ))}
                </div>

                {/* Report Grid Container */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto noscrollbar">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                {REPORT_CATEGORIES.find(c => c.id === activeCategory)?.name}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Secure transaction records and analytical drill-downs.
                            </p>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Locate specific report..."
                                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-white/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white text-sm font-bold shadow-sm transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="contents"
                            >
                                {filteredReports.map((report, idx) => (
                                    <motion.button
                                        key={report.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedReportId(report.id)}
                                        className="text-left p-6 bg-white/60 hover:bg-white rounded-[2rem] border border-white/60 hover:border-blue-500/30 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="w-14 h-14 bg-slate-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-inner group-hover:shadow-blue-500/20">
                                                {(() => {
                                                    const Icon = report.icon || FileIcon;
                                                    return <Icon size={24} />;
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                                    {report.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                    {report.description}
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="text-[9px] font-black text-blue-600 bg-blue-500/5 border border-blue-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                                                        Zero-Escape Log
                                                    </span>
                                                    {report.drillDown && (
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                                                            Drill-Down Ready
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Quality Assurance Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-12 p-6 bg-slate-900/5 rounded-3xl border border-slate-900/10 flex items-start gap-4"
                    >
                        <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Audit-Grade Assurance Statement
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                                All intelligence exports are generated using the Zero-Escape
                                protocol, ensuring 1:1 parity with the primary ledger stores.
                                Modification of archived entries is strictly audited and logged
                                within the system kernel.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
