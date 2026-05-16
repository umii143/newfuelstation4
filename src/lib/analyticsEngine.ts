import { useCNGStore } from '@/stores/cngStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useCashBankStore, useSupplierLedgerStore } from '@/stores/ledgerStore';
import { useStaffStore } from '@/stores/dataStores';
import { isWithinInterval, parseISO, startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns';

export type DateRangeFilter = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'CUSTOM';

export interface DateRange {
    startDate: string;
    endDate: string;
}

export const getDateRange = (filter: DateRangeFilter, customRange?: DateRange): DateRange => {
    const today = new Date();
    switch (filter) {
        case 'TODAY':
            return {
                startDate: startOfDay(today).toISOString(),
                endDate: endOfDay(today).toISOString()
            };
        case 'YESTERDAY': {
            const yesterday = subDays(today, 1);
            return {
                startDate: startOfDay(yesterday).toISOString(),
                endDate: endOfDay(yesterday).toISOString()
            };
        }
        case 'LAST_7_DAYS':
            return {
                startDate: startOfDay(subDays(today, 7)).toISOString(),
                endDate: endOfDay(today).toISOString()
            };
        case 'THIS_MONTH':
            return {
                startDate: startOfMonth(today).toISOString(),
                endDate: endOfDay(today).toISOString()
            };
        case 'CUSTOM':
            return customRange || {
                startDate: startOfDay(today).toISOString(),
                endDate: endOfDay(today).toISOString()
            };
    }
};

const isDateInRange = (dateString: string, range: DateRange) => {
    if (!dateString) return false;
    try {
        const date = parseISO(dateString);
        return isWithinInterval(date, {
            start: parseISO(range.startDate),
            end: parseISO(range.endDate)
        });
    } catch {
        return false;
    }
};

export const analyticsEngine = {
    // ============================================
    // FINANCIAL REPORTS
    // ============================================

    getProfitAndLoss: (range: DateRange) => {
        const fuelShifts = useFuelStore.getState().shifts.filter(s => isDateInRange(s.startTime, range));
        const cngShifts = useCNGStore.getState().shifts.filter(s => isDateInRange(s.startTime, range));
        // Lube sales - checking customer ledger for credit sales + cash/bank transactions for lube
        // But for simplicity, we aggregate from shifts
        
        let fuelRevenue = 0;
        let cngRevenue = 0;
        let totalExpenses = 0;
        let cngPurchases = 0;

        fuelShifts.forEach(shift => {
            fuelRevenue += shift.totalRevenue || 0;
            totalExpenses += shift.expenses || 0;
        });

        cngShifts.forEach(shift => {
            // Assuming cng shift has similar structure or we map it
            // cng store shifts may have different fields. Let's safely add:
            cngRevenue += (shift as any).totalAmount || (shift as any).totalRevenue || 0; 
            totalExpenses += (shift as any).totalExpense || 0;
        });

        // Supplier ledger for purchases
        const supplierEntries = useSupplierLedgerStore.getState().entries.filter(e => isDateInRange(e.date, range));
        const fuelPurchases = supplierEntries.filter(e => e.type === 'PURCHASE' && e.remarks?.toLowerCase().includes('fuel')).reduce((sum, e) => sum + e.credit, 0);
        
        cngPurchases = supplierEntries.filter(e => e.type === 'PURCHASE' && e.remarks?.toLowerCase().includes('cng')).reduce((sum, e) => sum + e.credit, 0);

        const totalRevenue = fuelRevenue + cngRevenue;
        const cogs = fuelPurchases + cngPurchases;
        const grossProfit = totalRevenue - cogs;
        const netProfit = grossProfit - totalExpenses;

        return {
            fuelRevenue,
            cngRevenue,
            totalRevenue,
            cogs,
            grossProfit,
            totalExpenses,
            netProfit,
            margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        };
    },

    getDailyCashFlow: (range: DateRange) => {
        const cbTransactions = (useCashBankStore.getState() as any).transactions?.filter((t: any) => isDateInRange(t.date, range)) || [];
        
        const cashIn = cbTransactions.filter((t: any) => t.type === 'DEPOSIT' || t.type === 'TRANSFER').reduce((acc: number, t: any) => acc + t.amount, 0);
        const cashOut = cbTransactions.filter((t: any) => t.type === 'WITHDRAWAL' || t.type === 'PAYMENT').reduce((acc: number, t: any) => acc + t.amount, 0);
        
        return { cashIn, cashOut, netFlow: cashIn - cashOut };
    },

    // ============================================
    // SALES REPORTS
    // ============================================

    getShiftWiseSales: (range: DateRange) => {
        const shifts = useFuelStore.getState().shifts.filter(s => isDateInRange(s.startTime, range));
        
        const operatorStats: Record<string, { count: number, revenue: number, variance: number }> = {};
        const shiftTypeStats = { MORNING: 0, AFTERNOON: 0, NIGHT: 0 };

        shifts.forEach(shift => {
            // Operator aggregation
            if (!operatorStats[shift.staffName]) {
                operatorStats[shift.staffName] = { count: 0, revenue: 0, variance: 0 };
            }
            operatorStats[shift.staffName].count += 1;
            operatorStats[shift.staffName].revenue += shift.totalRevenue || 0;
            operatorStats[shift.staffName].variance += shift.variance || 0;

            // Shift type aggregation
            if (shift.shiftType === 'MORNING') shiftTypeStats.MORNING += shift.totalRevenue || 0;
            if (shift.shiftType === 'EVENING') shiftTypeStats.AFTERNOON += shift.totalRevenue || 0;
            if (shift.shiftType === 'NIGHT') shiftTypeStats.NIGHT += shift.totalRevenue || 0;
        });

        return {
            totalShifts: shifts.length,
            operatorStats: Object.entries(operatorStats).map(([name, stats]) => ({ name, ...stats })),
            shiftTypeStats,
            records: shifts
        };
    },

    getHourlyPatternAnalysis: (range: DateRange) => {
        const shifts = useFuelStore.getState().shifts.filter(s => isDateInRange(s.startTime, range));
        
        // This is a simulated high-level hourly distribution since we don't have transaction-level timestamps for every nozzle sale
        // Distribute shift revenue across its hours
        const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: `${i.toString().padStart(2, '0')}:00`, volume: 0, revenue: 0 }));

        shifts.forEach(shift => {
            const startHour = parseISO(shift.startTime).getHours();
            const endHour = shift.endTime ? parseISO(shift.endTime).getHours() : new Date().getHours();
            
            const hoursDuration = Math.max(1, (endHour >= startHour ? endHour - startHour : (24 - startHour) + endHour));
            const hourlyVol = (shift.nozzleSales?.reduce((acc: number, sale: any) => acc + (sale.netSales || 0), 0) || 0) / hoursDuration;
            const hourlyRev = (shift.totalRevenue || 0) / hoursDuration;

            let currentHour = startHour;
            for (let i = 0; i < hoursDuration; i++) {
                hourlyData[currentHour].volume += hourlyVol;
                hourlyData[currentHour].revenue += hourlyRev;
                currentHour = (currentHour + 1) % 24;
            }
        });

        return hourlyData;
    },

    // ============================================
    // STAFF REPORTS
    // ============================================

    getOperatorPerformance: (range: DateRange) => {
        const shifts = useFuelStore.getState().shifts.filter(s => isDateInRange(s.startTime, range));
        const attendance = useStaffStore.getState().attendance.filter((a: any) => isDateInRange(a.date, range));

        const performance: Record<string, { totalRevenue: number, totalVariance: number, shiftsCount: number, absentDays: number }> = {};

        shifts.forEach(shift => {
            if (!performance[shift.staffId]) {
                performance[shift.staffId] = { totalRevenue: 0, totalVariance: 0, shiftsCount: 0, absentDays: 0 };
            }
            performance[shift.staffId].totalRevenue += shift.totalRevenue || 0;
            performance[shift.staffId].totalVariance += shift.variance || 0;
            performance[shift.staffId].shiftsCount += 1;
        });

        attendance.forEach((att: any) => {
            if (att.status === 'ABSENT' || att.status === 'LEAVE') {
               if (performance[att.staffId]) {
                   performance[att.staffId].absentDays += 1;
               } 
            }
        });

        return Object.entries(performance).map(([staffId, stats]) => {
            const staff = useStaffStore.getState().users.find((s: any) => s.userId === staffId);
            return {
                staffId,
                staffName: staff?.name || 'Unknown',
                ...stats,
                score: Math.max(0, 100 - Math.abs(stats.totalVariance / 1000) - (stats.absentDays * 5))
            };
        }).sort((a, b) => b.score - a.score);
    },

    // ============================================
    // EXPORT UTILITY
    // ============================================

    exportToCSV: (filename: string, data: any[]) => {
        if (!data || !data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const cell = row[header] === null || row[header] === undefined ? '' : row[header].toString();
                return `"${cell.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
