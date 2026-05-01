import { useCustomerStore, useSupplierStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { useCashBankStore } from '@/stores/ledgerStore';
import { useSettingsStore, useAuthStore } from '@/stores/authStore';
import { getBusinessMeta } from '@/lib/businessScope';
import { hasReportPermission } from '@/lib/roleHelpers';
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
import React, { useEffect, useMemo, useState } from 'react';
import { REPORT_CATEGORIES, REPORT_REGISTRY } from './ReportRegistry';
import ReportViewer from './ReportViewer';

export const ReportsPage: React.FC = () => {
    const { getFilteredCustomers } = useCustomerStore();
    const { getFilteredSuppliers } = useSupplierStore();
    const { tanks } = useFuelStore();
    const { entries: cashEntries } = useCashBankStore();
    const { settings } = useSettingsStore();
    const { user } = useAuthStore();
    const activeBusiness = getBusinessMeta(settings.businessUnit);

    const [activeCategory, setActiveCategory] = useState<string>('SALES');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
    });
    const [activeQuickDate, setActiveQuickDate] = useState<string>('today');
    const activeModule = settings.businessUnit as 'FUEL' | 'CNG' | 'LUBE';

    const setQuickDate = (type: 'today' | 'week' | 'month' | 'year') => {
        const end = new Date();
        const start = new Date();
        if (type === 'today') start.setHours(0, 0, 0, 0);
        if (type === 'week') start.setDate(start.getDate() - 7);
        if (type === 'month') start.setMonth(start.getMonth() - 1);
        if (type === 'year') start.setFullYear(start.getFullYear() - 1);
        setDateRange({ start, end });
        setActiveQuickDate(type);
    };

    // Reports that user has permission to see and belong to active module
    const permittedReports = useMemo(() => {
        return REPORT_REGISTRY.filter(r => {
            const roleOk = hasReportPermission(user?.role || 'STAFF', r.requiredRole || 'STAFF');
            const moduleOk = (r.module || 'FUEL') === activeModule || r.module === 'ALL';
            return roleOk && moduleOk;
        });
    }, [user?.role, activeModule]);

    // Categories that have at least one permitted report
    const visibleCategories = useMemo(() => {
        return REPORT_CATEGORIES.filter(cat => 
            cat.module === activeModule && 
            permittedReports.some(r => r.category === cat.id)
        );
    }, [activeModule, permittedReports]);

    // Report counts per category (only counting permitted)
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        permittedReports.forEach(r => {
            counts[r.category] = (counts[r.category] || 0) + 1;
        });
        return counts;
    }, [permittedReports]);

    // Data Aggregation for Top Cards (Enhanced with Business Isolation)
    const totalActiveCredits = useMemo(
        () =>
            getFilteredCustomers().reduce(
                (acc: number, c: Customer) => acc + ((c?.currentBalance || 0) > 0 ? (c?.currentBalance || 0) : 0),
                0
            ),
        [getFilteredCustomers]
    );

    const totalSupplierPayables = useMemo(
        () =>
            getFilteredSuppliers().reduce(
                (acc: number, s: Supplier) => acc + ((s?.currentPayable || 0) > 0 ? (s?.currentPayable || 0) : 0),
                0
            ),
        [getFilteredSuppliers]
    );

    const totalFuelInventoryValue = useMemo(
        () =>
            tanks
                .filter(t => t.businessUnit === 'FUEL')
                .reduce(
                    (acc: number, tank: Tank) => acc + tank.currentLevel * (tank.costPrice || 250),
                    0
                ),
        [tanks]
    );

    const todayExpenses = useMemo(() => {
        const todayStr = dateRange.start.toISOString().split('T')[0];
        return cashEntries
            .filter(e => 
                e.date === todayStr && 
                e.type === 'EXPENSE' && 
                e.businessUnit === settings.businessUnit
            )
            .reduce((acc: number, e) => acc + e.debit, 0);
    }, [cashEntries, dateRange, settings.businessUnit]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);

    const healthScore = useMemo(() => {
        const revenue = totalFuelInventoryValue;
        const expenses = todayExpenses;
        const ratio = expenses / (revenue / 30 || 1);
        return Math.min(100, Math.max(0, 100 - ratio * 100));
    }, [totalFuelInventoryValue, todayExpenses]);

    const kpis = [
        {
            label: 'Market Receivables',
            value: formatCurrency(totalActiveCredits),
            sub: 'Credits Outstanding',
            icon: Wallet,
            color: 'blue',
            grad: 'from-blue-500 to-indigo-600 dark:from-blue-900/40 dark:to-indigo-900/40',
            onClick: () => setSelectedReportId('customer-ledger'),
        },
        {
            label: 'Inventory Liquidity',
            value: formatCurrency(totalFuelInventoryValue),
            sub: 'Current Stock Value',
            icon: PieChart,
            color: 'emerald',
            grad: 'from-emerald-400 to-teal-500 dark:from-emerald-900/40 dark:to-teal-900/40',
            onClick: () => setSelectedReportId('inventory-movement'),
        },
        {
            label: 'Accounts Payable',
            value: formatCurrency(totalSupplierPayables),
            sub: 'Due to Suppliers',
            icon: ArrowDownLeft,
            color: 'rose',
            grad: 'from-rose-400 to-pink-500 dark:from-rose-900/40 dark:to-pink-900/40',
            onClick: () => setSelectedReportId('supplier-ledger-detailed'),
        },
        {
            label: 'Business Health',
            value: `${healthScore.toFixed(0)}%`,
            sub: healthScore > 80 ? 'EXCELLENT' : 'MONITORING',
            icon: ShieldCheck,
            color: 'purple',
            grad: 'from-purple-500 to-violet-600 dark:from-purple-900/60 dark:to-violet-900/60',
            onClick: () => setSelectedReportId('fin-profit-loss'),
        },
    ];

    const filteredReports = useMemo(() => {
        return permittedReports.filter(
            r =>
                r.category === activeCategory &&
                (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [activeCategory, searchTerm, permittedReports]);

    useEffect(() => {
        const firstVisibleCategory = REPORT_CATEGORIES.find(category => category.module === activeModule);
        const activeCategoryStillVisible = visibleCategories.some(category => category.id === activeCategory);

        if (!activeCategoryStillVisible && firstVisibleCategory) {
            setActiveCategory(firstVisibleCategory.id);
        }
    }, [activeCategory, activeModule, visibleCategories]);

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
        <div className="space-y-6 md:space-y-10 max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Quantum BI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Cockpit</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-tight">
                        Reports are locked to the active business context to prevent cross-business leakage.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
                        <div className="px-5 py-2.5 rounded-xl font-black text-[11px] tracking-widest uppercase bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                            {activeBusiness.label}
                        </div>
                        <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                            Active Business Only
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-2 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-2 border border-slate-200/60 dark:border-slate-800"
                >
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
                        {['today', 'week', 'month', 'year'].map(period => (
                            <button
                                key={period}
                                onClick={() => setQuickDate(period as any)}
                                className={clsx(
                                    'px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all',
                                    activeQuickDate === period
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm'
                                )}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" />
                    <div className="flex items-center gap-3 px-4">
                        <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none bg-transparent hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                                value={dateRange.start.toISOString().split('T')[0]}
                                onChange={e =>
                                    setDateRange({ ...dateRange, start: new Date(e.target.value) })
                                }
                            />
                            <span className="text-slate-400 font-bold">→</span>
                            <input
                                type="date"
                                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none bg-transparent hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                                value={dateRange.end.toISOString().split('T')[0]}
                                onChange={e =>
                                    setDateRange({ ...dateRange, end: new Date(e.target.value) })
                                }
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={kpi.onClick}
                        className="cursor-pointer group h-full"
                    >
                        <div
                            className={clsx(
                                'h-full p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:-translate-y-1',
                                'bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
                            )}
                        >
                            <div
                                className={clsx(
                                    'absolute -top-10 -right-10 w-40 h-40 blur-[60px] rounded-full opacity-20 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-all duration-700',
                                    `bg-gradient-to-br ${kpi.grad}`
                                )}
                            />
                            <div className="flex flex-col justify-between h-full relative z-10">
                                <div className="flex justify-between items-start mb-6 md:mb-8">
                                    <div
                                        className={clsx(
                                            'p-3.5 rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3',
                                            'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500'
                                        )}
                                    >
                                        <kpi.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span
                                            className={clsx(
                                                'text-[10px] font-bold uppercase tracking-widest mb-1.5',
                                                'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors'
                                            )}
                                        >
                                            {kpi.label}
                                        </span>
                                        <h3 className={clsx(
                                            "text-xl md:text-3xl font-black tracking-tighter tabular-nums",
                                            "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                        )}>
                                            {kpi.value}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className={clsx(
                                            'h-1.5 flex-1 rounded-full overflow-hidden',
                                            'bg-slate-100 dark:bg-slate-800'
                                        )}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                            className={clsx('h-full bg-gradient-to-r', kpi.grad)}
                                        />
                                    </div>
                                    <p
                                        className={clsx(
                                            'text-[9px] font-black uppercase tracking-widest whitespace-nowrap',
                                            'text-slate-400 dark:text-slate-500'
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                    {
                        id: 'today-pulse',
                        title: "Today's Pulse",
                        desc: 'Every sale, recovery, and expense today',
                        badge: 'Master Audit',
                        icon: ShieldCheck,
                        gradient: 'from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500',
                    },
                    {
                        id: 'shift-reconciliation-all',
                        title: 'Shift Archives',
                        desc: 'Historical shift data with reconciliation',
                        badge: 'Financials',
                        icon: Calendar,
                        gradient: 'from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600',
                    },
                ].map((master, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedReportId(master.id)}
                        className={clsx(
                            'p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-left relative overflow-hidden transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-xl group flex items-start gap-5 md:gap-6 border',
                            'bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl text-slate-900 dark:text-white border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        )}
                    >
                        <div
                            className={clsx(
                                'absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700',
                                `bg-gradient-to-bl ${master.gradient}`
                            )}
                        />
                        <div
                            className={clsx(
                                'shrink-0 p-4 rounded-2xl md:rounded-3xl transition-transform group-hover:scale-110 duration-500 relative z-10',
                                'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 shadow-sm'
                            )}
                        >
                            <master.icon size={28} strokeWidth={2} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <span
                                className={clsx(
                                    'px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border inline-block mb-3 transition-colors',
                                    'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                                )}
                            >
                                {master.badge}
                            </span>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {master.title}
                            </h3>
                            <p
                                className={clsx(
                                    'text-xs md:text-sm font-medium leading-relaxed max-w-[90%]',
                                    'text-slate-500 dark:text-slate-400'
                                )}
                            >
                                {master.desc}
                            </p>
                            <div
                                className={clsx(
                                    'mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group-hover:translate-x-1',
                                    'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                )}
                            >
                                Access Details <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden min-h-[600px] flex flex-col xl:flex-row">
                <div className="w-full xl:w-72 bg-slate-50/50 dark:bg-slate-900/30 border-r border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[.2em] mb-4 px-3">
                        Data Intelligence
                    </p>
                    {visibleCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={clsx(
                                'w-full px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all duration-200',
                                activeCategory === cat.id
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                            )}
                        >
                            <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    'text-[9px] font-black min-w-[22px] h-5 flex items-center justify-center rounded-md px-1',
                                    activeCategory === cat.id
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500'
                                )}>
                                    {categoryCounts[cat.id] || 0}
                                </span>
                                <ChevronRight
                                    size={16}
                                    className={clsx(
                                        'transition-transform',
                                        activeCategory === cat.id
                                            ? 'translate-x-1'
                                            : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                                    )}
                                />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto noscrollbar bg-transparent">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-12">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {visibleCategories.find(c => c.id === activeCategory)?.name || 'Select Category'}
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                                Secure transaction records and analytical drill-downs.
                            </p>
                        </div>
                        <div className="relative w-full lg:w-80 group">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 text-sm font-semibold text-slate-900 dark:text-white shadow-sm transition-all placeholder:text-slate-400 backdrop-blur-md"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="contents"
                            >
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report, idx) => (
                                        <motion.button
                                            key={report.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedReportId(report.id)}
                                            className="text-left p-5 md:p-6 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500/40 dark:hover:border-blue-400/40 hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_20px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300 group backdrop-blur-md"
                                        >
                                            <div className="flex items-start gap-4 md:gap-5">
                                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-slate-100 dark:bg-slate-900/50 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-white transition-all shadow-sm">
                                                    {(() => {
                                                        const Icon = report.icon || FileIcon;
                                                        return <Icon size={24} strokeWidth={1.5} />;
                                                    })()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 truncate tracking-tight">
                                                        {report.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                                                        {report.description}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                                                            Zero-Escape Log
                                                        </span>
                                                        {report.drillDown && (
                                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                                                                Drill-Down Ready
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                                            <Search size={28} />
                                        </div>
                                        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">No Reports Found</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
                                            No reports match "{searchTerm}" in the {REPORT_CATEGORIES.find(c => c.id === activeCategory)?.name} category.
                                        </p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-10 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-4"
                    >
                        <ShieldCheck className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                                Audit-Grade Assurance Statement
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-medium">
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
