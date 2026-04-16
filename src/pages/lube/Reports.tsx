import { DateRange, DateRangeFilter } from '@/components/audit/DateRangeFilter';
import { Card, Input, PageHeader } from '@/components/ui';
import { analyticsEngine } from '@/lib/analyticsEngine';
import { REPORT_REGISTRY } from '@/pages/reports/ReportRegistry';
import ReportViewer from '@/pages/reports/ReportViewer';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import {
    ArrowUpRight,
    BarChart3,
    Calendar,
    ChevronRight,
    Download,
    FileText,
    Filter,
    Search,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDefaultRange = (): DateRange => {
    const now = new Date();
    return {
        startDate: startOfMonth(now).toISOString(),
        endDate: now.toISOString(),
        preset: 'THIS_MONTH',
    };
};

const fmt = (n: number) =>
    `₨${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

// ─── Component ────────────────────────────────────────────────────────────────

export const LubeReportsPage: React.FC = () => {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());

    // ── Store subscriptions at top level (not inside IIFE) ──────────────────
    const { sales } = useSalesStore();
    const { products } = useProductStore();

    // ── Computed KPIs ────────────────────────────────────────────────────────
    const lubeProducts = useMemo(
        () => products.filter(p => !p.category?.startsWith('FUEL')),
        [products]
    );

    const { mtdSalesAmt, mtdCost, mtdMovement, mtdSalesCount, lowStockCount, auditScore } =
        useMemo(() => {
            const filtered = sales.filter(s => {
                if (s.status !== 'COMPLETED') return false;
                try {
                    return isWithinInterval(parseISO(s.timestamp), {
                        start: parseISO(dateRange.startDate),
                        end: parseISO(dateRange.endDate),
                    });
                } catch {
                    return false;
                }
            });

            let mtdSalesAmt = 0;
            let mtdCost = 0;
            let mtdMovement = 0;

            filtered.forEach(sale => {
                sale.items.forEach(item => {
                    const product = lubeProducts.find(p => p.productId === item.productId);
                    if (product) {
                        mtdSalesAmt += item.unitPrice * item.quantity;
                        mtdCost += product.costPrice * item.quantity;
                        mtdMovement += item.quantity;
                    }
                });
            });

            const outOfStockCount = lubeProducts.filter(p => p.currentStock <= 0).length;
            const lowStockCount = lubeProducts.filter(
                p => p.currentStock > 0 && p.currentStock <= 10
            ).length;
            const penalty = outOfStockCount * 2 + lowStockCount * 0.5;
            const auditScore = Math.max(0, Math.min(100, 100 - penalty));

            return {
                mtdSalesAmt,
                mtdCost,
                mtdMovement,
                mtdSalesCount: filtered.length,
                lowStockCount,
                auditScore,
            };
        }, [sales, lubeProducts, dateRange]);

    const netProfit = mtdSalesAmt - mtdCost;
    const marginPercent = mtdSalesAmt > 0 ? ((netProfit / mtdSalesAmt) * 100).toFixed(1) : '0.0';

    // ── Report Registry ──────────────────────────────────────────────────────
    const lubeReports = useMemo(
        () => REPORT_REGISTRY.filter(r => r.id.startsWith('lube-')),
        []
    );

    const filteredReports = lubeReports.filter(
        r =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Drill-down report viewer ──────────────────────────────────────────────
    if (selectedReportId) {
        return (
            <ReportViewer
                reportId={selectedReportId}
                onBack={() => setSelectedReportId(null)}
                dateRange={{
                    start: new Date(dateRange.startDate),
                    end: new Date(dateRange.endDate),
                }}
            />
        );
    }

    // ── CSV export for entire filtered sales dataset ─────────────────────────
    const handleExportAllSales = () => {
        const exportRows = sales
            .filter(s => {
                if (s.status !== 'COMPLETED') return false;
                try {
                    return isWithinInterval(parseISO(s.timestamp), {
                        start: parseISO(dateRange.startDate),
                        end: parseISO(dateRange.endDate),
                    });
                } catch {
                    return false;
                }
            })
            .flatMap(s =>
                s.items.map(item => ({
                    saleId: s.saleId,
                    timestamp: s.timestamp,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.unitPrice * item.quantity,
                    paymentMethod: s.paymentMethod,
                }))
            );
        analyticsEngine.exportToCSV('Lube_Sales', exportRows);
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Lube Advanced Reports"
                subtitle="Detailed traceability, inventory movement, and profit auditing"
                actions={
                    <button
                        onClick={handleExportAllSales}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                }
            />

            {/* Date Range Filter */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                        Reporting Period
                    </span>
                </div>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </Card>

            {/* KPI Cards — hoisted to top-level (no IIFE hack) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sales */}
                <Card className="p-5 bg-blue-600 text-white border-0 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                    <BarChart3 size={20} className="mb-2 opacity-60" />
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                        Total Lube Sales
                    </p>
                    <h3 className="text-2xl font-black mt-1">{fmt(mtdSalesAmt)}</h3>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-200">
                        <TrendingUp size={12} />
                        <span>Based on {mtdSalesCount} transactions</span>
                    </div>
                </Card>

                {/* Profit */}
                <Card className="p-5 bg-[var(--bg-surface)] shadow-xl border-l-4 border-emerald-500">
                    <ArrowUpRight size={20} className="text-emerald-500 mb-2" />
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        Net Profit
                    </p>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {fmt(netProfit)}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2">
                        Margin: {marginPercent}%
                    </p>
                </Card>

                {/* Stock Movement */}
                <Card className="p-5 bg-[var(--bg-surface)] shadow-xl border-l-4 border-amber-500">
                    <TrendingUp size={20} className="text-amber-500 mb-2" />
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        Stock Movement
                    </p>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {mtdMovement.toLocaleString()} U
                    </h3>
                    <p className="text-[10px] text-amber-500 font-bold mt-2">
                        {lowStockCount} Items Low Stock
                    </p>
                </Card>

                {/* Audit Score */}
                <Card className="p-5 bg-[var(--bg-surface)] shadow-xl border-l-4 border-purple-500">
                    <FileText size={20} className="text-purple-500 mb-2" />
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        Audit Score
                    </p>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                        {auditScore.toFixed(1)}%
                    </h3>
                    <p className="text-[10px] text-purple-500 font-bold mt-2">
                        Live Inventory Health
                    </p>
                </Card>
            </div>

            {/* Reports Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-black text-[var(--text-primary)] uppercase text-xs tracking-widest flex items-center gap-2">
                        <Filter size={14} className="text-blue-500" />
                        Available Lube Reports ({filteredReports.length})
                    </h4>
                    <div className="relative w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            size={14}
                        />
                        <Input
                            placeholder="Search reports..."
                            className="pl-10 h-9 text-xs"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredReports.length === 0 ? (
                    <Card className="p-12 flex flex-col items-center justify-center text-center">
                        <Search size={40} className="text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">
                            No reports match &ldquo;{searchTerm}&rdquo;
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReports.map(report => (
                            <Card
                                key={report.id}
                                onClick={() => setSelectedReportId(report.id)}
                                className="p-5 hover:border-blue-500/50 hover:shadow-2xl transition-all cursor-pointer group border-[var(--border)]"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] tracking-tighter group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        {report.category}
                                    </span>
                                </div>
                                <h5 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-blue-600 transition-colors">
                                    {report.title}
                                </h5>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                                    {report.description}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                    <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                                        View Detailed Report <ChevronRight size={12} />
                                    </span>
                                    <Download
                                        size={14}
                                        className="text-[var(--text-muted)] group-hover:text-blue-500 transition-all"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
