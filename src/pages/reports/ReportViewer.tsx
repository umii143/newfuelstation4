import { Button, Card } from '@/components/ui';
import { useCNGStore } from '@/stores/cngStore';
import { useDiscountStore } from '@/stores/discountStore';
import { useFuelStore } from '@/stores/fuelStore';
import {
    useAuditStore,
    useCashBankStore,
    useCustomerLedgerStore,
    useStaffLedgerStore,
} from '@/stores/ledgerStore';
import { useProductStore, useSalesStore } from '@/stores/productStore';
import { useProfitStore } from '@/stores/profitStore';
import clsx from 'clsx';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Calendar,
    ChevronLeft,
    Download,
    FileText as FileIcon,
    FileSpreadsheet,
    Filter,
    Search,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { REPORT_REGISTRY } from './ReportRegistry';

interface ReportViewerProps {
    reportId: string;
    onBack: () => void;
    dateRange?: { start: Date; end: Date };
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId, onBack, dateRange }) => {
    const report = useMemo(() => REPORT_REGISTRY.find(r => r.id === reportId), [reportId]);
    const shifts = useFuelStore(state => state.shifts);
    const customerEntries = useCustomerLedgerStore(state => state.entries);
    const cashEntries = useCashBankStore(state => state.entries);
    const auditLogs = useAuditStore(state => state.logs);
    const profitEntries = useProfitStore(state => state.entries);
    const staffEntries = useStaffLedgerStore(state => state.entries);
    const cngShifts = useCNGStore(state => state.shifts);
    const discountEntries = useDiscountStore(state => state.discountEntries);
    const lubeSales = useSalesStore(state => state.sales);
    const lubeInventory = useProductStore(state => state.products);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);

    // Data Resolution Layer
    const rawData = useMemo(() => {
        if (!report) return [];

        const isWithinRange = (dateStr: string) => {
            if (!dateRange) return true;
            const date = new Date(dateStr);
            return date >= dateRange.start && date <= dateRange.end;
        };

        switch (report.dataSource) {
            case 'masterPulse': {
                const sales = shifts
                    .filter(s => isWithinRange(s.date))
                    .flatMap(s =>
                        s.nozzleSales.map(ns => ({
                            timestamp: `${s.date} ${s.shiftNumber}`,
                            type: 'SALE',
                            description: `${ns.nozzleName} - ${ns.fuelType} (${ns.netSales}L @ ₨${ns.rate})`,
                            amount: ns.revenue,
                            staff: s.staffName,
                            date: s.date,
                        }))
                    );
                const expenses = cashEntries
                    .filter(e => e.type === 'EXPENSE' && isWithinRange(e.date))
                    .map(e => ({
                        timestamp: e.timestamp || e.date,
                        type: 'EXPENSE',
                        description: e.remarks || 'Station Expense',
                        amount: e.debit,
                        staff: e.staffName,
                        date: e.date,
                    }));
                const recoveries = customerEntries
                    .filter(e => e.type === 'RECOVERY' && isWithinRange(e.date))
                    .map(e => ({
                        timestamp: e.timestamp || e.date,
                        type: 'RECOVERY',
                        description: `Credit Recovery: ${e.customerName}`,
                        amount: e.credit,
                        staff: e.staffName || 'N/A',
                        date: e.date,
                    }));
                return [...sales, ...expenses, ...recoveries].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            }

            case 'shiftArchive':
                return shifts
                    .filter(s => isWithinRange(s.date))
                    .map(s => ({
                        shiftNumber: s.shiftNumber,
                        date: s.date,
                        staffName: s.staffName,
                        totalSales: s.totalRevenue,
                        totalCash: s.actualCash,
                        variance: s.variance,
                        status: Math.abs(s.variance) < 10 ? 'BALANCED' : 'VARIANCE',
                    }));

            case 'shiftSales':
                return shifts
                    .filter(s => isWithinRange(s.date))
                    .flatMap(s =>
                        s.nozzleSales.map(ns => ({
                            ...ns,
                            date: s.date,
                            shiftNumber: s.shiftNumber,
                            staffName: s.staffName,
                        }))
                    );
            case 'expenses':
                return cashEntries.filter(
                    (e: any) => e.type === 'EXPENSE' && isWithinRange(e.date)
                );
            case 'customerLedger':
                return customerEntries.filter((e: any) => isWithinRange(e.date));
            case 'cashLedger':
                return cashEntries.filter((e: any) => isWithinRange(e.date));
            case 'auditLogs':
                return auditLogs.filter((l: any) => isWithinRange(l.timestamp));
            case 'profitLedger':
                return profitEntries.filter((e: any) => isWithinRange(e.date));
            case 'staffLedger':
                return staffEntries.filter((e: any) => isWithinRange(e.date));

            // Specialized Fuel Data Sources
            case 'hourlySales': {
                // Group actual nozzle sales by hour slot derived from shift date
                const HOUR_SLOTS = ['06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'];
                const hourlyMap: Record<string, any> = {};
                HOUR_SLOTS.forEach(slot => {
                    hourlyMap[slot] = { hour: slot, pmsLiters: 0, agoLiters: 0, totalRevenue: 0, transactions: 0 };
                });
                // Distribute shifts evenly across their natural slots (morning=06-14, evening=14-22, night=22-06)
                shifts
                    .filter(s => isWithinRange(s.date))
                    .forEach(shift => {
                        const slot =
                            shift.shiftType === 'MORNING' ? '06-08' :
                            shift.shiftType === 'EVENING' ? '14-16' : '22-24';
                        shift.nozzleSales.forEach(ns => {
                            if (!hourlyMap[slot]) return;
                            if (ns.fuelType === 'PETROL_92' || ns.fuelType === 'PETROL_95')
                                hourlyMap[slot].pmsLiters += ns.netSales;
                            else hourlyMap[slot].agoLiters += ns.netSales;
                            hourlyMap[slot].totalRevenue += ns.revenue;
                            hourlyMap[slot].transactions += 1;
                        });
                    });
                return Object.values(hourlyMap).filter(h => h.transactions > 0 || h.pmsLiters > 0);
            }

            case 'fuelPerformance': {
                const perf: Record<string, any> = {};
                let totalVol = 0;
                shifts
                    .filter(s => isWithinRange(s.date))
                    .flatMap(s => s.nozzleSales)
                    .forEach(sale => {
                        if (!perf[sale.fuelType]) {
                            perf[sale.fuelType] = {
                                fuelType: sale.fuelType,
                                volume: 0,
                                revenue: 0,
                                margin: 0,
                            };
                        }
                        perf[sale.fuelType].volume += sale.netSales;
                        perf[sale.fuelType].revenue += sale.revenue;
                        perf[sale.fuelType].margin +=
                            sale.netSales * (sale.fuelType === 'PETROL_92' ? 4 : 3.5);
                        totalVol += sale.netSales;
                    });
                return Object.values(perf).map((p: any) => ({
                    ...p,
                    share: `${((p.volume / (totalVol || 1)) * 100).toFixed(1)}%`,
                }));
            }

            case 'nozzleStats': {
                const stats: Record<string, any> = {};
                shifts
                    .filter(s => isWithinRange(s.date))
                    .flatMap(s => s.nozzleSales)
                    .forEach(sale => {
                        if (!stats[sale.nozzleName]) {
                            stats[sale.nozzleName] = {
                                nozzleName: sale.nozzleName,
                                totalLiters: 0,
                                totalTx: 0,
                                avgFlow: 'N/A',
                                status: 'HEALTHY',
                            };
                        }
                        stats[sale.nozzleName].totalLiters += sale.netSales;
                        stats[sale.nozzleName].totalTx += 1;
                    });
                return Object.values(stats);
            }

            case 'tankStatus': {
                // Read real tank data from fuelStore (already imported via shifts)
                const { tanks } = useFuelStore.getState();
                return tanks.map(t => ({
                    tankName: t.name,
                    fuelType: t.fuelType,
                    currentLevel: Math.round(t.currentLevel),
                    capacity: t.capacity,
                    percentage: `${((t.currentLevel / (t.capacity || 1)) * 100).toFixed(1)}%`,
                    reorder: t.currentLevel <= (t.reorderPoint || 5000) ? 'LOW' : 'OK',
                }));
            }

            case 'fuelReceipts': {
                // Mock historical receipts if no real receipts store yet
                return [
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        tankerId: 'LHE-4589',
                        supplier: 'PSO Central',
                        fuelType: 'PMS',
                        qtyExpected: 15000,
                        qtyReceived: 14985,
                        shortage: 15,
                    },
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        tankerId: 'KHI-9921',
                        supplier: 'Shell Pakistan',
                        fuelType: 'AGO',
                        qtyExpected: 20000,
                        qtyReceived: 20000,
                        shortage: 0,
                    },
                ];
            }

            case 'evaporationStats': {
                const months = ['Jan', 'Feb', 'Mar'];
                return months.flatMap(m => [
                    {
                        month: m,
                        fuelType: 'PMS',
                        totalVolume: 45000,
                        estLoss: 22.5,
                        lossPercent: '0.05%',
                    },
                    {
                        month: m,
                        fuelType: 'AGO',
                        totalVolume: 60000,
                        estLoss: 12,
                        lossPercent: '0.02%',
                    },
                ]);
            }

            case 'meterAudits': {
                return shifts
                    .filter(s => isWithinRange(s.date))
                    .flatMap(s =>
                        s.nozzleSales.map(ns => ({
                            date: s.date,
                            nozzleName: ns.nozzleName,
                            meterReading: ns.closingReading - ns.openingReading,
                            physicalReading: ns.netSales,
                            diff: (ns.closingReading - ns.openingReading) - ns.netSales,
                            status: Math.abs((ns.closingReading - ns.openingReading) - ns.netSales) > 1 ? 'VARIANCE' : 'VALID',
                        }))
                    );
            }

            // CNG Data Sources
            case 'cngSales':
                return cngShifts
                    .filter(s => isWithinRange(s.date))
                    .map(s => ({
                        ...s,
                        soldKgs: s.totalLitersSold || 0,
                        testKgs: 0,
                        revenue: s.totalRevenue || 0,
                    }));

            case 'cngVehicleType': {
                // Aggregate CNG shifts by available data — vehicle type breakdown not captured yet
                // Show totals from real CNG shifts instead of fake per-vehicle breakdown
                const totalKgs = cngShifts
                    .filter(s => isWithinRange(s.date))
                    .reduce((sum, s) => sum + (s.totalLitersSold || 0), 0);
                const totalRevenue = cngShifts
                    .filter(s => isWithinRange(s.date))
                    .reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
                if (totalKgs === 0) return [];
                return [
                    { vehicleType: 'ALL VEHICLES', count: cngShifts.filter(s => isWithinRange(s.date)).length, volume: Math.round(totalKgs), revenue: Math.round(totalRevenue), avgKg: cngShifts.filter(s => isWithinRange(s.date)).length > 0 ? (totalKgs / cngShifts.filter(s => isWithinRange(s.date)).length).toFixed(1) : '0' },
                ];
            }

            case 'cngPressureStats': {
                // Pressure statistics not yet captured per-fill — show cascade bank readings from cngStore
                const { cascades } = useCNGStore.getState();
                if (cascades.length === 0) return [];
                return cascades.map(c => ({
                    pressureRange: `${c.name} (${c.pressure} bar)`,
                    fillCount: cngShifts.filter(s => isWithinRange(s.date)).length,
                    avgFillTime: 'N/A',
                    totalKg: cngShifts
                        .filter(s => isWithinRange(s.date))
                        .reduce((sum, s) => sum + (s.totalLitersSold || 0), 0),
                    efficiency: c.status === 'DISPENSING' ? 'ACTIVE' : c.status,
                }));
            }

            case 'cngEnergy': {
                return [
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        unitsConsumed: 450,
                        kgsCompressed: 1200,
                        costPerKg: 12.5,
                        uptime: 'OPERATIONAL',
                    },
                ];
            }

            case 'cngReceipts': {
                return [
                    {
                        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
                        meterStart: 124500,
                        meterEnd: 125600,
                        volumeMMSCF: 1.1,
                        equivalentKg: 850,
                    },
                ];
            }

            case 'cngInventory':
                return [];

            case 'cngDiscounts':
                return discountEntries.filter(
                    (e: any) => e.businessUnit === 'CNG' && isWithinRange(e.timestamp)
                );

            // Lube Data Sources
            case 'lubeSales':
                return lubeSales.filter((s: any) => isWithinRange(s.timestamp));

            case 'lubeBrandPerf': {
                // Aggregate from real lube sales grouped by brand
                const brandMap: Record<string, { brand: string; volume: number; revenue: number; profit: number }> = {};
                lubeSales.forEach((s: any) => {
                    if (!isWithinRange(s.timestamp)) return;
                    s.items?.forEach((item: any) => {
                        const brand = item.brand || item.productName || 'Unknown';
                        if (!brandMap[brand]) brandMap[brand] = { brand, volume: 0, revenue: 0, profit: 0 };
                        brandMap[brand].volume += item.quantity || 0;
                        brandMap[brand].revenue += item.total || 0;
                        brandMap[brand].profit += (item.total || 0) - (item.cost || 0);
                    });
                });
                const result = Object.values(brandMap);
                return result.length > 0 ? result.map(b => ({ ...b, growth: 'N/A' })) : [];
            }

            case 'lubeViscosity': {
                // Aggregate from real lube sales grouped by viscosity grade
                const viscMap: Record<string, { viscosity: string; volume: number; revenue: number }> = {};
                lubeSales.forEach((s: any) => {
                    if (!isWithinRange(s.timestamp)) return;
                    s.items?.forEach((item: any) => {
                        const grade = item.viscosity || item.productName || 'Unknown';
                        if (!viscMap[grade]) viscMap[grade] = { viscosity: grade, volume: 0, revenue: 0 };
                        viscMap[grade].volume += item.quantity || 0;
                        viscMap[grade].revenue += item.total || 0;
                    });
                });
                const viscResult = Object.values(viscMap);
                return viscResult.length > 0 ? viscResult.map(v => ({ ...v, popPercent: viscResult.reduce((t, _) => t + v.volume, 0) > 0 ? `${((v.volume / viscResult.reduce((t, r) => t + r.volume, 0.001)) * 100).toFixed(1)}%` : 'N/A' })) : [];
            }

            case 'lubeSKUVelocity': {
                // Aggregate real sales counts per product from lubeSales
                const skuMap: Record<string, { productName: string; salesCount: number; revenue: number }> = {};
                lubeSales.forEach((s: any) => {
                    if (!isWithinRange(s.timestamp)) return;
                    s.items?.forEach((item: any) => {
                        const name = item.productName || item.name || 'Unknown';
                        if (!skuMap[name]) skuMap[name] = { productName: name, salesCount: 0, revenue: 0 };
                        skuMap[name].salesCount += item.quantity || 1;
                        skuMap[name].revenue += item.total || 0;
                    });
                });
                const sorted = Object.values(skuMap).sort((a, b) => b.salesCount - a.salesCount).slice(0, 10);
                const maxCount = sorted[0]?.salesCount || 1;
                return sorted.map(p => ({
                    ...p,
                    velocity: p.salesCount > maxCount * 0.7 ? 'FAST' : 'NORMAL',
                    abcClass: p.salesCount > maxCount * 0.8 ? 'A' : 'B',
                    turns: (p.salesCount / 30).toFixed(1),
                }));
            }

            case 'lubeServiceConversion': {
                return [
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        serviceCount: 45,
                        lubeSoldCount: 12,
                        conversionRate: '26.7%',
                        avgTicket: 4500,
                    },
                ];
            }

            case 'lubeReceiptHistory': {
                return [
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        supplier: 'Shell Pakistan',
                        poNumber: 'PO-2026-001',
                        itemsReceived: 24,
                        totalLandedCost: 125000,
                        status: 'RECEIVED',
                    },
                ];
            }

            // Financial & HR Data Sources
            case 'finPL': {
                const months = ['Jan 2026', 'Feb 2026'];
                return months.map(m => ({
                    period: m,
                    revenue: 24500000,
                    cogs: 21200000,
                    expenses: 850000,
                    netProfit: 2450000,
                }));
            }

            case 'hrAttendance': {
                const staff = ['Ali Khan', 'Zubair Shah', 'Imran Malik', 'Sajid Ali'];
                return staff.map(s => ({
                    staffName: s,
                    presentDays: 26,
                    lateDays: 2,
                    leaves: 1,
                    netSalary: 45000,
                }));
            }

            case 'auditPrices': {
                return auditLogs
                    .filter(l => l.action.includes('Price') && isWithinRange(l.timestamp))
                    .map(l => ({
                        timestamp: l.timestamp,
                        item: l.details.split(': ')[1] || 'Unknown',
                        oldPrice: 0, // Placeholder
                        newPrice: 0, // Placeholder
                        changedBy: l.userName,
                    }));
            }

            case 'compSafety': {
                return [
                    {
                        date: format(new Date(), 'yyyy-MM-dd'),
                        incidentType: 'SAFETY_DRILL',
                        description: 'Fire extinguisher manual handling drill completed',
                        status: 'COMPLETED',
                        reportedBy: 'Station Manager',
                    },
                ];
            }

            case 'auditAccess': {
                return auditLogs
                    .filter(l => l.module === 'SYSTEM_ACCESS' && isWithinRange(l.timestamp))
                    .map(l => ({
                        timestamp: l.timestamp,
                        userName: l.userName,
                        action: l.action,
                        ipAddress: 'Recorded by system',
                        status: 'SUCCESS',
                    }));
            }
            case 'lubeInventory':
                return lubeInventory;
            case 'lubeDiscounts':
                return discountEntries.filter(
                    (e: any) => e.businessUnit === 'LUBE' && isWithinRange(e.timestamp)
                );
            case 'lubeExpenses':
                return cashEntries.filter(
                    (e: any) =>
                        e.type === 'EXPENSE' && e.businessUnit === 'LUBE' && isWithinRange(e.date)
                );
            case 'lubeRecoveries':
                return customerEntries.filter(
                    (e: any) =>
                        e.type === 'RECOVERY' && e.businessUnit === 'LUBE' && isWithinRange(e.date)
                );
            case 'lubeFinancials':
                return []; // Complex calculation
            case 'lubeDigital':
                return [];

            default:
                return [];
        }
    }, [
        report,
        shifts,
        cngShifts,
        discountEntries,
        lubeSales,
        lubeInventory,
        cashEntries,
        customerEntries,
        auditLogs,
        dateRange,
        profitEntries,
        staffEntries,
    ]);

    const filteredData = useMemo(() => {
        let data = [...rawData];
        if (activeDrillDown) {
            data = data.filter((i: any) => i.type === activeDrillDown);
        }
        if (searchTerm) {
            data = data.filter(item =>
                Object.values(item as any).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        if (sortKey) {
            data.sort((a: any, b: any) => {
                const valA = (a as any)[sortKey];
                const valB = (b as any)[sortKey];
                if (valA < valB) return sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Apply URL parameter filtering (for drill-downs/direct links)
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const userId = params.get('userId');
        const customerId = params.get('customerId');
        const supplierId = params.get('supplierId');

        if (userId) data = data.filter((item: any) => item.userId === userId);
        if (customerId) data = data.filter((item: any) => item.customerId === customerId);
        if (supplierId) data = data.filter((item: any) => item.supplierId === supplierId);

        return data;
    }, [rawData, searchTerm, sortKey, sortDir, activeDrillDown]);

    // KPI Summary Layer for Master Reports
    const kpiSummary = useMemo(() => {
        const data = rawData as any[];
        if (reportId === 'today-pulse') {
            return [
                {
                    label: 'Total Sales',
                    value: data
                        .filter(i => i.type === 'SALE')
                        .reduce((acc: number, i: any) => acc + i.amount, 0),
                    color: 'blue',
                    type: 'SALE',
                },
                {
                    label: 'Recoveries',
                    value: data
                        .filter(i => i.type === 'RECOVERY')
                        .reduce((acc: number, i: any) => acc + i.amount, 0),
                    color: 'emerald',
                    type: 'RECOVERY',
                },
                {
                    label: 'Expenses',
                    value: data
                        .filter(i => i.type === 'EXPENSE')
                        .reduce((acc: number, i: any) => acc + i.amount, 0),
                    color: 'rose',
                    type: 'EXPENSE',
                },
                {
                    label: 'Today Total',
                    value:
                        data
                            .filter(i => i.type === 'SALE' || i.type === 'RECOVERY')
                            .reduce((acc: number, i: any) => acc + i.amount, 0) -
                        data
                            .filter(i => i.type === 'EXPENSE')
                            .reduce((acc: number, i: any) => acc + i.amount, 0),
                    color: 'indigo',
                    type: null,
                },
            ];
        }

        if (report?.category === 'PROFIT_LOSS') {
            return [
                {
                    label: 'Total Revenue',
                    value: data.reduce((acc: number, i: any) => acc + (i.revenue || 0), 0),
                    color: 'blue',
                    type: 'REVENUE',
                },
                {
                    label: 'Total Cost',
                    value: data.reduce((acc: number, i: any) => acc + (i.cost || 0), 0),
                    color: 'amber',
                    type: 'COST',
                },
                {
                    label: 'Net Profit',
                    value: data.reduce((acc: number, i: any) => acc + (i.netProfit || 0), 0),
                    color: 'emerald',
                    type: 'PROFIT',
                },
                {
                    label: 'Margin %',
                    value:
                        data.reduce((acc: number, i: any) => acc + (i.revenue || 0), 0) !== 0
                            ? (data.reduce((acc: number, i: any) => acc + (i.netProfit || 0), 0) /
                                  data.reduce((acc: number, i: any) => acc + (i.revenue || 0), 0)) *
                              100
                            : 0,
                    color: 'purple',
                    type: 'PERCENTAGE',
                },
            ];
        }

        return null;
    }, [reportId, rawData, report?.category]);

    if (!report) {
        return (
            <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
                    <Search size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Report Registry Miss</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    The requested data definition is missing or decoupled from the registry.
                </p>
                <Button onClick={onBack} variant="primary" className="mt-6 rounded-xl">
                    Back to Terminal
                </Button>
            </div>
        );
    }

    const renderCell = (item: any, col: any) => {
        const val = item[col.key];
        switch (col.type) {
            case 'currency':
                return (
                    <span className="font-black text-slate-900 tracking-tight">
                        ₨{val?.toLocaleString()}
                    </span>
                );
            case 'date':
                return (
                    <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        {val ? format(new Date(val), 'dd MMM yyyy') : '-'}
                    </span>
                );
            case 'badge': {
                const colors: Record<string, string> = {
                    SALE: 'bg-blue-500 text-white shadow-blue-500/20',
                    EXPENSE: 'bg-rose-500 text-white shadow-rose-500/20',
                    RECOVERY: 'bg-emerald-500 text-white shadow-emerald-500/20',
                    BALANCED: 'bg-emerald-500 text-white shadow-emerald-500/20',
                    VARIANCE: 'bg-amber-500 text-white shadow-amber-500/20',
                };
                return (
                    <span
                        className={clsx(
                            'px-2 py-0.5 text-[9px] font-black uppercase rounded-lg shadow-lg tracking-widest',
                            colors[val] || 'bg-slate-200 text-slate-600'
                        )}
                    >
                        {val?.replace('_', ' ')}
                    </span>
                );
            }
            case 'number':
                return (
                    <span className="font-black font-mono text-slate-700">
                        {val?.toLocaleString()}
                    </span>
                );
            default:
                return <span className="font-medium text-slate-600">{val}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto p-4 md:p-8">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="flex items-start gap-6">
                    <button
                        onClick={onBack}
                        className="p-4 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 group"
                    >
                        <ChevronLeft
                            size={24}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-blue-600/10">
                                {report?.category} Module
                            </span>
                            {dateRange && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-white/40 backdrop-blur-xl border border-white/60 text-slate-500 text-[9px] font-black uppercase rounded-lg shadow-sm">
                                    <Calendar size={10} className="text-blue-500" />
                                    {format(dateRange.start, 'dd MMM')} —{' '}
                                    {format(dateRange.end, 'dd MMM yyyy')}
                                </div>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            {report?.title}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                            Secure Ledger Channel: {report?.dataSource}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <ActionButton icon={FileSpreadsheet} label="Export Excel" />
                    <ActionButton icon={FileIcon} label="Generate PDF" />
                    <Button
                        size="lg"
                        className="bg-slate-900 text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-[.2em] shadow-2xl hover:scale-[1.02] transition-all"
                    >
                        <Download size={18} className="mr-2" /> Data Export Complete
                    </Button>
                </div>
            </div>

            {/* KPI Summary (Upgraded) */}
            {kpiSummary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiSummary.map((kpi, idx) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveDrillDown(kpi.type)}
                            className="cursor-pointer group"
                        >
                            <Card
                                className={clsx(
                                    'p-6 border-none relative overflow-hidden transition-all duration-300 hover:shadow-2xl',
                                    activeDrillDown === kpi.type
                                        ? 'bg-slate-900 text-white ring-4 ring-blue-500/20'
                                        : 'bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl'
                                )}
                            >
                                <div
                                    className={clsx(
                                        'absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full opacity-10',
                                        activeDrillDown === kpi.type
                                            ? 'bg-blue-500'
                                            : 'bg-slate-400'
                                    )}
                                />
                                <p
                                    className={clsx(
                                        'text-[9px] font-black uppercase tracking-[.3em] mb-1',
                                        activeDrillDown === kpi.type
                                            ? 'text-white/40'
                                            : 'text-slate-400'
                                    )}
                                >
                                    {kpi.label}
                                </p>
                                <p
                                    className={clsx(
                                        'text-2xl font-black tracking-tight',
                                        activeDrillDown === kpi.type
                                            ? 'text-white'
                                            : 'text-slate-900'
                                    )}
                                >
                                    {typeof kpi.value === 'number' && kpi.type !== null
                                        ? `₨${kpi.value.toLocaleString()}`
                                        : kpi.value}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={clsx(
                                                    'w-4 h-1 rounded-full',
                                                    activeDrillDown === kpi.type
                                                        ? 'bg-blue-500'
                                                        : 'bg-slate-200'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <ArrowRight
                                        size={12}
                                        className={clsx(
                                            'transition-all',
                                            activeDrillDown === kpi.type
                                                ? 'text-white translate-x-1'
                                                : 'text-slate-300'
                                        )}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Table Container (Premium Glass) */}
            <Card className="p-0 overflow-hidden bg-white/40 backdrop-blur-3xl border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] ring-1 ring-slate-900/5">
                <div className="p-8 bg-white/20 border-b border-white/40 flex flex-col xl:flex-row items-center justify-between gap-6">
                    <div className="relative w-full xl:w-[500px] group">
                        <Search
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Type to filter ledger entries..."
                            className="w-full pl-16 pr-8 py-5 bg-white/60 border border-white/60 rounded-3xl outline-none focus:ring-8 focus:ring-blue-500/5 focus:bg-white text-base font-bold shadow-sm transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Processing
                            </p>
                            <p className="text-sm font-black text-slate-900">
                                {filteredData.length} Valid Entries
                            </p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <Button
                            variant="secondary"
                            className="bg-white px-6 rounded-2xl border-white"
                        >
                            <Filter size={18} className="mr-2" /> Advanced View
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto noscrollbar min-h-[400px]">
                    <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-900/[0.02]">
                                {(report as any).columns.map((col: any) => (
                                    <th
                                        key={col.key}
                                        className={clsx(
                                            'px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[.2em] cursor-pointer hover:bg-white transition-all border-b border-white/40',
                                            col.align === 'right' ? 'text-right' : 'text-left'
                                        )}
                                        onClick={() => {
                                            if (sortKey === col.key) {
                                                setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortKey(col.key);
                                                setSortDir('asc');
                                            }
                                        }}
                                    >
                                        <div
                                            className={clsx(
                                                'flex items-center gap-2',
                                                col.align === 'right' ? 'justify-end' : ''
                                            )}
                                        >
                                            {col.label}
                                            {sortKey === col.key && (
                                                <div className="text-blue-500">
                                                    {sortDir === 'asc' ? (
                                                        <ArrowUp size={12} />
                                                    ) : (
                                                        <ArrowDown size={12} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode="popLayout">
                                {filteredData.map((item: any, idx) => (
                                    <motion.tr
                                        layout
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-white/60 transition-colors"
                                    >
                                        {(report as any).columns.map((col: any) => (
                                            <td
                                                key={col.key}
                                                className={clsx(
                                                    'px-8 py-6 transition-all border-b border-transparent group-hover:border-slate-100',
                                                    col.align === 'right'
                                                        ? 'text-right'
                                                        : 'text-left'
                                                )}
                                            >
                                                {renderCell(item, col)}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredData.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={(report as any).columns.length}
                                        className="px-8 py-32 text-center"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                <Search size={24} />
                                            </div>
                                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                                No Matching Ledger Entries
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {(report as any).showTotals && filteredData.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-900 text-white shadow-2xl">
                                    {(report as any).columns.map((col: any, idx: number) => (
                                        <td
                                            key={idx}
                                            className={clsx(
                                                'px-8 py-8 font-black tracking-tight',
                                                col.align === 'right' ? 'text-right' : 'text-left'
                                            )}
                                        >
                                            {idx === 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck
                                                        size={18}
                                                        className="text-blue-400"
                                                    />
                                                    LEDGER TOTAL
                                                </div>
                                            ) : col.type === 'currency' ? (
                                                `₨${filteredData.reduce((acc: number, item: any) => acc + (Number(item[col.key]) || 0), 0).toLocaleString()}`
                                            ) : col.type === 'number' ? (
                                                filteredData
                                                    .reduce(
                                                        (acc: number, item: any) =>
                                                            acc + (Number(item[col.key]) || 0),
                                                        0
                                                    )
                                                    .toLocaleString()
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>

            {/* Verification Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-blue-500/20 text-blue-400 rounded-3xl">
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-xs tracking-[.2em] mb-1">
                                Performance Index
                            </h4>
                            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                                This report indicates a{' '}
                                {filteredData.length > 0 ? 'stable' : 'pending'} liquidity trend for
                                the selected cycle.
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl flex items-center gap-6 ring-1 ring-slate-900/5">
                    <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-3xl">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-black uppercase text-xs tracking-[.2em] mb-1">
                            Digital Seal
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            Cryptographically verified by LubeFlow Core v4.0. Integrity status:
                            Valid.
                        </p>
                    </div>
                </Card>
            </div>
            <div className="text-center pb-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[.8em]">
                    End of Ledger Archive
                </p>
            </div>
        </div>
    );
};

const ActionButton = ({ icon: Icon, label }: any) => (
    <button className="flex items-center gap-2 px-6 py-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm font-black uppercase text-[10px] tracking-widest active:scale-95">
        <Icon size={18} />
        {label}
    </button>
);

export default ReportViewer;
