/**
 * reportComputations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial & Analytical Computation Engine
 * 
 * Enterprise-grade precision mathematics for P&L, aging buckets, margin analysis,
 * and variance. Separated from UI and state to ensure pure, testable outputs.
 * 
 * Rules:
 * 1. Zero UI dependencies.
 * 2. Immutable inputs.
 * 3. Exact float rounding (currency standard).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface DateRange {
    start: Date;
    end: Date;
}

export interface AgingBucket {
    current: number; // 0-30 days
    days30: number;  // 31-60 days
    days60: number;  // 61-90 days
    days90: number;  // 90+ days
    total: number;
}

/**
 * Ensures a monetary float is strictly rounded to 2 decimal places.
 * Crucial for eliminating floating point drift in ledgers.
 */
export function strictCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
}

/**
 * Standard Gross Margin calculation.
 * Margin = (Revenue - COGS) / Revenue
 */
export function computeMargin(revenue: number, costOfGoodsSold: number): {
    grossProfit: number;
    marginPercentage: number;
} {
    const grossProfit = strictCurrency(revenue - costOfGoodsSold);
    const marginPercentage = revenue > 0 ? strictCurrency((grossProfit / revenue) * 100) : 0;
    
    return { grossProfit, marginPercentage };
}

/**
 * Unified Net Profit Calculation
 */
export function computePnL(revenue: number, cogs: number, operatingExpenses: number): {
    grossProfit: number;
    netProfit: number;
    netMargin: number;
} {
    const { grossProfit } = computeMargin(revenue, cogs);
    const netProfit = strictCurrency(grossProfit - operatingExpenses);
    const netMargin = revenue > 0 ? strictCurrency((netProfit / revenue) * 100) : 0;

    return { grossProfit, netProfit, netMargin };
}

/**
 * Date filtering helper, handles string or Date objects against a strict Range.
 */
export function isWithinRange(dateInput: string | Date, range?: DateRange): boolean {
    if (!range) return true;
    try {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return false; // Invalid date
        
        // Normalize range to start of day and end of day for precise inclusion
        const start = new Date(range.start);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(range.end);
        end.setHours(23, 59, 59, 999);
        
        return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
    } catch {
        return false;
    }
}

/**
 * Calculates AR/AP aging buckets based on a set of ledger entries.
 * Evaluates the difference between entry date and target 'asOf' date.
 */
export function computeAging(
    entries: Array<{ date: string; amount: number }>, 
    asOfDate: Date = new Date()
): AgingBucket {
    const buckets: AgingBucket = { current: 0, days30: 0, days60: 0, days90: 0, total: 0 };
    const asOfTime = asOfDate.getTime();

    entries.forEach(entry => {
        const entryTime = new Date(entry.date).getTime();
        const diffDays = Math.floor((asOfTime - entryTime) / (1000 * 60 * 60 * 24));
        const amt = entry.amount;

        if (diffDays <= 30) buckets.current += amt;
        else if (diffDays <= 60) buckets.days30 += amt;
        else if (diffDays <= 90) buckets.days60 += amt;
        else buckets.days90 += amt;

        buckets.total += amt;
    });

    // Rounding safety
    buckets.current = strictCurrency(buckets.current);
    buckets.days30 = strictCurrency(buckets.days30);
    buckets.days60 = strictCurrency(buckets.days60);
    buckets.days90 = strictCurrency(buckets.days90);
    buckets.total = strictCurrency(buckets.total);

    return buckets;
}
