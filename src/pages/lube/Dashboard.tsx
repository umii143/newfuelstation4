import { useExpenseStore } from '@/stores/dataStores';
import { useCashBankStore, useCustomerLedgerStore } from '@/stores/ledgerStore';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Calendar,
    ChevronDown,
    DollarSign,
    Package,
    RefreshCw,
    ShoppingBag,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Line,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import './lube-dashboard.css';

interface LubeDashboardProps {
    onNavigate?: (path: string) => void;
}

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================
function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
}: {
    value: number;
    prefix?: string;
    suffix?: string;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

// ============================================================================
// TIME PERIOD SELECTOR
// ============================================================================
type TimePeriod = 'today' | 'week' | 'month' | 'year';

function TimePeriodSelector({
    selected,
    onChange,
}: {
    selected: TimePeriod;
    onChange: (period: TimePeriod) => void;
}) {
    const periods: { value: TimePeriod; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
    ];

    return (
        <div className="flex items-center gap-1 glass-card px-2 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-gray-500" />
            {periods.map(period => (
                <button
                    key={period.value}
                    onClick={() => onChange(period.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selected === period.value
                            ? 'bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
}

// ============================================================================
// REFRESH BUTTON
// ============================================================================
function RefreshButton({
    onRefresh,
    lastUpdated,
    isRefreshing,
}: {
    onRefresh: () => void;
    lastUpdated: Date;
    isRefreshing: boolean;
}) {
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
            if (seconds < 60) setRelativeTime(`${seconds}s ago`);
            else if (seconds < 3600) setRelativeTime(`${Math.floor(seconds / 60)}m ago`);
            else setRelativeTime(`${Math.floor(seconds / 3600)}h ago`);
        };

        updateTime();
        const interval = setInterval(updateTime, 10000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    return (
        <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm text-gray-600">{relativeTime}</span>
        </button>
    );
}

// ============================================================================
// STOCK ALERT BADGE
// ============================================================================
function StockAlertBadge({
    count,
    items,
    onNavigate,
}: {
    count: number;
    items: any[];
    onNavigate?: (path: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (count === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 glass-card px-4 py-3 rounded-xl hover:shadow-lg transition-all group w-full"
            >
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                        {count}
                    </div>
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-900">Low Stock Alert</p>
                    <p className="text-xs text-gray-600">
                        {count} {count === 1 ? 'product needs' : 'products need'} restocking
                    </p>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl p-3 shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        {items.map((product,  ) => (
                            <div
                                key={product.productId}
                                className="flex items-center justify-between p-2 hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-red-600">
                                        Only {product.currentStock} left
                                    </p>
                                </div>
                                <button
                                    onClick={() => onNavigate?.('/lube/products')}
                                    className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-medium hover:shadow-md transition-shadow"
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================
function QuickActions({ onNavigate }: { onNavigate?: (path: string) => void }) {
    const actions = [
        {
            label: 'New Sale',
            icon: ShoppingBag,
            onClick: () => onNavigate?.('/lube/sales'),
            color: 'from-emerald-500 to-green-600',
        },
        {
            label: 'Add Product',
            icon: Package,
            onClick: () => onNavigate?.('/lube/products'),
            color: 'from-purple-500 to-indigo-600',
        },
        {
            label: 'Add Customer',
            icon: Users,
            onClick: () => onNavigate?.('/lube/customers'),
            color: 'from-blue-500 to-cyan-600',
        },
    ];

    return (
        <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
                <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow-lg hover:shadow-xl transition-all`}
                >
                    <action.icon className="w-4 h-4" />
                    <span className="text-sm hidden lg:inline">{action.label}</span>
                </motion.button>
            ))}
        </div>
    );
}

// ============================================================================
// EMPTY STATE
// ============================================================================
function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================
function SkeletonKPICard() {
    return (
        <div className="glass-card rounded-2xl p-6 shadow-3d">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                <div className="w-16 h-6 rounded-lg bg-gray-200 animate-pulse" />
            </div>
            <div className="space-y-2">
                <div className="w-24 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="w-32 h-8 rounded bg-gray-200 animate-pulse" />
            </div>
        </div>
    );
}

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================
interface KPICardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: React.ElementType;
    trend?: number;
    color: string;
    index: number;
}

function KPICard({
    title,
    value,
    prefix = '₨ ',
    suffix = '',
    icon: Icon,
    trend,
    color,
    index,
}: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="glass-card rounded-2xl p-6 shadow-3d cursor-pointer"
            whileHover={{ y: -4, scale: 1.02 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                    }}
                >
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
                {trend !== undefined && (
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}
                    >
                        {trend >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : (
                            <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                </h3>
            </div>
        </motion.div>
    );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export const LubeDashboard: React.FC<LubeDashboardProps> = ({ onNavigate }) => {
    const { products } = useProductStore();
    const { sales } = useSalesStore();

    const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Filter lube products
    const lubeProducts = products.filter(
        p => p.category !== 'FUEL_PETROL' && p.category !== 'FUEL_DIESEL'
    );

    // Get date range based on period
    const getDateRange = () => {
        const now = new Date();
        const start = new Date();

        switch (timePeriod) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - 1);
                break;
        }

        return { start, end: now };
    };

    const { start: startDate, end: endDate } = getDateRange();

    // Filter sales by period
    const periodSales = sales.filter(s => {
        const saleDate = new Date(s.timestamp);
        return saleDate >= startDate && saleDate <= endDate && s.status === 'COMPLETED';
    });

    // Calculate previous period for comparison
    const getPreviousPeriod = () => {
        const duration = endDate.getTime() - startDate.getTime();
        return sales.filter(s => {
            const saleDate = new Date(s.timestamp);
            const prevStart = new Date(startDate.getTime() - duration);
            const prevEnd = new Date(startDate);
            return saleDate >= prevStart && saleDate < prevEnd && s.status === 'COMPLETED';
        });
    };

    const previousSales = getPreviousPeriod();

    // Calculate metrics
    const todayRevenue = periodSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todayTransactions = periodSales.length;
    const previousTransactions = previousSales.length;

    const activeCustomers = periodSales.filter(
        (sale, index, self) => index === self.findIndex(s => s.customerId === sale.customerId)
    ).length;
    const previousCustomers = previousSales.filter(
        (sale, index, self) => index === self.findIndex(s => s.customerId === sale.customerId)
    ).length;

    const inventoryValue = lubeProducts.reduce((sum, p) => sum + p.currentStock * p.salePrice, 0);

    // Calculate percentage changes
    const revenueChange =
        previousRevenue > 0
            ? Number((((todayRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
            : 0;
    const transactionChange =
        previousTransactions > 0
            ? Number(
                  (
                      ((todayTransactions - previousTransactions) / previousTransactions) *
                      100
                  ).toFixed(1)
              )
            : 0;
    const customerChange =
        previousCustomers > 0
            ? Number((((activeCustomers - previousCustomers) / previousCustomers) * 100).toFixed(1))
            : 0;
    void transactionChange;
    void customerChange;

    // Low stock items
    const lowStockItems = lubeProducts.filter(p => p.currentStock < 10);

    // ── Real Cash & Bank balance from ledger ──────────────────────────────
    const { accounts, entries: cashEntries } = useCashBankStore();
    const { entries: ledgerEntries, getCustomerBalance } = useCustomerLedgerStore();
    const { expenses: allExpenses } = useExpenseStore();

    const cashBalance = useMemo(() => {
        const cashAccount = accounts.find(a => a.type === 'CASH' && a.status === 'ACTIVE');
        if (!cashAccount) return 0;
        const relevant = cashEntries.filter(e => e.accountId === cashAccount.accountId);
        if (relevant.length === 0) return cashAccount.openingBalance ?? 0;
        return relevant[relevant.length - 1].balance;
    }, [accounts, cashEntries]);

    const bankBalance = useMemo(() => {
        const bankAccounts = accounts.filter(a => a.type === 'BANK' && a.status === 'ACTIVE');
        return bankAccounts.reduce((total, acct) => {
            const relevant = cashEntries.filter(e => e.accountId === acct.accountId);
            const balance =
                relevant.length > 0
                    ? relevant[relevant.length - 1].balance
                    : (acct.openingBalance ?? 0);
            return total + balance;
        }, 0);
    }, [accounts, cashEntries]);

    // Total outstanding receivables from all credit customers
    const totalReceivables = useMemo(() => {
        const customerIds = [...new Set(ledgerEntries.map(e => e.customerId))];
        return customerIds.reduce((sum, cid) => {
            const bal = getCustomerBalance(cid);
            return sum + (bal > 0 ? bal : 0);
        }, 0);
    }, [ledgerEntries, getCustomerBalance]);

    // Monthly profit = revenue - cost (using currentMonth sales cost is not stored; use revenue − expenses for the month)
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthSales = sales.filter(
        s => new Date(s.timestamp) >= currentMonthStart && s.status === 'COMPLETED'
    );
    const monthRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const monthExpenses = allExpenses
        ? allExpenses
              .filter((e: any) => new Date(e.date || e.createdAt) >= currentMonthStart)
              .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
        : 0;
    const monthlyProfit = Math.max(0, monthRevenue - monthExpenses);
    const monthlyProfitTrend =
        previousRevenue > 0
            ? Number((((monthRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1))
            : 0;

    // Sales chart — last 7 months from real data
    const salesChartData = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
            const monthSalesTotal = sales
                .filter(s => {
                    const sd = new Date(s.timestamp);
                    return sd >= d && sd <= monthEnd && s.status === 'COMPLETED';
                })
                .reduce((sum, s) => sum + s.totalAmount, 0);
            return {
                name: d.toLocaleDateString('en-PK', { month: 'short' }),
                sales: monthSalesTotal,
                target: monthSalesTotal * 1.15, // 15% stretch target
            };
        });
    }, [sales]);

    // Expense pie — from real expense store, grouped by category
    const expenseData = useMemo(() => {
        const COLORS: Record<string, string> = {
            PURCHASES: '#0066cc',
            SALARIES: '#00a896',
            RENT: '#ff6b6b',
            UTILITIES: '#ffd93d',
            MAINTENANCE: '#f97316',
            OTHER: '#a78bfa',
        };
        if (!allExpenses || allExpenses.length === 0) {
            return [{ name: 'No Expenses Yet', value: 1, color: '#e5e7eb' }];
        }
        const grouped: Record<string, number> = {};
        allExpenses.forEach((e: any) => {
            const cat = (e.category || 'OTHER').toUpperCase();
            grouped[cat] = (grouped[cat] || 0) + (e.amount || 0);
        });
        return Object.entries(grouped).map(([name, value]) => ({
            name: name.charAt(0) + name.slice(1).toLowerCase(),
            value,
            color: COLORS[name] || '#94a3b8',
        }));
    }, [allExpenses]);

    // Top products
    const topProducts = useMemo(() => {
        const salesByProduct = lubeProducts.map(product => {
            const totalQty = periodSales.reduce((sum, sale) => {
                const item = sale.items.find(i => i.productId === product.productId);
                return sum + (item?.quantity || 0);
            }, 0);
            const revenue = periodSales.reduce((sum, sale) => {
                const item = sale.items.find(i => i.productId === product.productId);
                return sum + (item ? item.quantity * (item.totalAmount ?? item.unitPrice) : 0);
            }, 0);
            return { ...product, soldToday: totalQty, revenue };
        });
        return salesByProduct.sort((a, b) => b.soldToday - a.soldToday).slice(0, 5);
    }, [lubeProducts, periodSales]);

    // Top customers
    const topCustomers = useMemo(() => {
        const customerMap = new Map<string, { purchases: number; amount: number }>();

        periodSales.forEach(sale => {
            const existing = customerMap.get(sale.customerId || 'walk-in') || { purchases: 0, amount: 0 };
            customerMap.set(sale.customerId || 'walk-in', {
                purchases: existing.purchases + 1,
                amount: existing.amount + sale.totalAmount,
            });
        });

        return Array.from(customerMap.entries())
            .map(([id, data]) => ({
                id,
                name: id,
                purchases: data.purchases,
                amount: data.amount,
                outstanding: 0,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [periodSales]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 1500);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
                        <div className="w-96 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonKPICard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Controls */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back! Here's your business overview.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <TimePeriodSelector selected={timePeriod} onChange={setTimePeriod} />
                        <RefreshButton
                            onRefresh={handleRefresh}
                            lastUpdated={lastUpdated}
                            isRefreshing={isRefreshing}
                        />
                        <QuickActions onNavigate={onNavigate} />
                    </div>
                </div>

                {/* Low Stock Alert */}
                {lowStockItems.length > 0 && (
                    <StockAlertBadge
                        count={lowStockItems.length}
                        items={lowStockItems}
                        onNavigate={onNavigate}
                    />
                )}
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPICard
                    title={`${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Sales`}
                    value={todayRevenue}
                    icon={TrendingUp}
                    trend={revenueChange}
                    color="#0066cc"
                    index={0}
                />
                <KPICard
                    title="Cash in Hand"
                    value={cashBalance}
                    icon={Wallet}
                    color="#00a896"
                    index={1}
                />
                <KPICard
                    title="Bank Balance"
                    value={bankBalance}
                    icon={Banknote}
                    color="#a78bfa"
                    index={2}
                />
                <KPICard
                    title="Receivables"
                    value={totalReceivables}
                    icon={AlertCircle}
                    color="#ff6b6b"
                    index={3}
                />
                <KPICard
                    title="Stock Value"
                    value={inventoryValue}
                    icon={Package}
                    color="#ffd93d"
                    index={4}
                />
                <KPICard
                    title="Monthly Profit"
                    value={monthlyProfit}
                    icon={DollarSign}
                    trend={monthlyProfitTrend}
                    color="#00a896"
                    index={5}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Overview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 shadow-3d"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Sales Overview
                            </h3>
                            <p className="text-sm text-gray-600">Monthly sales vs target</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#0066cc]" />
                                <span className="text-xs text-gray-600">Sales</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                                <span className="text-xs text-gray-600">Target</span>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={salesChartData}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#0066cc"
                                strokeWidth={3}
                                fill="url(#salesGradient)"
                            />
                            <Line
                                type="monotone"
                                dataKey="target"
                                stroke="#e5e7eb"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Expense Breakdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-2xl p-6 shadow-3d"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Expense Breakdown
                        </h3>
                        <p className="text-sm text-gray-600">This month's expenses</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {expenseData.map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: item.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-600 truncate">{item.name}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        ₨ {item.value.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card rounded-2xl p-6 shadow-3d"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Top Products
                            </h3>
                            <p className="text-sm text-gray-600">Best selling this {timePeriod}</p>
                        </div>
                        <button
                            onClick={() => onNavigate?.('/lube/products')}
                            className="text-sm text-[#0066cc] hover:text-[#0052a3] font-medium smooth-transition"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topProducts.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="No sales data"
                                description={`No products have been sold this ${timePeriod}. Start making sales to see top performers here.`}
                                action={{
                                    label: 'New Sale',
                                    onClick: () => onNavigate?.('/lube/sales'),
                                }}
                            />
                        ) : (
                            topProducts.map((product, index) => (
                                <motion.div
                                    key={product.productId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 smooth-transition"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center text-white font-semibold">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-600">
                                                {product.soldToday} sold
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span
                                                className={`text-xs ${
                                                    product.currentStock < 10
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                {product.currentStock} in stock
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(product.revenue)}
                                        </p>
                                        <p className="text-xs text-gray-600">revenue</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Top Customers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card rounded-2xl p-6 shadow-3d"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Top Customers
                            </h3>
                            <p className="text-sm text-gray-600">
                                Highest spending this {timePeriod}
                            </p>
                        </div>
                        <button
                            onClick={() => onNavigate?.('/lube/customers')}
                            className="text-sm text-[#0066cc] hover:text-[#0052a3] font-medium smooth-transition"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topCustomers.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No customer data"
                                description={`No customers have made purchases this ${timePeriod}. Start processing sales to see top customers here.`}
                                action={{
                                    label: 'New Sale',
                                    onClick: () => onNavigate?.('/lube/sales'),
                                }}
                            />
                        ) : (
                            topCustomers.map((customer, index) => (
                                <motion.div
                                    key={customer.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 smooth-transition"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#00a896] to-[#0066cc] flex items-center justify-center text-white font-semibold">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {customer.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-600">
                                                {customer.purchases} orders
                                            </span>
                                            {customer.outstanding > 0 && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-red-600">
                                                        ₨ {customer.outstanding.toLocaleString()}{' '}
                                                        due
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(customer.amount)}
                                        </p>
                                        <p className="text-xs text-gray-600">total</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
