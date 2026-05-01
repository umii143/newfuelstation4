import type { ReportDefinition } from './ReportRegistry';

export const ENTERPRISE_REPORTS: ReportDefinition[] = [
    {
        id: 'ent-01',
        title: 'Unified P&L Statement (All Modules)',
        description: 'Unified P&L Statement (All Modules) covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-pnl',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-02',
        title: 'Unified Cash Flow Statement',
        description: 'Unified Cash Flow Statement covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-cashflow',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-03',
        title: 'Unified Balance Sheet',
        description: 'Unified Balance Sheet covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-balancesheet',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-04',
        title: 'Revenue by Business Unit Comparison',
        description: 'Revenue by Business Unit Comparison covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-revenue-compare',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-05',
        title: 'Unified Customer Ledger (All Modules)',
        description: 'Unified Customer Ledger (All Modules) covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-customer-ledger',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-06',
        title: 'Unified Expense Report (All Modules)',
        description: 'Unified Expense Report (All Modules) covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'ADMIN',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-expense',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
    {
        id: 'ent-07',
        title: 'Unified Audit Trail (All Modules)',
        description: 'Unified Audit Trail (All Modules) covering all transactions.',
        category: 'ENTERPRISE',
        module: 'ALL',
        requiredRole: 'OWNER',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: 'ent-audit',
        columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
    },
];
