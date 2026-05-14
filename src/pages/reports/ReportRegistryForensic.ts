import { ShieldAlert, Fingerprint, AlertTriangle, TrendingDown } from 'lucide-react';
import type { ReportDefinition } from './ReportRegistry';

export const FORENSIC_REPORTS: ReportDefinition[] = [
    {
        id: 'fr-02-detailed',
        title: 'FR-02: Cash Shortage Critical Log',
        description: 'Detailed audit of shifts closing with >0.5% cash variance.',
        category: 'THEFT_FORENSIC',
        module: 'ALL',
        requiredRole: 'OWNER',
        icon: TrendingDown,
        dataSource: 'forensic-cash-shortage',
        showTotals: true,
        columns: [
            { key: 'triggeredAt', label: 'Detection Time', type: 'datetime' },
            { key: 'stationId', label: 'Unit', type: 'text' },
            { key: 'details', label: 'Forensic Details', type: 'text' },
            { key: 'expectedValue', label: 'Expected ₨', type: 'currency', align: 'right' },
            { key: 'actualValue', label: 'Actual ₨', type: 'currency', align: 'right' },
            { key: 'financialImpact', label: 'Loss Impact', type: 'currency', align: 'right' },
            { key: 'status', label: 'Status', type: 'badge' }
        ]
    },
    {
        id: 'fr-05-stock-adj',
        title: 'FR-05: Unauthorized Stock Adjustments',
        description: 'Forensic trail of manual inventory reductions outside of POS sales.',
        category: 'THEFT_FORENSIC',
        module: 'ALL',
        requiredRole: 'OWNER',
        icon: AlertTriangle,
        dataSource: 'forensic-stock-adjust',
        showTotals: true,
        columns: [
            { key: 'triggeredAt', label: 'Event Date', type: 'datetime' },
            { key: 'stationId', label: 'Station', type: 'text' },
            { key: 'details', label: 'Adjustment Note', type: 'text' },
            { key: 'actualValue', label: 'Qty Reduced', type: 'number', align: 'right' },
            { key: 'financialImpact', label: 'Value Leak', type: 'currency', align: 'right' },
            { key: 'triggeredByRecord', label: 'Staff ID', type: 'text' }
        ]
    },
    {
        id: 'fr-10-high-expense',
        title: 'FR-10: High-Value Expense Audit',
        description: 'Audit of expenses exceeding ₨10,000 threshold without proper documentation.',
        category: 'THEFT_FORENSIC',
        module: 'ALL',
        requiredRole: 'OWNER',
        icon: ShieldAlert,
        dataSource: 'forensic-high-expense',
        showTotals: true,
        columns: [
            { key: 'triggeredAt', label: 'Log Date', type: 'datetime' },
            { key: 'details', label: 'Expense Detail', type: 'text' },
            { key: 'actualValue', label: 'Amount ₨', type: 'currency', align: 'right' },
            { key: 'stationId', label: 'Location', type: 'text' },
            { key: 'status', label: 'Review Status', type: 'badge' }
        ]
    },
    {
        id: 'sec-unauth-access',
        title: 'Security: Unauthorized Access Log',
        description: 'Forensic log of failed login attempts or unauthorized route access.',
        category: 'AUDIT',
        module: 'ALL',
        requiredRole: 'OWNER',
        icon: Fingerprint,
        dataSource: 'security-access-log',
        columns: [
            { key: 'timestamp', label: 'Timestamp', type: 'datetime' },
            { key: 'userName', label: 'Identity', type: 'text' },
            { key: 'action', label: 'Attempted Action', type: 'badge' },
            { key: 'details', label: 'Trace Details', type: 'text' },
            { key: 'id', label: 'Forensic ID', type: 'text' }
        ]
    }
];
