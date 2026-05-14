import { ReportDefinition } from '@/pages/reports/ReportRegistry';

export interface AuditResult {
    status: 'VALID' | 'WARNING' | 'CRITICAL';
    score: number;
    issues: string[];
}

export const verifyReportData = (report: ReportDefinition, data: any[]): AuditResult => {
    let score = 100;
    const issues: string[] = [];

    if (!data || data.length === 0) {
        return { status: 'WARNING', score: 0, issues: ['No data available to audit.'] };
    }

    // 1. Data Structure Check
    const expectedKeys = report.columns?.map(c => c.key) || [];
    if (expectedKeys.length > 0) {
        const missingKeys = expectedKeys.filter(key => !(key in data[0]));
        if (missingKeys.length > 0) {
            score -= 20;
            issues.push(`Missing data fields: ${missingKeys.join(', ')}`);
        }
    }

    // 2. Financial Logic Check
    data.forEach((row, index) => {
        // If row has liters, rate, and amount, check if liters * rate == amount
        if ('liters' in row && 'rate' in row && 'amount' in row) {
            const expectedAmount = row.liters * row.rate;
            if (Math.abs(expectedAmount - row.amount) > 1) { // allow 1 unit rounding
                score -= 5;
                issues.push(`Row ${index + 1}: Amount mismatch. Expected ${expectedAmount.toFixed(2)}, got ${row.amount.toFixed(2)}`);
            }
        }
        
        // If row has price, quantity, and total, check if price * quantity == total
        if ('price' in row && 'quantity' in row && 'total' in row) {
            const expectedTotal = row.price * row.quantity;
            if (Math.abs(expectedTotal - row.total) > 1) {
                score -= 5;
                issues.push(`Row ${index + 1}: Total mismatch. Expected ${expectedTotal.toFixed(2)}, got ${row.total.toFixed(2)}`);
            }
        }

        // Negative values check on currency/quantity (unless explicitly a credit note)
        const keysToCheck = ['amount', 'total', 'revenue', 'liters', 'quantity'];
        keysToCheck.forEach(k => {
            if (k in row && typeof row[k] === 'number' && row[k] < 0) {
                // allow negative for specific types
                if (row.type !== 'Credit' && row.type !== 'Expense') {
                    score -= 2;
                    issues.push(`Row ${index + 1}: Negative value found in '${k}'.`);
                }
            }
        });
    });

    // Score cap
    if (score < 0) score = 0;

    let status: 'VALID' | 'WARNING' | 'CRITICAL' = 'VALID';
    if (score < 80) status = 'WARNING';
    if (score < 50) status = 'CRITICAL';

    return { status, score, issues: Array.from(new Set(issues)).slice(0, 5) }; // max 5 issues shown
};
