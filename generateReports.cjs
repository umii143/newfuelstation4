const fs = require('fs');

const generateColumns = (type) => {
    // Generate some generic columns based on the report type
    const baseCols = [
        `{ key: 'id', label: 'ID', type: 'text' }`,
        `{ key: 'date', label: 'Date', type: 'date' }`
    ];
    
    if (type.includes('FINANCIAL') || type.includes('SALES') || type.includes('EXPENSE')) {
        baseCols.push(`{ key: 'amount', label: 'Amount', type: 'currency', align: 'right' }`);
    }
    if (type.includes('CUSTOMER') || type.includes('SUPPLIER')) {
        baseCols.push(`{ key: 'name', label: 'Name', type: 'text' }`);
        baseCols.push(`{ key: 'balance', label: 'Balance', type: 'currency', align: 'right' }`);
    }
    if (type.includes('INVENTORY')) {
        baseCols.push(`{ key: 'itemName', label: 'Item Name', type: 'text' }`);
        baseCols.push(`{ key: 'quantity', label: 'Quantity', type: 'number', align: 'right' }`);
    }
    if (type.includes('AUDIT')) {
        baseCols.push(`{ key: 'user', label: 'User', type: 'user' }`);
        baseCols.push(`{ key: 'action', label: 'Action', type: 'text' }`);
        baseCols.push(`{ key: 'details', label: 'Details', type: 'text' }`);
    }
    return `[\n        ${baseCols.join(',\n        ')}\n    ]`;
};

const cngReportsData = [
    // Financial (10)
    { id: 'cng-fin-01', cat: 'CNG_FINANCIAL', title: 'CNG Profit & Loss Statement', ds: 'cng-pnl', role: 'MANAGER' },
    { id: 'cng-fin-02', cat: 'CNG_FINANCIAL', title: 'CNG Cash Flow Statement', ds: 'cng-cashflow', role: 'MANAGER' },
    { id: 'cng-fin-03', cat: 'CNG_FINANCIAL', title: 'CNG Balance Sheet Snapshot', ds: 'cng-balancesheet', role: 'MANAGER' },
    { id: 'cng-fin-04', cat: 'CNG_FINANCIAL', title: 'CNG Revenue Breakdown by Dispenser', ds: 'cng-revenue-dispenser', role: 'MANAGER' },
    { id: 'cng-fin-05', cat: 'CNG_FINANCIAL', title: 'CNG Expense Breakdown by Category', ds: 'cng-expense-cat', role: 'MANAGER' },
    { id: 'cng-fin-06', cat: 'CNG_FINANCIAL', title: 'CNG Net Margin Report', ds: 'cng-net-margin', role: 'MANAGER' },
    { id: 'cng-fin-07', cat: 'CNG_FINANCIAL', title: 'CNG Gross Profit Report', ds: 'cng-gross-profit', role: 'MANAGER' },
    { id: 'cng-fin-08', cat: 'CNG_FINANCIAL', title: 'CNG Tax Summary Report', ds: 'cng-tax-summary', role: 'ADMIN' },
    { id: 'cng-fin-09', cat: 'CNG_FINANCIAL', title: 'CNG Outstanding Receivables', ds: 'cng-receivables', role: 'MANAGER' },
    { id: 'cng-fin-10', cat: 'CNG_FINANCIAL', title: 'CNG Outstanding Payables', ds: 'cng-payables', role: 'MANAGER' },
    
    // Customer (8)
    { id: 'cng-cus-01', cat: 'CNG_CUSTOMER', title: 'CNG Full Customer Ledger', ds: 'cng-customer-ledger', role: 'MANAGER' },
    { id: 'cng-cus-02', cat: 'CNG_CUSTOMER', title: 'CNG Customer Transaction History', ds: 'cng-customer-tx', role: 'MANAGER' },
    { id: 'cng-cus-03', cat: 'CNG_CUSTOMER', title: 'CNG Credit / Debit Summary', ds: 'cng-customer-summary', role: 'MANAGER' },
    { id: 'cng-cus-04', cat: 'CNG_CUSTOMER', title: 'CNG Top Customers by Revenue', ds: 'cng-customer-top', role: 'MANAGER' },
    { id: 'cng-cus-05', cat: 'CNG_CUSTOMER', title: 'CNG Customer Aging (30/60/90 days)', ds: 'cng-customer-aging', role: 'MANAGER' },
    { id: 'cng-cus-06', cat: 'CNG_CUSTOMER', title: 'CNG New vs Returning Customers', ds: 'cng-customer-new-returning', role: 'MANAGER' },
    { id: 'cng-cus-07', cat: 'CNG_CUSTOMER', title: 'CNG Customer Payment Behavior', ds: 'cng-customer-payment-behavior', role: 'MANAGER' },
    { id: 'cng-cus-08', cat: 'CNG_CUSTOMER', title: 'CNG Customer Refund History', ds: 'cng-customer-refunds', role: 'MANAGER' },

    // Sales (8)
    { id: 'cng-sal-01', cat: 'CNG_SALES', title: 'CNG Daily Sales Summary', ds: 'cng-sales-daily', role: 'STAFF' },
    { id: 'cng-sal-02', cat: 'CNG_SALES', title: 'CNG Sales by Dispenser/Nozzle', ds: 'cng-sales-dispenser', role: 'MANAGER' },
    { id: 'cng-sal-03', cat: 'CNG_SALES', title: 'CNG Sales by Employee', ds: 'cng-sales-employee', role: 'MANAGER' },
    { id: 'cng-sal-04', cat: 'CNG_SALES', title: 'CNG Sales by Time Period (Hourly/Weekly)', ds: 'cng-sales-time', role: 'MANAGER' },
    { id: 'cng-sal-05', cat: 'CNG_SALES', title: 'CNG Discount & Promotion Impact', ds: 'cng-sales-discount', role: 'MANAGER' },
    { id: 'cng-sal-06', cat: 'CNG_SALES', title: 'CNG Invoice Register', ds: 'cng-sales-invoice', role: 'MANAGER' },
    { id: 'cng-sal-07', cat: 'CNG_SALES', title: 'CNG Period Comparison (This vs Last)', ds: 'cng-sales-comparison', role: 'MANAGER' },
    { id: 'cng-sal-08', cat: 'CNG_SALES', title: 'CNG Average Transaction Value', ds: 'cng-sales-avg-tx', role: 'MANAGER' },

    // Inventory (8)
    { id: 'cng-inv-01', cat: 'CNG_INVENTORY', title: 'CNG Stock Level (Real-time)', ds: 'cng-inv-stock', role: 'MANAGER' },
    { id: 'cng-inv-02', cat: 'CNG_INVENTORY', title: 'CNG Inventory Movement History', ds: 'cng-inv-movement', role: 'MANAGER' },
    { id: 'cng-inv-03', cat: 'CNG_INVENTORY', title: 'CNG Low Stock Alert Report', ds: 'cng-inv-low-stock', role: 'MANAGER' },
    { id: 'cng-inv-04', cat: 'CNG_INVENTORY', title: 'CNG Inventory Valuation Report', ds: 'cng-inv-valuation', role: 'MANAGER' },
    { id: 'cng-inv-05', cat: 'CNG_INVENTORY', title: 'CNG Consumption Report (KG Dispensed)', ds: 'cng-inv-consumption', role: 'MANAGER' },
    { id: 'cng-inv-06', cat: 'CNG_INVENTORY', title: 'CNG Wastage & Loss Report', ds: 'cng-inv-wastage', role: 'ADMIN' },
    { id: 'cng-inv-07', cat: 'CNG_INVENTORY', title: 'CNG Reorder Point Analysis', ds: 'cng-inv-reorder', role: 'MANAGER' },
    { id: 'cng-inv-08', cat: 'CNG_INVENTORY', title: 'CNG Supplier-wise Stock Received', ds: 'cng-inv-supplier-stock', role: 'MANAGER' },

    // Supplier (6)
    { id: 'cng-sup-01', cat: 'CNG_SUPPLIER', title: 'CNG Supplier Ledger', ds: 'cng-sup-ledger', role: 'MANAGER' },
    { id: 'cng-sup-02', cat: 'CNG_SUPPLIER', title: 'CNG Purchase Order History', ds: 'cng-sup-po', role: 'MANAGER' },
    { id: 'cng-sup-03', cat: 'CNG_SUPPLIER', title: 'CNG Supplier Payment Summary', ds: 'cng-sup-payments', role: 'MANAGER' },
    { id: 'cng-sup-04', cat: 'CNG_SUPPLIER', title: 'CNG Purchase vs Consumption', ds: 'cng-sup-vs-cons', role: 'MANAGER' },
    { id: 'cng-sup-05', cat: 'CNG_SUPPLIER', title: 'CNG Supplier Aging Report', ds: 'cng-sup-aging', role: 'MANAGER' },
    { id: 'cng-sup-06', cat: 'CNG_SUPPLIER', title: 'CNG Supplier Performance (Cost/KG)', ds: 'cng-sup-perf', role: 'MANAGER' },

    // Expense (5)
    { id: 'cng-exp-01', cat: 'CNG_EXPENSE', title: 'CNG Expense Register', ds: 'cng-exp-register', role: 'MANAGER' },
    { id: 'cng-exp-02', cat: 'CNG_EXPENSE', title: 'CNG Expense by Category', ds: 'cng-exp-category', role: 'MANAGER' },
    { id: 'cng-exp-03', cat: 'CNG_EXPENSE', title: 'CNG Recurring Expense Tracker', ds: 'cng-exp-recurring', role: 'MANAGER' },
    { id: 'cng-exp-04', cat: 'CNG_EXPENSE', title: 'CNG Expense vs Budget Report', ds: 'cng-exp-budget', role: 'ADMIN' },
    { id: 'cng-exp-05', cat: 'CNG_EXPENSE', title: 'CNG Petty Cash Report', ds: 'cng-exp-petty', role: 'MANAGER' },

    // Audit (5)
    { id: 'cng-aud-01', cat: 'CNG_AUDIT', title: 'CNG Full Audit Trail Log', ds: 'cng-aud-trail', role: 'ADMIN' },
    { id: 'cng-aud-02', cat: 'CNG_AUDIT', title: 'CNG Data Change History', ds: 'cng-aud-changes', role: 'ADMIN' },
    { id: 'cng-aud-03', cat: 'CNG_AUDIT', title: 'CNG Login & Access Log', ds: 'cng-aud-login', role: 'ADMIN' },
    { id: 'cng-aud-04', cat: 'CNG_AUDIT', title: 'CNG Deleted Records Recovery Log', ds: 'cng-aud-deleted', role: 'ADMIN' },
    { id: 'cng-aud-05', cat: 'CNG_AUDIT', title: 'CNG System Activity Report', ds: 'cng-aud-system', role: 'OWNER' },

    // Operations (5)
    { id: 'cng-ops-01', cat: 'CNG_OPERATIONS', title: 'CNG Shift-wise Collections Report', ds: 'cng-ops-shift', role: 'STAFF' },
    { id: 'cng-ops-02', cat: 'CNG_OPERATIONS', title: 'CNG Meter/Dispenser Reading Log', ds: 'cng-ops-meter', role: 'MANAGER' },
    { id: 'cng-ops-03', cat: 'CNG_OPERATIONS', title: 'CNG Employee Performance Report', ds: 'cng-ops-perf', role: 'MANAGER' },
    { id: 'cng-ops-04', cat: 'CNG_OPERATIONS', title: 'CNG Daily Closing Report', ds: 'cng-ops-closing', role: 'STAFF' },
    { id: 'cng-ops-05', cat: 'CNG_OPERATIONS', title: 'CNG Equipment Uptime Report', ds: 'cng-ops-uptime', role: 'ADMIN' },
];

const lubeReportsData = [
    // Financial (10)
    { id: 'lube-fin-01', cat: 'LUBE_FINANCIAL', title: 'Lube Profit & Loss Statement', ds: 'lube-pnl', role: 'MANAGER' },
    { id: 'lube-fin-02', cat: 'LUBE_FINANCIAL', title: 'Lube Cash Flow Statement', ds: 'lube-cashflow', role: 'MANAGER' },
    { id: 'lube-fin-03', cat: 'LUBE_FINANCIAL', title: 'Lube Balance Sheet Snapshot', ds: 'lube-balancesheet', role: 'MANAGER' },
    { id: 'lube-fin-04', cat: 'LUBE_FINANCIAL', title: 'Lube Revenue Breakdown by Service', ds: 'lube-revenue-service', role: 'MANAGER' },
    { id: 'lube-fin-05', cat: 'LUBE_FINANCIAL', title: 'Lube Expense Breakdown by Category', ds: 'lube-expense-cat', role: 'MANAGER' },
    { id: 'lube-fin-06', cat: 'LUBE_FINANCIAL', title: 'Lube Net Margin Report', ds: 'lube-net-margin', role: 'MANAGER' },
    { id: 'lube-fin-07', cat: 'LUBE_FINANCIAL', title: 'Lube Gross Profit Report', ds: 'lube-gross-profit', role: 'MANAGER' },
    { id: 'lube-fin-08', cat: 'LUBE_FINANCIAL', title: 'Lube Tax Summary Report', ds: 'lube-tax-summary', role: 'ADMIN' },
    { id: 'lube-fin-09', cat: 'LUBE_FINANCIAL', title: 'Lube Outstanding Receivables', ds: 'lube-receivables', role: 'MANAGER' },
    { id: 'lube-fin-10', cat: 'LUBE_FINANCIAL', title: 'Lube Outstanding Payables', ds: 'lube-payables', role: 'MANAGER' },

    // Customer (8)
    { id: 'lube-cus-01', cat: 'LUBE_CUSTOMER', title: 'Lube Full Customer Ledger', ds: 'lube-customer-ledger', role: 'MANAGER' },
    { id: 'lube-cus-02', cat: 'LUBE_CUSTOMER', title: 'Lube Customer Transaction History', ds: 'lube-customer-tx', role: 'MANAGER' },
    { id: 'lube-cus-03', cat: 'LUBE_CUSTOMER', title: 'Lube Customer Credit / Debit Summary', ds: 'lube-customer-summary', role: 'MANAGER' },
    { id: 'lube-cus-04', cat: 'LUBE_CUSTOMER', title: 'Lube Top Customers by Revenue', ds: 'lube-customer-top', role: 'MANAGER' },
    { id: 'lube-cus-05', cat: 'LUBE_CUSTOMER', title: 'Lube Customer Aging (30/60/90 days)', ds: 'lube-customer-aging', role: 'MANAGER' },
    { id: 'lube-cus-06', cat: 'LUBE_CUSTOMER', title: 'Lube New vs Returning Customers', ds: 'lube-customer-new-returning', role: 'MANAGER' },
    { id: 'lube-cus-07', cat: 'LUBE_CUSTOMER', title: 'Lube Customer Payment Behavior', ds: 'lube-customer-payment-behavior', role: 'MANAGER' },
    { id: 'lube-cus-08', cat: 'LUBE_CUSTOMER', title: 'Lube Customer Refund History', ds: 'lube-customer-refunds', role: 'MANAGER' },

    // Sales (8)
    { id: 'lube-sal-01', cat: 'LUBE_SALES', title: 'Lube Daily Sales Summary', ds: 'lube-sales-daily', role: 'STAFF' },
    { id: 'lube-sal-02', cat: 'LUBE_SALES', title: 'Lube Sales by Product/Service', ds: 'lube-sales-product', role: 'MANAGER' },
    { id: 'lube-sal-03', cat: 'LUBE_SALES', title: 'Lube Sales by Employee/Technician', ds: 'lube-sales-employee', role: 'MANAGER' },
    { id: 'lube-sal-04', cat: 'LUBE_SALES', title: 'Lube Sales by Time Period', ds: 'lube-sales-time', role: 'MANAGER' },
    { id: 'lube-sal-05', cat: 'LUBE_SALES', title: 'Lube Discount & Promotion Impact', ds: 'lube-sales-discount', role: 'MANAGER' },
    { id: 'lube-sal-06', cat: 'LUBE_SALES', title: 'Lube Invoice Register', ds: 'lube-sales-invoice', role: 'MANAGER' },
    { id: 'lube-sal-07', cat: 'LUBE_SALES', title: 'Lube Period Comparison (This vs Last)', ds: 'lube-sales-comparison', role: 'MANAGER' },
    { id: 'lube-sal-08', cat: 'LUBE_SALES', title: 'Lube Average Transaction Value', ds: 'lube-sales-avg-tx', role: 'MANAGER' },

    // Inventory (8)
    { id: 'lube-inv-01', cat: 'LUBE_INVENTORY', title: 'Lube Stock Level (Real-time)', ds: 'lube-inv-stock', role: 'MANAGER' },
    { id: 'lube-inv-02', cat: 'LUBE_INVENTORY', title: 'Lube Inventory Movement History', ds: 'lube-inv-movement', role: 'MANAGER' },
    { id: 'lube-inv-03', cat: 'LUBE_INVENTORY', title: 'Lube Low Stock Alert Report', ds: 'lube-inv-low-stock', role: 'MANAGER' },
    { id: 'lube-inv-04', cat: 'LUBE_INVENTORY', title: 'Lube Inventory Valuation Report', ds: 'lube-inv-valuation', role: 'MANAGER' },
    { id: 'lube-inv-05', cat: 'LUBE_INVENTORY', title: 'Lube Product Consumption Report', ds: 'lube-inv-consumption', role: 'MANAGER' },
    { id: 'lube-inv-06', cat: 'LUBE_INVENTORY', title: 'Lube Wastage & Loss Report', ds: 'lube-inv-wastage', role: 'ADMIN' },
    { id: 'lube-inv-07', cat: 'LUBE_INVENTORY', title: 'Lube Reorder Point Analysis', ds: 'lube-inv-reorder', role: 'MANAGER' },
    { id: 'lube-inv-08', cat: 'LUBE_INVENTORY', title: 'Lube Supplier-wise Stock Received', ds: 'lube-inv-supplier-stock', role: 'MANAGER' },

    // Supplier (6)
    { id: 'lube-sup-01', cat: 'LUBE_SUPPLIER', title: 'Lube Supplier Ledger', ds: 'lube-sup-ledger', role: 'MANAGER' },
    { id: 'lube-sup-02', cat: 'LUBE_SUPPLIER', title: 'Lube Purchase Order History', ds: 'lube-sup-po', role: 'MANAGER' },
    { id: 'lube-sup-03', cat: 'LUBE_SUPPLIER', title: 'Lube Supplier Payment Summary', ds: 'lube-sup-payments', role: 'MANAGER' },
    { id: 'lube-sup-04', cat: 'LUBE_SUPPLIER', title: 'Lube Purchase vs Sales (Margin Check)', ds: 'lube-sup-vs-sales', role: 'MANAGER' },
    { id: 'lube-sup-05', cat: 'LUBE_SUPPLIER', title: 'Lube Supplier Aging Report', ds: 'lube-sup-aging', role: 'MANAGER' },
    { id: 'lube-sup-06', cat: 'LUBE_SUPPLIER', title: 'Lube Supplier Performance Report', ds: 'lube-sup-perf', role: 'MANAGER' },

    // Expense (5)
    { id: 'lube-exp-01', cat: 'LUBE_EXPENSE', title: 'Lube Expense Register', ds: 'lube-exp-register', role: 'MANAGER' },
    { id: 'lube-exp-02', cat: 'LUBE_EXPENSE', title: 'Lube Expense by Category', ds: 'lube-exp-category', role: 'MANAGER' },
    { id: 'lube-exp-03', cat: 'LUBE_EXPENSE', title: 'Lube Recurring Expense Tracker', ds: 'lube-exp-recurring', role: 'MANAGER' },
    { id: 'lube-exp-04', cat: 'LUBE_EXPENSE', title: 'Lube Expense vs Budget Report', ds: 'lube-exp-budget', role: 'ADMIN' },
    { id: 'lube-exp-05', cat: 'LUBE_EXPENSE', title: 'Lube Petty Cash Report', ds: 'lube-exp-petty', role: 'MANAGER' },

    // Audit (5)
    { id: 'lube-aud-01', cat: 'LUBE_AUDIT', title: 'Lube Full Audit Trail Log', ds: 'lube-aud-trail', role: 'ADMIN' },
    { id: 'lube-aud-02', cat: 'LUBE_AUDIT', title: 'Lube Data Change History', ds: 'lube-aud-changes', role: 'ADMIN' },
    { id: 'lube-aud-03', cat: 'LUBE_AUDIT', title: 'Lube Login & Access Log', ds: 'lube-aud-login', role: 'ADMIN' },
    { id: 'lube-aud-04', cat: 'LUBE_AUDIT', title: 'Lube Deleted Records Recovery Log', ds: 'lube-aud-deleted', role: 'ADMIN' },
    { id: 'lube-aud-05', cat: 'LUBE_AUDIT', title: 'Lube System Activity Report', ds: 'lube-aud-system', role: 'OWNER' },

    // Operations (5)
    { id: 'lube-ops-01', cat: 'LUBE_OPERATIONS', title: 'Lube Service History by Vehicle', ds: 'lube-ops-service', role: 'STAFF' },
    { id: 'lube-ops-02', cat: 'LUBE_OPERATIONS', title: 'Lube Technician Job Sheet Log', ds: 'lube-ops-tech', role: 'MANAGER' },
    { id: 'lube-ops-03', cat: 'LUBE_OPERATIONS', title: 'Lube Employee Performance Report', ds: 'lube-ops-perf', role: 'MANAGER' },
    { id: 'lube-ops-04', cat: 'LUBE_OPERATIONS', title: 'Lube Daily Closing Report', ds: 'lube-ops-closing', role: 'STAFF' },
    { id: 'lube-ops-05', cat: 'LUBE_OPERATIONS', title: 'Lube Bay Utilization Report', ds: 'lube-ops-bay', role: 'MANAGER' },
];

const enterpriseReportsData = [
    { id: 'ent-01', cat: 'ENTERPRISE', title: 'Unified P&L Statement (All Modules)', ds: 'ent-pnl', role: 'ADMIN' },
    { id: 'ent-02', cat: 'ENTERPRISE', title: 'Unified Cash Flow Statement', ds: 'ent-cashflow', role: 'ADMIN' },
    { id: 'ent-03', cat: 'ENTERPRISE', title: 'Unified Balance Sheet', ds: 'ent-balancesheet', role: 'ADMIN' },
    { id: 'ent-04', cat: 'ENTERPRISE', title: 'Revenue by Business Unit Comparison', ds: 'ent-revenue-compare', role: 'ADMIN' },
    { id: 'ent-05', cat: 'ENTERPRISE', title: 'Unified Customer Ledger (All Modules)', ds: 'ent-customer-ledger', role: 'ADMIN' },
    { id: 'ent-06', cat: 'ENTERPRISE', title: 'Unified Expense Report (All Modules)', ds: 'ent-expense', role: 'ADMIN' },
    { id: 'ent-07', cat: 'ENTERPRISE', title: 'Unified Audit Trail (All Modules)', ds: 'ent-audit', role: 'OWNER' },
];

const renderReports = (moduleName, data) => {
    let output = `import type { ReportDefinition } from './ReportRegistry';\n\n`;
    output += `export const ${moduleName}_REPORTS: ReportDefinition[] = [\n`;
    
    data.forEach(r => {
        output += `    {
        id: '${r.id}',
        title: '${r.title}',
        description: '${r.title} covering all transactions.',
        category: '${r.cat}',
        module: '${moduleName === 'ENTERPRISE' ? 'ALL' : moduleName}',
        requiredRole: '${r.role}',
        exportFormats: ['EXCEL', 'PDF'],
        supportsSchedule: true,
        showTotals: true,
        dataSource: '${r.ds}',
        columns: ${generateColumns(r.cat)}
    },\n`;
    });
    
    output += `];\n`;
    return output;
};

fs.writeFileSync('src/pages/reports/ReportRegistryCNG.ts', renderReports('CNG', cngReportsData));
fs.writeFileSync('src/pages/reports/ReportRegistryLube.ts', renderReports('LUBE', lubeReportsData));
fs.writeFileSync('src/pages/reports/ReportRegistryEnterprise.ts', renderReports('ENTERPRISE', enterpriseReportsData));

console.log('Successfully generated 117 report definitions in separate files.');
