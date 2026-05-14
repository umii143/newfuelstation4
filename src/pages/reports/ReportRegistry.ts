import { LucideIcon } from 'lucide-react';
import type { ReportAccessTier } from '@/lib/roleHelpers';
import { CNG_REPORTS } from './ReportRegistryCNG';
import { LUBE_REPORTS } from './ReportRegistryLube';
import { ENTERPRISE_REPORTS } from './ReportRegistryEnterprise';
import { FORENSIC_REPORTS } from './ReportRegistryForensic';
import { COMPLIANCE_REPORTS } from './ReportRegistryCompliance';

export interface ReportColumn {
    key: string;
    label: string;
    type: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'datetime' | 'user' | 'boolean';
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}

export interface ReportDefinition {
    id: string;
    title: string;
    description: string;
    category: ReportCategory;
    columns: ReportColumn[];
    dataSource: string;
    showTotals?: boolean;
    drillDown?: boolean;
    icon?: LucideIcon;
    // === Phase 1 Enhancements (Enterprise Reporting Engine) ===
    /** Which business module owns this report. Defaults to 'FUEL' for backward compat. */
    module?: 'FUEL' | 'CNG' | 'LUBE' | 'ALL' | 'ENTERPRISE';
    /** Minimum RBAC tier required to view. Defaults to 'STAFF'. */
    requiredRole?: ReportAccessTier;
    /** Allowed export formats. Defaults to ['EXCEL']. */
    exportFormats?: ('EXCEL' | 'PDF' | 'CSV')[];
    /** Whether this report can be auto-scheduled for delivery. Defaults to false. */
    supportsSchedule?: boolean;
    /** Extra static params passed to the resolver (e.g., expense category filter). */
    resolverParams?: Record<string, any>;
}

export type ReportCategory =
    | 'SALES' | 'EXPENSE' | 'CREDIT' | 'INVENTORY' | 'FINANCIAL' | 'SHIFT'
    | 'PROFIT_LOSS' | 'VARIANCE' | 'DISCOUNT' | 'AUDIT' | 'STAFF'
    | 'THEFT_FORENSIC' | 'LOYALTY' | 'SUPPLIER' | 'COMPLIANCE' | 'CNG'
    // CNG Module Categories
    | 'CNG_FINANCIAL' | 'CNG_CUSTOMER' | 'CNG_SALES' | 'CNG_INVENTORY'
    | 'CNG_SUPPLIER' | 'CNG_EXPENSE' | 'CNG_AUDIT' | 'CNG_OPERATIONS'
    // Lube Module Categories
    | 'LUBE_FINANCIAL' | 'LUBE_CUSTOMER' | 'LUBE_SALES' | 'LUBE_INVENTORY'
    | 'LUBE_SUPPLIER' | 'LUBE_EXPENSE' | 'LUBE_AUDIT' | 'LUBE_OPERATIONS'
    // Enterprise Cross-Module
    | 'ENTERPRISE';

export const REPORT_CATEGORIES = [
    // Fuel Module (existing)
    { id: 'SALES', name: 'Sales & Revenue', module: 'FUEL' },
    { id: 'EXPENSE', name: 'Expenses & Payments', module: 'FUEL' },
    { id: 'CREDIT', name: 'Customers & Credit', module: 'FUEL' },
    { id: 'INVENTORY', name: 'Stock & Inventory', module: 'FUEL' },
    { id: 'FINANCIAL', name: 'Banking & Financials', module: 'FUEL' },
    { id: 'SHIFT', name: 'Shift & Settlement', module: 'FUEL' },
    { id: 'PROFIT_LOSS', name: 'Profitability Analysis', module: 'FUEL' },
    { id: 'VARIANCE', name: 'Variances & Discrepancies', module: 'FUEL' },
    { id: 'DISCOUNT', name: 'Discounts & Waivers', module: 'FUEL' },
    { id: 'AUDIT', name: 'System Audit Trail', module: 'FUEL' },
    { id: 'STAFF', name: 'Staff & Performance', module: 'FUEL' },
    { id: 'THEFT_FORENSIC', name: 'Theft & Forensics', module: 'FUEL' },
    { id: 'LOYALTY', name: 'Loyalty & Rewards', module: 'FUEL' },
    { id: 'SUPPLIER', name: 'Suppliers & Purchases', module: 'FUEL' },
    { id: 'COMPLIANCE', name: 'Compliance & Safety', module: 'FUEL' },
    { id: 'CNG', name: 'CNG Compression Operations', module: 'FUEL' },
    // CNG Module (8 categories)
    { id: 'CNG_FINANCIAL', name: 'Financial Reports', module: 'CNG' },
    { id: 'CNG_CUSTOMER', name: 'Customer Reports', module: 'CNG' },
    { id: 'CNG_SALES', name: 'Sales Reports', module: 'CNG' },
    { id: 'CNG_INVENTORY', name: 'Inventory Reports', module: 'CNG' },
    { id: 'CNG_SUPPLIER', name: 'Supplier Reports', module: 'CNG' },
    { id: 'CNG_EXPENSE', name: 'Expense Reports', module: 'CNG' },
    { id: 'CNG_AUDIT', name: 'Audit & Compliance', module: 'CNG' },
    { id: 'CNG_OPERATIONS', name: 'Operational Reports', module: 'CNG' },
    // Lube Module (8 categories)
    { id: 'LUBE_FINANCIAL', name: 'Financial Reports', module: 'LUBE' },
    { id: 'LUBE_CUSTOMER', name: 'Customer Reports', module: 'LUBE' },
    { id: 'LUBE_SALES', name: 'Sales Reports', module: 'LUBE' },
    { id: 'LUBE_INVENTORY', name: 'Inventory & Products', module: 'LUBE' },
    { id: 'LUBE_SUPPLIER', name: 'Supplier Reports', module: 'LUBE' },
    { id: 'LUBE_EXPENSE', name: 'Expense Reports', module: 'LUBE' },
    { id: 'LUBE_AUDIT', name: 'Audit & Compliance', module: 'LUBE' },
    { id: 'LUBE_OPERATIONS', name: 'Operational Reports', module: 'LUBE' },
    // Enterprise Cross-Module (Admin only)
    { id: 'ENTERPRISE', name: 'Enterprise / Cross-Module', module: 'ENTERPRISE' },
];

const FUEL_REPORTS: ReportDefinition[] = [
    {
        id: 'sales-001',
        title: 'Detailed Sales Transaction Table',
        description: 'Complete list of nozzle-wise sales records across all shifts',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftNumber', label: 'Shift', type: 'number' },
            { key: 'nozzleName', label: 'Nozzle', type: 'text' },
            { key: 'fuelType', label: 'Fuel Type', type: 'badge' },
            { key: 'liters', label: 'Liters', type: 'number', align: 'right' },
            { key: 'rate', label: 'Rate', type: 'currency', align: 'right' },
            { key: 'revenue', label: 'Amount', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Staff', type: 'text' }
        ],
        dataSource: 'shiftSales', showTotals: true, drillDown: true
    },
    {
        id: 'sales-002',
        title: 'Hourly Sales Pattern',
        description: 'Analysis of sales volume and revenue by hour',
        category: 'SALES',
        columns: [
            { key: 'hour', label: 'Hour', type: 'text' },
            { key: 'pmsLiters', label: 'Petrol (L)', type: 'number', align: 'right' },
            { key: 'agoLiters', label: 'Diesel (L)', type: 'number', align: 'right' },
            { key: 'totalRevenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'transactions', label: 'Tx Count', type: 'number', align: 'center' }
        ],
        dataSource: 'hourlySales', showTotals: true
    },
    {
        id: 'sales-003',
        title: 'Fuel Type Performance',
        description: 'Comparison of performance across different fuel types',
        category: 'SALES',
        columns: [
            { key: 'fuelType', label: 'Fuel Type', type: 'badge' },
            { key: 'volume', label: 'Quantity (L)', type: 'number', align: 'right' },
            { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'margin', label: 'Est. Margin', type: 'currency', align: 'right' },
            { key: 'share', label: 'Volume Share %', type: 'text', align: 'right' }
        ],
        dataSource: 'fuelPerformance'
    },
    {
        id: 'sales-004',
        title: 'Daily Sales Summary',
        description: 'Day-by-day revenue, volume, and transaction count breakdown',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'totalLiters', label: 'Total Vol (L)', type: 'number', align: 'right' },
            { key: 'totalRevenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'avgRate', label: 'Avg Rate', type: 'currency', align: 'right' },
            { key: 'shiftsCount', label: 'Shifts', type: 'number', align: 'center' }
        ],
        dataSource: 'dailySalesSummary', showTotals: true
    },
    {
        id: 'sales-005',
        title: 'Weekly Comparison',
        description: 'Compare this week vs last week',
        category: 'SALES',
        columns: [
            { key: 'day', label: 'Day', type: 'text' },
            { key: 'thisWeekRev', label: 'This Week', type: 'currency', align: 'right' },
            { key: 'lastWeekRev', label: 'Last Week', type: 'currency', align: 'right' },
            { key: 'change', label: 'Change %', type: 'badge', align: 'right' },
            { key: 'thisWeekVol', label: 'Vol (This)', type: 'number', align: 'right' },
            { key: 'lastWeekVol', label: 'Vol (Last)', type: 'number', align: 'right' }
        ],
        dataSource: 'weeklyComparison'
    },
    {
        id: 'sales-006',
        title: 'Monthly Revenue Trend',
        description: '12-month rolling revenue analysis',
        category: 'SALES',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'volume', label: 'Volume (L)', type: 'number', align: 'right' },
            { key: 'avgDaily', label: 'Avg Daily', type: 'currency', align: 'right' },
            { key: 'growth', label: 'Growth %', type: 'badge', align: 'right' }
        ],
        dataSource: 'monthlyRevTrend', showTotals: true
    },
    {
        id: 'sales-007',
        title: 'Salesman-Wise Breakdown',
        description: 'Individual salesman performance',
        category: 'SALES',
        columns: [
            { key: 'staffName', label: 'Salesman', type: 'user' },
            { key: 'totalShifts', label: 'Shifts', type: 'number', align: 'center' },
            { key: 'totalLiters', label: 'Volume (L)', type: 'number', align: 'right' },
            { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'avgPerShift', label: 'Avg/Shift', type: 'currency', align: 'right' },
            { key: 'variance', label: 'Variance', type: 'currency', align: 'right' },
            { key: 'rating', label: 'Rating', type: 'badge' }
        ],
        dataSource: 'salesmanWise', showTotals: true, drillDown: true
    },
    {
        id: 'sales-008',
        title: 'Cash vs Credit Split',
        description: 'Revenue by payment method',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'cashSales', label: 'Cash Sales', type: 'currency', align: 'right' },
            { key: 'creditSales', label: 'Credit Sales', type: 'currency', align: 'right' },
            { key: 'digitalSales', label: 'Digital', type: 'currency', align: 'right' },
            { key: 'totalSales', label: 'Total', type: 'currency', align: 'right' },
            { key: 'creditPercent', label: 'Credit %', type: 'text', align: 'right' }
        ],
        dataSource: 'cashVsCredit', showTotals: true
    },
    {
        id: 'sales-009',
        title: 'Digital Wallets Sales (JazzCash/Easypaisa)',
        description: 'Breakdown of digital wallet transactions',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'jazzCash', label: 'JazzCash', type: 'currency', align: 'right' },
            { key: 'easypaisa', label: 'Easypaisa', type: 'currency', align: 'right' },
            { key: 'pos', label: 'POS Terminal', type: 'currency', align: 'right' },
            { key: 'totalDigital', label: 'Total Digital', type: 'currency', align: 'right' }
        ],
        dataSource: 'digitalWalletSales', showTotals: true
    },
    {
        id: 'sales-010',
        title: 'Gross Profit per Liter Matrix',
        description: 'Calculated margin capture per transaction class',
        category: 'SALES',
        columns: [
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'salePrice', label: 'Sale Rate', type: 'currency', align: 'right' },
            { key: 'costPrice', label: 'Cost Rate', type: 'currency', align: 'right' },
            { key: 'marginLiter', label: 'Margin/L', type: 'currency', align: 'right' },
            { key: 'volumeSold', label: 'Vol Sold', type: 'number', align: 'right' },
            { key: 'totalProfit', label: 'Total Profit', type: 'currency', align: 'right' }
        ],
        dataSource: 'grossProfitMargin', showTotals: true
    },
    {
        id: 'sales-011',
        title: 'Dispenser Flow Efficiency',
        description: 'Speed of delivery diagnostics',
        category: 'SALES',
        columns: [
            { key: 'nozzleName', label: 'Dispenser', type: 'text' },
            { key: 'avgFlowRate', label: 'Speed (L/min)', type: 'number', align: 'right' },
            { key: 'slowFlowAlerts', label: 'Slow Alerts', type: 'number', align: 'center' },
            { key: 'filterStatus', label: 'Filter Health', type: 'badge' }
        ],
        dataSource: 'flowEfficiency'
    },
    {
        id: 'sales-012',
        title: 'Shift Type Revenue Comparison',
        description: 'Compare Morning vs Evening vs Night revenue',
        category: 'SALES',
        columns: [
            { key: 'shiftType', label: 'Shift Type', type: 'badge' },
            { key: 'totalShifts', label: 'Count', type: 'number', align: 'center' },
            { key: 'totalRevenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'averageRevenue', label: 'Avg Rev/Shift', type: 'currency', align: 'right' },
            { key: 'highestRevenue', label: 'Max Rev/Shift', type: 'currency', align: 'right' }
        ],
        dataSource: 'shiftTypeComparison', showTotals: true
    },
    {
        id: 'sales-013',
        title: 'Discounts Issued by Shift',
        description: 'Monetary discounts granted to customers',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftNumber', label: 'Shift Number', type: 'number', align: 'center' },
            { key: 'customerName', label: 'Customer', type: 'text' },
            { key: 'amount', label: 'Discount', type: 'currency', align: 'right' },
            { key: 'reason', label: 'Reason', type: 'text' },
            { key: 'approvedBy', label: 'Approved By', type: 'user' }
        ],
        dataSource: 'discountsIssued', showTotals: true
    },
    {
        id: 'sales-014',
        title: 'Zero-Sale Shifts Log',
        description: 'Shifts generating absolutely 0 revenue',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'shiftType', label: 'Shift Type', type: 'badge' },
            { key: 'status', label: 'Status', type: 'badge' }
        ],
        dataSource: 'zeroSalesLog'
    },
    {
        id: 'sales-015',
        title: 'Average Transaction Size',
        description: 'Averages measured in liters and rupees',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'avgLiters', label: 'Avg Liters', type: 'number', align: 'right' },
            { key: 'avgRupees', label: 'Avg Value', type: 'currency', align: 'right' }
        ],
        dataSource: 'avgTransactionSize'
    },
    {
        id: 'sales-016',
        title: 'Unusual Sales Activity (Spikes)',
        description: 'Massive deviations from rolling averages',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftId', label: 'Shift', type: 'text' },
            { key: 'deviationPercent', label: 'Dev. %', type: 'badge', align: 'right' },
            { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' }
        ],
        dataSource: 'unusualSales'
    },
    {
        id: 'sales-017',
        title: 'Pre-rate Change Flash Sales',
        description: 'Sales volume spikes an hour before price adjustments',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Event Date', type: 'date' },
            { key: 'timeWindow', label: 'Time Window', type: 'text' },
            { key: 'litersSold', label: 'Liters Sold', type: 'number', align: 'right' },
            { key: 'normalAverage', label: 'Normal Baseline', type: 'number', align: 'right' },
            { key: 'variance', label: 'Variance %', type: 'badge', align: 'right' }
        ],
        dataSource: 'preRateChangeSales'
    },
    {
        id: 'sales-018',
        title: 'Lube Product Sales Summary',
        description: 'Lubricants and retail items sold during shifts',
        category: 'SALES',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'productName', label: 'Product', type: 'text' },
            { key: 'quantity', label: 'Qty Sold', type: 'number', align: 'right' },
            { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
            { key: 'profit', label: 'Profit', type: 'currency', align: 'right' }
        ],
        dataSource: 'lubeProductSales', showTotals: true
    },
    {
        id: 'sales-019',
        title: 'Credit Customer Top Purchasers',
        description: 'Rank of credit customers by volume',
        category: 'SALES',
        columns: [
            { key: 'rank', label: 'Rank', type: 'number', align: 'center' },
            { key: 'customerName', label: 'Customer', type: 'user' },
            { key: 'totalLiters', label: 'Liters Bought', type: 'number', align: 'right' },
            { key: 'totalValue', label: 'Gross Value', type: 'currency', align: 'right' },
            { key: 'paymentStatus', label: 'Standing', type: 'badge' }
        ],
        dataSource: 'topCreditPurchasers'
    },
    {
        id: 'sales-020',
        title: 'Sales Ledger Export (Complete)',
        description: 'Master flatten mapping of every line item',
        category: 'SALES',
        columns: [
            { key: 'timestamp', label: 'Timestamp', type: 'datetime' },
            { key: 'type', label: 'Record Type', type: 'badge' },
            { key: 'staffName', label: 'Operator', type: 'user' },
            { key: 'liters', label: 'Liters', type: 'number', align: 'right' },
            { key: 'amount', label: 'Amount', type: 'currency', align: 'right' }
        ],
        dataSource: 'masterSalesLedger', showTotals: true, drillDown: true
    },
    {
        id: 'shift-001',
        title: 'Shift Closing Ledger',
        description: 'Complete record of every closed shift',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftType', label: 'Shift', type: 'badge' },
            { key: 'staffName', label: 'Manager', type: 'user' },
            { key: 'totalRevenue', label: 'Sales', type: 'currency', align: 'right' },
            { key: 'expectedCash', label: 'Expected', type: 'currency', align: 'right' },
            { key: 'actualCash', label: 'Actual', type: 'currency', align: 'right' },
            { key: 'variance', label: 'Variance', type: 'currency', align: 'right' }
        ],
        dataSource: 'shiftLedger', showTotals: true, drillDown: true
    },
    {
        id: 'shift-002',
        title: 'Shortage & Overage Analytics',
        description: 'Daily deviations in expected cash',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftId', label: 'ID', type: 'text' },
            { key: 'staffName', label: 'Cashier', type: 'user' },
            { key: 'expectedCash', label: 'Sys Target', type: 'currency', align: 'right' },
            { key: 'variance', label: 'Deviation', type: 'currency', align: 'right' },
            { key: 'status', label: 'Settlement', type: 'badge' }
        ],
        dataSource: 'shiftVariances', drillDown: true
    },
    {
        id: 'shift-003',
        title: 'Shift Duration / Time Tracker',
        description: 'Exact opening and closing timestamps',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'startTime', label: 'Opened At', type: 'datetime' },
            { key: 'closedAt', label: 'Closed At', type: 'datetime' },
            { key: 'durationMins', label: 'Mins Active', type: 'number', align: 'right' }
        ],
        dataSource: 'shiftTimes'
    },
    {
        id: 'shift-004',
        title: 'Staff Expense Deductions in Shift',
        description: 'Petty cash consumed out of shift till',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'category', label: 'Expense Category', type: 'badge' },
            { key: 'amount', label: 'Amount Taken', type: 'currency', align: 'right' },
            { key: 'note', label: 'Reason', type: 'text' }
        ],
        dataSource: 'shiftExpenses', showTotals: true
    },
    {
        id: 'shift-005',
        title: 'Shift Bank Deposits Log',
        description: 'Direct from-shift banking transactions',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'bankName', label: 'Bank Name', type: 'text' },
            { key: 'depositSlipNumber', label: 'Slip/Ref #', type: 'text' },
            { key: 'amount', label: 'Deposited', type: 'currency', align: 'right' }
        ],
        dataSource: 'shiftDeposits', showTotals: true
    },
    {
        id: 'shift-006',
        title: 'Supplier Payments from Till',
        description: 'Direct cash handed to suppliers during shift',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'supplierName', label: 'Supplier', type: 'user' },
            { key: 'amount', label: 'Paid Cash', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Authorized By', type: 'user' }
        ],
        dataSource: 'shiftSupplierPayments', showTotals: true
    },
    {
        id: 'shift-007',
        title: 'Customer Recoveries during Shift',
        description: 'Cash collected covering old credit accounts',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'customerName', label: 'Khata Holder', type: 'user' },
            { key: 'amount', label: 'Recovered', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Receiver', type: 'user' }
        ],
        dataSource: 'shiftRecoveries', showTotals: true
    },
    {
        id: 'shift-008',
        title: 'New Credits Issued in Shift',
        description: 'Value of fuel given on credit',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'customerName', label: 'Khata Holder', type: 'user' },
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'liters', label: 'Volume', type: 'number', align: 'right' },
            { key: 'amount', label: 'Debt Added', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Issued By', type: 'user' }
        ],
        dataSource: 'shiftCredits', showTotals: true
    },
    {
        id: 'shift-009',
        title: 'Testing Liters (Measure Tool) Log',
        description: 'Record of liters wasted for calibration testing',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'nozzleName', label: 'Nozzle', type: 'text' },
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'testLiters', label: 'Test Vol (L)', type: 'number', align: 'right' },
            { key: 'amountWaved', label: 'Value Waved', type: 'currency', align: 'right' }
        ],
        dataSource: 'shiftTestLiters', showTotals: true
    },
    {
        id: 'shift-010',
        title: 'Outstanding Shifts (Open/Pending)',
        description: 'Shifts currently active or abandoned',
        category: 'SHIFT',
        columns: [
            { key: 'shiftId', label: 'Shift ID', type: 'text' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'startTime', label: 'Opened At', type: 'datetime' },
            { key: 'status', label: 'State', type: 'badge' }
        ],
        dataSource: 'openShifts'
    },
    {
        id: 'shift-011',
        title: 'Voided/Cancelled Transactions',
        description: 'Records stripped during closing phase',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'type', label: 'Original Type', type: 'badge' },
            { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
            { key: 'voidedBy', label: 'Voided By', type: 'user' }
        ],
        dataSource: 'voidedTransactions'
    },
    {
        id: 'shift-012',
        title: 'Shift Notes & Overrides',
        description: 'Manual text overrides injected by staff',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Staff', type: 'user' },
            { key: 'notes', label: 'Manual Note', type: 'text' }
        ],
        dataSource: 'shiftNotes'
    },
    {
        id: 'shift-013',
        title: 'Manager Approvals',
        description: 'Actions explicitly approved beyond limit',
        category: 'SHIFT',
        columns: [
            { key: 'timestamp', label: 'Time', type: 'datetime' },
            { key: 'action', label: 'Action', type: 'text' },
            { key: 'managerName', label: 'Admin', type: 'user' }
        ],
        dataSource: 'shiftManagerApprovals'
    },
    {
        id: 'shift-014',
        title: 'Total Deductions Breakdown',
        description: 'Total slice of cash vanished from till per shift',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftId', label: 'Shift', type: 'text' },
            { key: 'expenses', label: 'Exp.', type: 'currency', align: 'right' },
            { key: 'credits', label: 'Cred.', type: 'currency', align: 'right' },
            { key: 'bankDrop', label: 'Bank', type: 'currency', align: 'right' },
            { key: 'digital', label: 'Digital', type: 'currency', align: 'right' },
            { key: 'totalDeducted', label: 'Sum', type: 'currency', align: 'right' }
        ],
        dataSource: 'shiftTotalDeductions', showTotals: true
    },
    {
        id: 'shift-015',
        title: 'Unbalanced Shifts Register',
        description: 'Strict listing of any shift closing != zero variance',
        category: 'SHIFT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Cashier', type: 'user' },
            { key: 'expectedCash', label: 'Target', type: 'currency', align: 'right' },
            { key: 'actualCash', label: 'Actual', type: 'currency', align: 'right' },
            { key: 'variance', label: 'Loss/Gain', type: 'badge', align: 'right' }
        ],
        dataSource: 'unbalancedShifts', drillDown: true
    },
    {
        id: 'inv-001',
        title: 'Current Stock Valuation',
        description: 'Live tank capacities vs economic value',
        category: 'INVENTORY',
        columns: [
            { key: 'productName', label: 'Tank/Asset', type: 'text' },
            { key: 'fuelType', label: 'Product', type: 'badge' },
            { key: 'quantity', label: 'Real Volume', type: 'number', align: 'right' },
            { key: 'costPrice', label: 'Unit Cost', type: 'currency', align: 'right' },
            { key: 'retailPrice', label: 'Unit Sale', type: 'currency', align: 'right' },
            { key: 'costValue', label: 'Asset Worth', type: 'currency', align: 'right' },
            { key: 'retailValue', label: 'Retail Value', type: 'currency', align: 'right' },
            { key: 'potentialProfit', label: 'Extracted Margin', type: 'currency', align: 'right' }
        ],
        dataSource: 'stockValuation', showTotals: true, drillDown: true
    },
    {
        id: 'inv-002',
        title: 'Decanting/Receiving Log',
        description: 'Fuel bulk additions into tanks',
        category: 'INVENTORY',
        columns: [
            { key: 'date', label: 'Received On', type: 'datetime' },
            { key: 'productName', label: 'Product', type: 'badge' },
            { key: 'qtyAdded', label: 'Vol Added (L)', type: 'number', align: 'right' },
            { key: 'provider', label: 'Provider', type: 'text' },
            { key: 'costVal', label: 'Cost Injected', type: 'currency', align: 'right' }
        ],
        dataSource: 'decantingLog', showTotals: true
    },
    {
        id: 'inv-003',
        title: 'Tank Capacity Utilization',
        description: 'Available headroom vs stored liquid',
        category: 'INVENTORY',
        columns: [
            { key: 'tankName', label: 'Tank', type: 'text' },
            { key: 'capacity', label: 'Max Capacity', type: 'number', align: 'right' },
            { key: 'currentLevel', label: 'Current Level', type: 'number', align: 'right' },
            { key: 'utilizationPercent', label: 'Fill %', type: 'badge', align: 'right' },
            { key: 'ullage', label: 'Headroom (L)', type: 'number', align: 'right' }
        ],
        dataSource: 'tankUtilization'
    },
    {
        id: 'inv-004',
        title: 'Rate Change Paper-Profit Impact',
        description: 'Gain/Loss incurred strictly off rate adjustment',
        category: 'INVENTORY',
        columns: [
            { key: 'date', label: 'Event Time', type: 'datetime' },
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'oldRate', label: 'Old Rate', type: 'currency', align: 'right' },
            { key: 'newRate', label: 'New Rate', type: 'currency', align: 'right' },
            { key: 'stockAtChange', label: 'In-Tank (L)', type: 'number', align: 'right' },
            { key: 'paperImpact', label: 'Profit/Loss', type: 'badge', align: 'right' }
        ],
        dataSource: 'rateChangeImpacts'
    },
    {
        id: 'inv-005',
        title: 'Dead Stock / Non-Moving Assets',
        description: 'Lube inventory zero sales > 30 days',
        category: 'INVENTORY',
        columns: [
            { key: 'productName', label: 'Product', type: 'text' },
            { key: 'category', label: 'Class', type: 'badge' },
            { key: 'daysStagnant', label: 'Days Idling', type: 'number', align: 'center' },
            { key: 'lockedValue', label: 'Cash Locked', type: 'currency', align: 'right' }
        ],
        dataSource: 'deadStock'
    },
    {
        id: 'inv-006',
        title: 'Stock Recon (System vs Physical)',
        description: 'Audits comparing POS expectations against dip readings',
        category: 'INVENTORY',
        columns: [
            { key: 'date', label: 'Audit Date', type: 'date' },
            { key: 'tankName', label: 'Tank', type: 'text' },
            { key: 'systemLiters', label: 'Sys Expect', type: 'number', align: 'right' },
            { key: 'dipLiters', label: 'Physical Dip', type: 'number', align: 'right' },
            { key: 'variance', label: 'Evap/Loss', type: 'badge', align: 'right' }
        ],
        dataSource: 'stockRecon'
    },
    {
        id: 'inv-007',
        title: 'Low Stock Danger Alerts',
        description: 'Tanks operating below safe thresholds',
        category: 'INVENTORY',
        columns: [
            { key: 'tankName', label: 'Tank', type: 'text' },
            { key: 'currentLevel', label: 'Level (L)', type: 'number', align: 'right' },
            { key: 'criticalThreshold', label: 'Min Reorder', type: 'number', align: 'right' },
            { key: 'status', label: 'Status', type: 'badge' }
        ],
        dataSource: 'lowStockAlerts'
    },
    {
        id: 'inv-008',
        title: 'Evaporation / Temperature Loss',
        description: 'Volume reduction algorithms',
        category: 'INVENTORY',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'tankName', label: 'Tank', type: 'text' },
            { key: 'volLoss', label: 'Loss (L)', type: 'number', align: 'right' },
            { key: 'cashValue', label: 'Loss Value', type: 'currency', align: 'right' }
        ],
        dataSource: 'evaporationLoss'
    },
    {
        id: 'inv-009',
        title: 'Stock Turns',
        description: 'Velocity of tank empties',
        category: 'INVENTORY',
        columns: [
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'avgDailySale', label: 'Avg Sale/Day', type: 'number', align: 'right' },
            { key: 'tankSize', label: 'Capacity', type: 'number', align: 'right' },
            { key: 'turnDays', label: 'Turnover (Days)', type: 'number', align: 'center' }
        ],
        dataSource: 'stockTurns'
    },
    {
        id: 'inv-010',
        title: 'Carriage/Freight Overhead',
        description: 'Karaya expenses injected into inventory cost',
        category: 'INVENTORY',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Invoice', type: 'text' },
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'carriageCost', label: 'Freight (Rs)', type: 'currency', align: 'right' }
        ],
        dataSource: 'carriageOverhead', showTotals: true
    },
    {
        id: 'cred-001',
        title: 'Complete Aging Buckets',
        description: 'Risk segmentation spanning 30/60/90 days',
        category: 'CREDIT',
        columns: [
            { key: 'customerName', label: 'Customer', type: 'user' },
            { key: 'current', label: '< 30 Days', type: 'currency', align: 'right' },
            { key: 'days30', label: '30-60 Days', type: 'currency', align: 'right' },
            { key: 'days60', label: '60-90 Days', type: 'currency', align: 'right' },
            { key: 'days90', label: '90+ Days', type: 'badge', align: 'right' },
            { key: 'total', label: 'Total Exposure', type: 'currency', align: 'right' }
        ],
        dataSource: 'customerAgingBuckets', showTotals: true
    },
    {
        id: 'cred-002',
        title: 'Customer Ledger Master',
        description: 'Every single line item debited/credited',
        category: 'CREDIT',
        columns: [
            { key: 'date', label: 'Date', type: 'datetime' },
            { key: 'customerName', label: 'Customer', type: 'user' },
            { key: 'type', label: 'Transaction', type: 'badge' },
            { key: 'reference', label: 'Reference', type: 'text' },
            { key: 'debit', label: 'Got Fuel', type: 'currency', align: 'right' },
            { key: 'credit', label: 'Paid Cash', type: 'currency', align: 'right' },
            { key: 'balance', label: 'Running Bal', type: 'currency', align: 'right' }
        ],
        dataSource: 'customerLedgerMaster', showTotals: true, drillDown: true
    },
    {
        id: 'cred-003',
        title: 'Limits Exceeded Violations',
        description: 'Accounts dispensing fuel beyond their lockdown threshold',
        category: 'CREDIT',
        columns: [
            { key: 'customerName', label: 'Customer', type: 'user' },
            { key: 'limit', label: 'Max Limit', type: 'currency', align: 'right' },
            { key: 'balance', label: 'Owed Now', type: 'badge', align: 'right' },
            { key: 'overdraw', label: 'Exceeded By', type: 'currency', align: 'right' }
        ],
        dataSource: 'creditLimitViolations'
    },
    {
        id: 'cred-004',
        title: 'Monthly Recovery Collection',
        description: 'Total debt recouped categorized by month',
        category: 'CREDIT',
        columns: [
            { key: 'month', label: 'Period', type: 'text' },
            { key: 'amountRecovered', label: 'Recovered Cash', type: 'currency', align: 'right' },
            { key: 'transactions', label: 'Count', type: 'number', align: 'center' }
        ],
        dataSource: 'monthlyRecovery', showTotals: true
    },
    {
        id: 'cred-005',
        title: 'Zero Recovery Accounts',
        description: 'Clients have not paid in over 60 days',
        category: 'CREDIT',
        columns: [
            { key: 'customerName', label: 'Defaulter', type: 'user' },
            { key: 'lastPayment', label: 'Last Paid', type: 'date' },
            { key: 'daysSince', label: 'Days Past', type: 'number', align: 'center' },
            { key: 'balance', label: 'Money Trap', type: 'badge', align: 'right' }
        ],
        dataSource: 'zeroRecoveryAccounts'
    },
    {
        id: 'cred-006',
        title: 'Top 20 Debtors',
        description: 'Maximum capital locks currently owed',
        category: 'CREDIT',
        columns: [
            { key: 'rank', label: 'Rank', type: 'number', align: 'center' },
            { key: 'customerName', label: 'Debtor', type: 'user' },
            { key: 'balance', label: 'Outstanding', type: 'currency', align: 'right' },
            { key: 'risk', label: 'Risk', type: 'badge' }
        ],
        dataSource: 'topDebtors', showTotals: true
    },
    {
        id: 'cred-007',
        title: 'Credit Volume Share',
        description: 'How much of station liters are leaving via credit?',
        category: 'CREDIT',
        columns: [
            { key: 'fuelType', label: 'Fuel', type: 'badge' },
            { key: 'totalLiters', label: 'Total Liters', type: 'number', align: 'right' },
            { key: 'creditLiters', label: 'Credit Liters', type: 'number', align: 'right' },
            { key: 'sharePercent', label: '% on Credit', type: 'text', align: 'right' }
        ],
        dataSource: 'creditVolumeShare'
    },
    {
        id: 'cred-008',
        title: 'New Khata Approvals',
        description: 'Recently boarded credit clients',
        category: 'CREDIT',
        columns: [
            { key: 'date', label: 'Joined', type: 'date' },
            { key: 'customerName', label: 'Client', type: 'user' },
            { key: 'limit', label: 'Approved Limit', type: 'currency', align: 'right' }
        ],
        dataSource: 'newCustomers'
    },
    {
        id: 'cred-009',
        title: 'Bad Debt Write-offs',
        description: 'Accounts forcefully written off as loss',
        category: 'CREDIT',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'customerName', label: 'Account', type: 'user' },
            { key: 'amountWiped', label: 'Loss Taken', type: 'currency', align: 'right' },
            { key: 'admin', label: 'Approver', type: 'user' }
        ],
        dataSource: 'badDebt', showTotals: true
    },
    {
        id: 'cred-010',
        title: 'Credit Interest/Penalty Applied',
        description: 'Finance charges generated over late payouts',
        category: 'CREDIT',
        columns: [
            { key: 'date', label: 'Applied On', type: 'date' },
            { key: 'customerName', label: 'Client', type: 'user' },
            { key: 'penaltyAmt', label: 'Charge', type: 'currency', align: 'right' }
        ],
        dataSource: 'creditPenalties', showTotals: true
    },
    {
        id: 'sup-001',
        title: 'Outstanding Payables Registry',
        description: 'Live mapping of who the station owes money to',
        category: 'SUPPLIER',
        columns: [
            { key: 'supplierName', label: 'Vendor/OMC', type: 'text' },
            { key: 'totalPurchases', label: 'Lifetime Buy', type: 'currency', align: 'right' },
            { key: 'totalPayments', label: 'Lifetime Paid', type: 'currency', align: 'right' },
            { key: 'currentPayable', label: 'Owed Now', type: 'badge', align: 'right' },
            { key: 'status', label: 'Status', type: 'badge' }
        ],
        dataSource: 'supplierBalanceSummary', showTotals: true
    },
    {
        id: 'sup-002',
        title: 'Payment Remittances',
        description: 'History of cash wired/given to suppliers',
        category: 'SUPPLIER',
        columns: [
            { key: 'date', label: 'Date', type: 'datetime' },
            { key: 'supplierName', label: 'Supplier', type: 'text' },
            { key: 'amount', label: 'Amount Sent', type: 'currency', align: 'right' },
            { key: 'reference', label: 'Ref Num', type: 'text' },
            { key: 'staffName', label: 'Sender', type: 'user' }
        ],
        dataSource: 'supplierPaymentsLog', showTotals: true, drillDown: true
    },
    {
        id: 'sup-003',
        title: 'Purchases Ledger',
        description: 'Every fuel drop billed to the station',
        category: 'SUPPLIER',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'supplierName', label: 'Vendor', type: 'text' },
            { key: 'invoiceNumber', label: 'Invoice #', type: 'text' },
            { key: 'amount', label: 'Bill Value', type: 'currency', align: 'right' }
        ],
        dataSource: 'supplierPurchases', showTotals: true, drillDown: true
    },
    {
        id: 'sup-004',
        title: 'Supplier Aging Report',
        description: 'Debt timeframe against OMCs',
        category: 'SUPPLIER',
        columns: [
            { key: 'supplierName', label: 'Vendor', type: 'text' },
            { key: 'current', label: '< 15 Days', type: 'currency', align: 'right' },
            { key: 'days30', label: '15-30 Days', type: 'currency', align: 'right' },
            { key: 'days60', label: '30+ Days', type: 'badge', align: 'right' },
            { key: 'total', label: 'Total Payable', type: 'currency', align: 'right' }
        ],
        dataSource: 'supplierAging', showTotals: true
    },
    {
        id: 'sup-005',
        title: 'Top OMC Relationships',
        description: 'Ranking of best vendors by volume',
        category: 'SUPPLIER',
        columns: [
            { key: 'supplierName', label: 'Provider', type: 'text' },
            { key: 'supplyValue', label: 'Purchases (Rs)', type: 'currency', align: 'right' },
            { key: 'dependencyPercent', label: 'System %', type: 'text', align: 'right' }
        ],
        dataSource: 'topSuppliers'
    },
    {
        id: 'sup-006',
        title: 'Credit Notes / Adjustments',
        description: 'Vendor refunds or bad-batch deductions',
        category: 'SUPPLIER',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'supplierName', label: 'Supplier', type: 'text' },
            { key: 'amount', label: 'Value Saved', type: 'currency', align: 'right' },
            { key: 'reason', label: 'Reason/Ref', type: 'text' }
        ],
        dataSource: 'supplierAdjustments'
    },
    {
        id: 'sup-007',
        title: 'Upcoming Due Dates',
        description: 'Cashflow planning for incoming bills',
        category: 'SUPPLIER',
        columns: [
            { key: 'dueDate', label: 'Deadline', type: 'date' },
            { key: 'supplierName', label: 'Vendor', type: 'text' },
            { key: 'invoiceNumber', label: 'Invoice', type: 'text' },
            { key: 'amountOwing', label: 'Required Cash', type: 'badge', align: 'right' }
        ],
        dataSource: 'supplierDueDates'
    },
    {
        id: 'sup-008',
        title: 'Carriage Partners Matrix',
        description: 'Logistics and freight partner payouts',
        category: 'SUPPLIER',
        columns: [
            { key: 'partnerName', label: 'Transporter', type: 'text' },
            { key: 'totalTrips', label: 'Trips', type: 'number', align: 'center' },
            { key: 'totalPaid', label: 'Freight Paid', type: 'currency', align: 'right' }
        ],
        dataSource: 'carriagePartners', showTotals: true
    },
    {
        id: 'sup-009',
        title: 'Purchase Orders Tracking',
        description: 'POs generated vs received vs cancelled',
        category: 'SUPPLIER',
        columns: [
            { key: 'poId', label: 'PO #', type: 'text' },
            { key: 'orderDate', label: 'Raised', type: 'date' },
            { key: 'supplierName', label: 'Vendor', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' },
            { key: 'totalAmount', label: 'Value', type: 'currency', align: 'right' }
        ],
        dataSource: 'poTracking'
    },
    {
        id: 'sup-010',
        title: 'Vendor Profit Contribution',
        description: 'Which OMC gives the highest margin yields',
        category: 'SUPPLIER',
        columns: [
            { key: 'supplierName', label: 'Supplier', type: 'text' },
            { key: 'avgCostRate', label: 'Avg Buy/L', type: 'currency', align: 'right' },
            { key: 'yieldYield', label: 'Avg Margin/L', type: 'currency', align: 'right' }
        ],
        dataSource: 'vendorProfitMatrix'
    },
    {
        id: 'fin-001',
        title: 'Cash-in-Hand (Till) Statement',
        description: 'The absolute live balance of physical paper money',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Time', type: 'datetime' },
            { key: 'type', label: 'Movement', type: 'badge' },
            { key: 'in', label: 'Cash In', type: 'currency', align: 'right' },
            { key: 'out', label: 'Cash Out', type: 'currency', align: 'right' },
            { key: 'balance', label: 'Actual Drawer', type: 'badge', align: 'right' },
            { key: 'reference', label: 'Note', type: 'text' }
        ],
        dataSource: 'cashStatement', showTotals: true, drillDown: true
    },
    {
        id: 'fin-002',
        title: 'Bank Reconciliations',
        description: 'Deposits hitting actual commercial bank accounts',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Cleared', type: 'date' },
            { key: 'bankName', label: 'Bank Name', type: 'text' },
            { key: 'depositFlow', label: 'Deposited', type: 'currency', align: 'right' },
            { key: 'withdrawFlow', label: 'Escaped', type: 'currency', align: 'right' },
            { key: 'balance', label: 'Safe Asset', type: 'currency', align: 'right' }
        ],
        dataSource: 'bankStatement', showTotals: true
    },
    {
        id: 'fin-003',
        title: 'Complete Expense Ledger',
        description: 'Every penny spent to run the station',
        category: 'EXPENSE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'category', label: 'Group', type: 'badge' },
            { key: 'amount', label: 'Spent', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Expenser', type: 'user' },
            { key: 'remarks', label: 'Details', type: 'text' }
        ],
        dataSource: 'completeExpenseLedger', showTotals: true, drillDown: true
    },
    {
        id: 'fin-004',
        title: 'Petty Cash Burn Rate',
        description: 'Day to day small change bleeding out',
        category: 'EXPENSE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'amount', label: 'Drained', type: 'currency', align: 'right' },
            { key: 'receiptCount', label: 'Chits', type: 'number', align: 'center' }
        ],
        dataSource: 'pettyCashBurn', showTotals: true
    },
    {
        id: 'fin-005',
        title: 'Expense Group Proportions',
        description: 'Which sector is eating profits?',
        category: 'EXPENSE',
        columns: [
            { key: 'category', label: 'Sector', type: 'badge' },
            { key: 'totalSpend', label: 'Expenditure', type: 'currency', align: 'right' },
            { key: 'percentage', label: 'Share %', type: 'text', align: 'right' }
        ],
        dataSource: 'expenseGrouping'
    },
    {
        id: 'fin-006',
        title: 'Inter-Account Vault Transfers',
        description: 'Tracing cash sliding from Till → Safebox → Bank',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Time', type: 'datetime' },
            { key: 'fromAccount', label: 'Source', type: 'text' },
            { key: 'toAccount', label: 'Destination', type: 'text' },
            { key: 'amount', label: 'Moved Value', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Authorizer', type: 'user' }
        ],
        dataSource: 'interVaultTransfers'
    },
    {
        id: 'fin-007',
        title: 'Digital Wallets Net Settlement',
        description: 'JazzCash/Easypaisa API holdings',
        category: 'FINANCIAL',
        columns: [
            { key: 'providerName', label: 'App Name', type: 'text' },
            { key: 'totalIn', label: 'Received', type: 'currency', align: 'right' },
            { key: 'totalOut', label: 'Disbursed', type: 'currency', align: 'right' },
            { key: 'liveBalance', label: 'Holding Now', type: 'badge', align: 'right' }
        ],
        dataSource: 'digitalWalletsNet'
    },
    {
        id: 'fin-008',
        title: 'Owner/Director Drawings Log',
        description: 'Capital extracted by owners',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'directorName', label: 'Owner', type: 'user' },
            { key: 'amount', label: 'Extracted', type: 'currency', align: 'right' },
            { key: 'reference', label: 'Ref', type: 'text' }
        ],
        dataSource: 'ownerDrawings', showTotals: true
    },
    {
        id: 'fin-009',
        title: 'Maintenance/Repairs Sunk Cost',
        description: 'Cost of keeping machines alive',
        category: 'EXPENSE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'assetIdent', label: 'Machine/Nozzle', type: 'text' },
            { key: 'cost', label: 'Billed', type: 'currency', align: 'right' },
            { key: 'vendor', label: 'Technician', type: 'text' }
        ],
        dataSource: 'maintenanceSunk', showTotals: true
    },
    {
        id: 'fin-010',
        title: 'Utility Bills Breakdown',
        description: 'Electricity & Internet tracking',
        category: 'EXPENSE',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'electricity', label: 'WAPDA/KE', type: 'currency', align: 'right' },
            { key: 'generator', label: 'Gen Fuel (L)', type: 'number', align: 'right' },
            { key: 'waterNet', label: 'Water/Net', type: 'currency', align: 'right' }
        ],
        dataSource: 'utilityBreakdown', showTotals: true
    },
    {
        id: 'fin-011',
        title: 'Officer & Admin Meals (Langar)',
        description: 'Daily food tracking',
        category: 'EXPENSE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'amount', label: 'Meal Cost', type: 'currency', align: 'right' },
            { key: 'headcount', label: 'Persons', type: 'number', align: 'center' }
        ],
        dataSource: 'langarTracking', showTotals: true
    },
    {
        id: 'fin-012',
        title: 'Total Deductions Summary Matrix',
        description: 'Total leak of station wealth per day',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'expenses', label: 'Expenses', type: 'currency', align: 'right' },
            { key: 'drawings', label: 'Drawings', type: 'currency', align: 'right' },
            { key: 'losses', label: 'Shortages', type: 'currency', align: 'right' },
            { key: 'totalBleed', label: 'Total Bleed', type: 'badge', align: 'right' }
        ],
        dataSource: 'dailyLeakage', showTotals: true
    },
    {
        id: 'fin-013',
        title: 'Cash Shortage Forfeitures',
        description: 'Money lost unrecoverable from staff',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Shift Date', type: 'date' },
            { key: 'staffName', label: 'Faulted Staff', type: 'user' },
            { key: 'shortageLost', label: 'Loss Eaten', type: 'currency', align: 'right' }
        ],
        dataSource: 'shortageLosses', showTotals: true
    },
    {
        id: 'fin-014',
        title: 'Digital Processing Fee Charges',
        description: 'POS & Wallet cuts/fees',
        category: 'EXPENSE',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'gateway', label: 'Bank/App', type: 'text' },
            { key: 'volumePushed', label: 'Volume Flow', type: 'currency', align: 'right' },
            { key: 'feesCaught', label: 'Bank Cuts', type: 'currency', align: 'right' }
        ],
        dataSource: 'digitalFees', showTotals: true
    },
    {
        id: 'fin-015',
        title: 'Custom Manual Adjustments',
        description: 'Ledger forced override logs',
        category: 'FINANCIAL',
        columns: [
            { key: 'date', label: 'Timestamp', type: 'datetime' },
            { key: 'accountImpacted', label: 'Account', type: 'text' },
            { key: 'amount', label: 'Swing', type: 'currency', align: 'right' },
            { key: 'adminName', label: 'Hacker', type: 'badge' },
            { key: 'reason', label: 'Justification', type: 'text' }
        ],
        dataSource: 'manualAdjustments'
    },
    {
        id: 'staff-001',
        title: 'Staff Attendance Register',
        description: 'Digital roll-call of biometric/app logins',
        category: 'STAFF',
        columns: [
            { key: 'date', label: 'Shift Date', type: 'date' },
            { key: 'staffName', label: 'Employee', type: 'user' },
            { key: 'checkIn', label: 'Spawn Time', type: 'datetime' },
            { key: 'checkOut', label: 'Despawn', type: 'datetime' },
            { key: 'status', label: 'Status', type: 'badge' }
        ],
        dataSource: 'staffAttendance', drillDown: true
    },
    {
        id: 'staff-002',
        title: 'Staff Salary Base Generation',
        description: 'Calculated monthly payouts',
        category: 'STAFF',
        columns: [
            { key: 'month', label: 'Cycle', type: 'text' },
            { key: 'staffName', label: 'Employee', type: 'user' },
            { key: 'baseSalary', label: 'Base', type: 'currency', align: 'right' },
            { key: 'advances', label: 'Advances (-)', type: 'currency', align: 'right' },
            { key: 'deductions', label: 'Shortages (-)', type: 'currency', align: 'right' },
            { key: 'netPayable', label: 'Net To Wallet', type: 'badge', align: 'right' }
        ],
        dataSource: 'staffSalary', showTotals: true
    },
    {
        id: 'staff-003',
        title: 'Staff Loan/Cash Advance Register',
        description: 'Money borrowed mid-month by workers',
        category: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Borrower', type: 'user' },
            { key: 'amount', label: 'Advance Given', type: 'currency', align: 'right' },
            { key: 'approvedBy', label: 'Admin', type: 'user' }
        ],
        dataSource: 'staffAdvances', showTotals: true
    },
    {
        id: 'staff-004',
        title: 'Staff Shortage Recovery Log',
        description: 'Shift variances being recovered from salaries',
        category: 'STAFF',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'staffName', label: 'Employee', type: 'user' },
            { key: 'totalShortage', label: 'Gross Mistake', type: 'currency', align: 'right' },
            { key: 'recovered', label: 'Peeled Back', type: 'currency', align: 'right' }
        ],
        dataSource: 'staffShortageRecoveries', showTotals: true
    },
    {
        id: 'staff-005',
        title: 'Performance KPI Rank Board',
        description: 'Scoring cashiers against each other',
        category: 'STAFF',
        columns: [
            { key: 'staffName', label: 'Name', type: 'user' },
            { key: 'totalShifts', label: 'Missions', type: 'number', align: 'center' },
            { key: 'totalSales', label: 'Gross Loot', type: 'currency', align: 'right' },
            { key: 'avgVariance', label: 'Integrity Rating', type: 'currency', align: 'right' },
            { key: 'efficiency', label: 'Tier', type: 'badge' }
        ],
        dataSource: 'staffPerformance', drillDown: true
    },
    {
        id: 'staff-006',
        title: 'Shift Assignment Roster',
        description: 'Who worked when and where',
        category: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Worker', type: 'user' },
            { key: 'shiftNumber', label: 'Period', type: 'number', align: 'center' },
            { key: 'status', label: 'Outcome', type: 'badge' }
        ],
        dataSource: 'staffShiftHistory'
    },
    {
        id: 'staff-007',
        title: 'Overtime Detection',
        description: 'Flags for consecutive shifts',
        category: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'staffName', label: 'Grinder', type: 'user' },
            { key: 'consecutiveShifts', label: 'Back2Back', type: 'number', align: 'center' },
            { key: 'alertLevel', label: 'Fatigue Risk', type: 'badge' }
        ],
        dataSource: 'staffOvertime'
    },
    {
        id: 'staff-008',
        title: 'Staff Ledger Final Dump',
        description: 'The absolute master khata for workers',
        category: 'STAFF',
        columns: [
            { key: 'timestamp', label: 'Action Time', type: 'datetime' },
            { key: 'staffName', label: 'Employee', type: 'user' },
            { key: 'type', label: 'Hit Type', type: 'badge' },
            { key: 'debit', label: 'Paid Them (-)', type: 'currency', align: 'right' },
            { key: 'credit', label: 'Earned (+)', type: 'currency', align: 'right' },
            { key: 'balance', label: 'Current Bal', type: 'badge', align: 'right' }
        ],
        dataSource: 'staffLedgerMaster', showTotals: true
    },
    {
        id: 'staff-009',
        title: 'Disciplinary & Activity Logs',
        description: 'Warnings and actions given to rulebreakers',
        category: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'datetime' },
            { key: 'staffName', label: 'Violator', type: 'user' },
            { key: 'incidentType', label: 'Offense Code', type: 'badge' },
            { key: 'description', label: 'Details', type: 'text' },
            { key: 'issuedBy', label: 'Enforcer', type: 'user' }
        ],
        dataSource: 'staffDiscipline'
    },
    {
        id: 'staff-010',
        title: 'Hiring/Firing Turnover History',
        description: 'Employment cycle data',
        category: 'STAFF',
        columns: [
            { key: 'staffName', label: 'Name', type: 'user' },
            { key: 'role', label: 'Designation', type: 'badge' },
            { key: 'joinDate', label: 'Spawned', type: 'date' },
            { key: 'status', label: 'Current State', type: 'badge' }
        ],
        dataSource: 'staffTurnover'
    },
    {
        id: 'prof-001',
        title: 'Shift Gross Profit Margins',
        description: 'Calculated baseline profit per closed shift',
        category: 'PROFIT_LOSS',
        columns: [
            { key: 'shiftId', label: 'Shift ID', type: 'text' },
            { key: 'staffName', label: 'Runner', type: 'user' },
            { key: 'revenue', label: 'Total Take', type: 'currency', align: 'right' },
            { key: 'costBasis', label: 'Cost Basis', type: 'currency', align: 'right' },
            { key: 'grossMargin', label: 'Gross Profit', type: 'badge', align: 'right' }
        ],
        dataSource: 'shiftGrossProfit', showTotals: true
    },
    {
        id: 'prof-002',
        title: 'Net Income After Deduction Statement',
        description: 'Hard cash actual business yield tracking',
        category: 'PROFIT_LOSS',
        columns: [
            { key: 'month', label: 'Term', type: 'text' },
            { key: 'grossMargin', label: 'Gross Tier', type: 'currency', align: 'right' },
            { key: 'runningCosts', label: 'All Expenses (-)', type: 'currency', align: 'right' },
            { key: 'shrinkage', label: 'Total Loss (-)', type: 'currency', align: 'right' },
            { key: 'netProfit', label: 'Net Takehome', type: 'badge', align: 'right' },
            { key: 'roiPct', label: 'Yield %', type: 'text', align: 'right' }
        ],
        dataSource: 'netIncomeStatement', showTotals: true
    },
    {
        id: 'prof-003',
        title: 'Product Category ROI Rankings',
        description: 'Which sector acts as the ultimate cash cow',
        category: 'PROFIT_LOSS',
        columns: [
            { key: 'category', label: 'Vertical', type: 'badge' },
            { key: 'capEx', label: 'Cash Locked', type: 'currency', align: 'right' },
            { key: 'yieldValue', label: 'Profit Reaped', type: 'currency', align: 'right' },
            { key: 'roiPnt', label: 'Velocity %', type: 'text', align: 'right' }
        ],
        dataSource: 'categoryRoiRanking'
    },
    {
        id: 'prof-004',
        title: 'Evaporation Profit Destruction',
        description: 'What percentage of margins evaporate in air',
        category: 'PROFIT_LOSS',
        columns: [
            { key: 'month', label: 'Month', type: 'text' },
            { key: 'grossExpected', label: 'Ideal Target', type: 'currency', align: 'right' },
            { key: 'lossInRs', label: 'Evap Loss', type: 'currency', align: 'right' },
            { key: 'pctDestroyed', label: 'Margin Eradicated', type: 'badge', align: 'right' }
        ],
        dataSource: 'evapProfitDestruction', showTotals: true
    },
    {
        id: 'prof-005',
        title: 'Break-Even Liters Velocity Target',
        description: 'How many liters per day to survive overheads',
        category: 'PROFIT_LOSS',
        columns: [
            { key: 'period', label: 'Range', type: 'text' },
            { key: 'fixedCosts', label: 'Fixed Drain', type: 'currency', align: 'right' },
            { key: 'avgMargin', label: 'Blended Margin', type: 'currency', align: 'right' },
            { key: 'targetLiters', label: 'Target Liters', type: 'number', align: 'right' },
            { key: 'actualLiters', label: 'Actual Pushed', type: 'number', align: 'right' },
            { key: 'status', label: 'Safety', type: 'badge' }
        ],
        dataSource: 'breakEvenVelocity'
    },
    {
        id: 'cng-001',
        title: 'CNG Compression Yield Output',
        description: 'Compressor performance translating to sale KG',
        category: 'CNG',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'compressorName', label: 'Engine', type: 'text' },
            { key: 'runHours', label: 'Uptime (Hr)', type: 'number', align: 'right' },
            { key: 'gasYielded', label: 'Gas Pressed (KG)', type: 'number', align: 'right' },
            { key: 'efficiency', label: 'Ratio', type: 'text', align: 'right' }
        ],
        dataSource: 'cngCompressionYield', showTotals: true, drillDown: true
    },
    {
        id: 'cng-002',
        title: 'Cascades Pressure Drop Log',
        description: 'Variance of holding pressure in banks',
        category: 'CNG',
        columns: [
            { key: 'bankName', label: 'Bank Class', type: 'badge' },
            { key: 'avgPressure', label: 'Median Dispense (bar)', type: 'number', align: 'right' },
            { key: 'dropSpikes', label: 'Loss Events', type: 'number', align: 'center' }
        ],
        dataSource: 'cngCascadePressure'
    },
    {
        id: 'cng-003',
        title: 'CNG Exact Sale Ledger',
        description: 'Dispenser level CNG revenue mapping',
        category: 'CNG',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'nozzleName', label: 'Hose Output', type: 'text' },
            { key: 'kgs', label: 'Gas (KG)', type: 'number', align: 'right' },
            { key: 'revenue', label: 'Intake', type: 'currency', align: 'right' },
            { key: 'staffName', label: 'Filler', type: 'user' }
        ],
        dataSource: 'cngSaleLedger', showTotals: true, drillDown: true
    },
    {
        id: 'cng-004',
        title: 'Gas Decanting/Receiving Complete Audit',
        description: 'Proof of gas dropping into main lines',
        category: 'CNG',
        columns: [
            { key: 'date', label: 'Drop Time', type: 'datetime' },
            { key: 'supplier', label: 'Source', type: 'text' },
            { key: 'containerId', label: 'Truck/Valve', type: 'text' },
            { key: 'totalKGs', label: 'Inbound KGs', type: 'number', align: 'right' },
            { key: 'billing', label: 'Cost Ticket', type: 'currency', align: 'right' }
        ],
        dataSource: 'cngDecantingAudit', showTotals: true
    },
    {
        id: 'cng-005',
        title: 'CNG Machine Up-time & Faults',
        description: 'Engine maintenance requirement matrix',
        category: 'CNG',
        columns: [
            { key: 'compressorName', label: 'Machine Code', type: 'text' },
            { key: 'uptimeHrs', label: 'Life Uptime', type: 'number', align: 'right' },
            { key: 'nextService', label: 'Service Due At', type: 'number', align: 'right' },
            { key: 'status', label: 'Grid State', type: 'badge' }
        ],
        dataSource: 'cngMachineFaults'
    },
    {
        id: 'audit-001',
        title: 'System Master Action Timeline',
        description: 'Absolute read-only timeline of any click/save',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Execute Time', type: 'datetime' },
            { key: 'userName', label: 'Identity', type: 'user' },
            { key: 'module', label: 'Zone', type: 'badge' },
            { key: 'action', label: 'Command', type: 'badge' },
            { key: 'details', label: 'Payload Signature', type: 'text' }
        ],
        dataSource: 'auditMasterTimeline', drillDown: true
    },
    {
        id: 'audit-002',
        title: 'Failed Authentication/Access Attempts',
        description: 'Intrusion detection for managers',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Ping Time', type: 'datetime' },
            { key: 'userId', label: 'Attempted User', type: 'user' },
            { key: 'ipAddress', label: 'Vector IP', type: 'text' },
            { key: 'alert', label: 'Severity', type: 'badge' }
        ],
        dataSource: 'auditFailedAccess'
    },
    {
        id: 'audit-003',
        title: 'Rate Tampering / Edit Log',
        description: 'Track specifically whenever fuel prices are altered',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Altered At', type: 'datetime' },
            { key: 'userName', label: 'Executive', type: 'user' },
            { key: 'fuelType', label: 'Commodity', type: 'badge' },
            { key: 'oldPrice', label: 'Old Rs', type: 'currency', align: 'right' },
            { key: 'newPrice', label: 'New Rs', type: 'badge', align: 'right' }
        ],
        dataSource: 'auditRateTampering'
    },
    {
        id: 'audit-004',
        title: 'Record Deletion/Void Tracking',
        description: 'Tracking destroyed or deleted financial records',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Time Deleted', type: 'datetime' },
            { key: 'userName', label: 'Eraser', type: 'user' },
            { key: 'recordType', label: 'Wiped Type', type: 'text' },
            { key: 'details', label: 'Last known info', type: 'text' }
        ],
        dataSource: 'auditDeletes'
    },
    {
        id: 'audit-005',
        title: 'Shift Forcible Unlock Actions',
        description: 'Admin unlocking a sealed shift to edit records',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Compromise Time', type: 'datetime' },
            { key: 'shiftId', label: 'Target Shift', type: 'text' },
            { key: 'adminName', label: 'Breacher', type: 'user' },
            { key: 'reason', label: 'Excuse', type: 'text' }
        ],
        dataSource: 'auditShiftUnlocks'
    },
    {
        id: 'audit-006',
        title: 'Cash Missing (No-Recovery) Events',
        description: 'System detected cash leak with no explanation',
        category: 'THEFT_FORENSIC',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'shiftId', label: 'Shift Origin', type: 'text' },
            { key: 'leakVolume', label: 'Cash Missing', type: 'badge', align: 'right' },
            { key: 'suspectName', label: 'Operator', type: 'user' }
        ],
        dataSource: 'auditCashLeaks'
    },
    {
        id: 'audit-007',
        title: 'Negative Balance Allowed Errors',
        description: 'Customer khatas that fell into negative logic',
        category: 'AUDIT',
        columns: [
            { key: 'date', label: 'Violation Date', type: 'date' },
            { key: 'customerName', label: 'Account', type: 'user' },
            { key: 'balance', label: 'Impossible Bal', type: 'currency', align: 'right' }
        ],
        dataSource: 'auditNegativeKhata'
    },
    {
        id: 'audit-008',
        title: 'Discount Abuse Diagnostics',
        description: 'Operators granting unusually high repeated discounts',
        category: 'THEFT_FORENSIC',
        columns: [
            { key: 'staffName', label: 'Target Operator', type: 'user' },
            { key: 'countInstances', label: 'Strikes', type: 'number', align: 'center' },
            { key: 'totalValue', label: 'Given Away', type: 'currency', align: 'right' },
            { key: 'risk', label: 'Abuse Risk', type: 'badge' }
        ],
        dataSource: 'auditDiscountAbuse'
    },
    {
        id: 'audit-009',
        title: 'Ghost Shift Detection',
        description: 'Shifts carrying no nozzles but registering data',
        category: 'THEFT_FORENSIC',
        columns: [
            { key: 'shiftId', label: 'Phantom Shift', type: 'text' },
            { key: 'startTime', label: 'Created', type: 'datetime' },
            { key: 'creatorName', label: 'Architect', type: 'user' },
            { key: 'anomaly', label: 'Irregularity', type: 'text' }
        ],
        dataSource: 'auditGhostShifts'
    },
    {
        id: 'audit-010',
        title: 'System Security Configuration Edits',
        description: 'Changes to station tax codes, variables, or thresholds',
        category: 'AUDIT',
        columns: [
            { key: 'timestamp', label: 'Change Time', type: 'datetime' },
            { key: 'adminName', label: 'Editor', type: 'user' },
            { key: 'keyModified', label: 'Setting Hook', type: 'badge' },
            { key: 'action', label: 'Outcome', type: 'text' }
        ],
        dataSource: 'auditConfigEdits'
    },
    {
        id: 'hard-001',
        title: 'Dispenser Calibration Renewals',
        description: 'Due dates for government meter calibrations',
        category: 'COMPLIANCE',
        columns: [
            { key: 'nozzleName', label: 'Hardware Node', type: 'text' },
            { key: 'lastCalibrated', label: 'Last Check', type: 'date' },
            { key: 'renewalDue', label: 'Deadline', type: 'date' },
            { key: 'status', label: 'Gov Status', type: 'badge' }
        ],
        dataSource: 'hardwareCalibrations'
    },
    {
        id: 'hard-002',
        title: 'Tank Cleaning Deadlines',
        description: 'Corrosion prevention tank service cycles',
        category: 'COMPLIANCE',
        columns: [
            { key: 'tankName', label: 'Storage Tank', type: 'text' },
            { key: 'lastCleaned', label: 'Last Washed', type: 'date' },
            { key: 'safeDays', label: 'Safety Window', type: 'number', align: 'center' },
            { key: 'actionState', label: 'Priority', type: 'badge' }
        ],
        dataSource: 'hardwareTankCleanings'
    },
    {
        id: 'hard-003',
        title: 'Meter Reader Wear & Tear Metrics',
        description: 'Total pumped volume per singular mechanical valve',
        category: 'COMPLIANCE',
        columns: [
            { key: 'nozzleName', label: 'Node', type: 'text' },
            { key: 'lifetimeFlow', label: 'Lifetime K-Liters', type: 'number', align: 'right' },
            { key: 'stressRating', label: 'Stress Factor', type: 'badge' }
        ],
        dataSource: 'hardwareWearMetrics'
    },
    {
        id: 'hard-004',
        title: 'Fire Safety Extinguisher Renewal',
        description: 'Facility safety equipment expiry tracker',
        category: 'COMPLIANCE',
        columns: [
            { key: 'equipmentId', label: 'Asset Code', type: 'text' },
            { key: 'location', label: 'Zone', type: 'text' },
            { key: 'expiryDate', label: 'Death Date', type: 'date' },
            { key: 'status', label: 'Risk', type: 'badge' }
        ],
        dataSource: 'hardwareSafetyExpiries'
    },
    {
        id: 'hard-005',
        title: 'Filter Replacements Ledger',
        description: 'Petroleum physical flow filtration limits',
        category: 'COMPLIANCE',
        columns: [
            { key: 'filterNode', label: 'Dispenser Filter', type: 'text' },
            { key: 'flowSinceChange', label: 'Pushed Since', type: 'number', align: 'right' },
            { key: 'limitVolume', label: 'Max Lifecycle', type: 'number', align: 'right' },
            { key: 'healthIndicator', label: 'Porosity', type: 'badge' }
        ],
        dataSource: 'hardwareFilterLedger'
    }
];

export const REPORT_REGISTRY: ReportDefinition[] = [
    ...FUEL_REPORTS,
    ...CNG_REPORTS,
    ...LUBE_REPORTS,
    ...ENTERPRISE_REPORTS,
    ...FORENSIC_REPORTS,
    ...COMPLIANCE_REPORTS
];
