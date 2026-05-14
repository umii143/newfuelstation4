import {
    DollarSign,
    FileText,
    Fuel,
    Gauge,
    LayoutDashboard,
    Package,
    Settings,
    Shield,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';
import React from 'react';

export interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    subItems?: { label: string; path: string }[];
}

export const fuelNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
        label: 'Fuel Management',
        path: '/fuel',
        icon: Fuel,
        subItems: [
            { label: 'Shift Control', path: '/fuel/shift-dashboard' }, // New manual shift flow
            { label: 'Station Master', path: '/fuel/station-master' },
            { label: 'Shift Wizard', path: '/fuel/shifts' }, // Main entry point
            { label: 'Shift Logs', path: '/fuel/activity' }, // Historical view
            { label: 'Tank Levels', path: '/fuel/tanks' },
            { label: 'Dip Management', path: '/fuel/dips' },
            { label: 'Price Management', path: '/fuel/pricing' },
            { label: 'Purchase Orders', path: '/fuel/orders' },
        ],
    },
    {
        label: 'Financials',
        path: '/financials',
        icon: DollarSign,
        subItems: [
            { label: 'Cash & Banks', path: '/cash-banks' },
            { label: 'Digital Payments', path: '/digital-cash' }, // Direct link
            { label: 'Expenses', path: '/expenses' },
            { label: 'Customer Accounts', path: '/customers' }, // Renamed for clarity
            { label: 'Supplier Accounts', path: '/suppliers' },
            { label: 'Reconciliation', path: '/financials/reconciliation' },
            { label: 'Financial Intelligence', path: '/financials/intelligence' },
        ],
    },
    {
        label: 'Staff',
        path: '/staff',
        icon: Users,
        subItems: [
            { label: 'Attendance', path: '/staff/attendance' },
            { label: 'Performance', path: '/staff/performance' },
            { label: 'Payroll & Accounts', path: '/staff/accounts' }, // Financial context
            { label: 'Manage Staff', path: '/staff' }, // CRUD operations
        ],
    },
    {
        label: 'Intelligence',
        path: '/fuel/reports',
        icon: Shield,
        subItems: [
            { label: 'Master Register', path: '/fuel/reports' },
            { label: 'Security Hub', path: '/security' },
            { label: 'Shared Reports', path: '/reports' },
            { label: 'Rate Impact', path: '/rate-impact' },
        ],
    },
    { label: 'Settings', path: '/settings', icon: Settings },
];

export const cngNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: Gauge },
    {
        label: 'CNG Operations',
        path: '/cng',
        icon: Zap,
        subItems: [
            { label: 'Shift Operations', path: '/cng/shifts' },
            { label: 'Shift Logs', path: '/cng/activity' },
            { label: 'Gas Inventory', path: '/cng/tanks' },
            { label: 'Rate Management', path: '/cng/rates' },
        ],
    },
    {
        label: 'Financials',
        path: '/cng/financials',
        icon: DollarSign,
        subItems: [
            { label: 'Cash & Banks', path: '/cng/banks' },
            { label: 'Digital Payments', path: '/digital-cash' },
            { label: 'Discounts', path: '/cng/discounts' },
            { label: 'Expenses', path: '/expenses' }, // Shared ? or /cng/expenses? sticking to shared for now unless scoped
            { label: 'Customer Accounts', path: '/customers' },
            { label: 'Supplier Accounts', path: '/suppliers' },
            { label: 'Reconciliation', path: '/financials/reconciliation' },
            { label: 'Financial Intelligence', path: '/financials/intelligence' },
        ],
    },
    {
        label: 'Staff',
        path: '/cng/staff',
        icon: Users,
        subItems: [
            { label: 'Attendance', path: '/staff/attendance' },
            { label: 'Performance', path: '/staff/performance' },
            { label: 'Payroll & Accounts', path: '/staff/accounts' },
            { label: 'Manage Staff', path: '/staff' },
        ],
    },
    {
        label: 'Intelligence',
        path: '/cng/reports',
        icon: Shield,
        subItems: [
            { label: 'Master Register', path: '/cng/reports' },
            { label: 'Security Hub', path: '/security' },
        ],
    },
    { label: 'Settings', path: '/cng/settings', icon: Settings },
];

export const lubeNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/lube/dashboard', icon: LayoutDashboard },
    { label: 'Point of Sale', path: '/lube/pos', icon: ShoppingCart },
    {
        label: 'Inventory',
        path: '/lube/products',
        icon: Package,
        subItems: [
            { label: 'Products', path: '/lube/products' },
            { label: 'Purchase Orders', path: '/lube/orders' },
            { label: 'Security Hub', path: '/security' },
        ],
    },
    {
        label: 'Sales & Accounts',
        path: '/lube/sales',
        icon: TrendingUp,
        subItems: [
            { label: 'Daily Sales', path: '/lube/reports' },
            { label: 'Credit Customers', path: '/lube/credits' },
            { label: 'Recoveries', path: '/lube/recoveries' },
        ],
    },
    {
        label: 'Management',
        path: '/lube/management',
        icon: Shield,
        subItems: [
            { label: 'Suppliers', path: '/lube/suppliers' },
            { label: 'Expenses', path: '/lube/expenses' },
        ],
    },
    {
        label: 'Financials',
        path: '/lube/financials',
        icon: Wallet,
        subItems: [
            { label: 'Cash & Bank', path: '/lube/cash-bank' },
            { label: 'Daily Closing', path: '/lube/closing' },
        ],
    },
    {
        label: 'Master Register',
        path: '/lube/reports',
        icon: FileText,
    },
    { label: 'Settings', path: '/lube/settings', icon: Settings },
];


