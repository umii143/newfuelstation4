// ============================================
// CUSTOMERS PAGE - Entity with Ledger System
// Following Master Principle: Balance = Calculated from Ledger
// ============================================

import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useCustomerStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { useCustomerLedgerStore } from '@/stores/ledgerStore';
import type { Customer, CustomerLedgerEntry } from '@/types';
import clsx from 'clsx';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    CreditCard,
    DollarSign,
    FileText,
    History,
    Phone,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    User,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

// Helper functions
const formatCurrency = (amount: number): string => {
    return `₨${Math.abs(amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Tab types
type CustomerTab = 'overview' | 'ledger' | 'sales' | 'recoveries' | 'aging';

export const CustomersPage: React.FC = () => {
    const { customers } = useCustomerStore();
    const {
        entries: ledgerEntries,
        getCustomerLedger,
        getCustomerBalance,
        getCustomerAging,
        
    } = useCustomerLedgerStore();
    const {} = useFuelStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<CustomerTab>('overview');

    // Add Customer Form State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        cnic: '',
        creditLimit: 50000,
        paymentTerms: 'NET_30' as Customer['paymentTerms'],
    });

    const { addCustomer } = useCustomerStore();

    // Credit & Recovery Modal State
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [creditForm, setCreditForm] = useState({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        remarks: '',
    });
    const [recoveryForm, setRecoveryForm] = useState({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentRef: '',
        remarks: '',
    });

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) return;

        addCustomer({
            ...newCustomer,
            stationId: 'STN-001',
            status: 'ACTIVE', businessUnit: 'FUEL' as const,
        });

        setIsAddModalOpen(false);
        setNewCustomer({
            name: '',
            phone: '',
            email: '',
            cnic: '',
            creditLimit: 50000,
            paymentTerms: 'NET_30',
        });
    };

    // Filter customers
    const filteredCustomers = customers.filter(
        customer =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery)
    );

    // Calculate total stats using ledger
    const totalReceivables = customers.reduce(
        (sum, c) => sum + getCustomerBalance(c.customerId),
        0
    );
    const overCreditLimit = customers.filter(
        c => getCustomerBalance(c.customerId) > c.creditLimit
    ).length;
    const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;

    // Open customer detail
    const openCustomerDetail = (customer: Customer) => {
        setSelectedCustomer(customer);
        setActiveTab('overview');
        setIsDetailModalOpen(true);
    };

    // Get customer ledger entries
    const getCustomerLedgerEntries = (customerId: string): CustomerLedgerEntry[] => {
        return getCustomerLedger(customerId);
    };

    // Get sales entries only
    const getSalesEntries = (customerId: string): CustomerLedgerEntry[] => {
        return getCustomerLedger(customerId, { type: 'CREDIT_SALE' });
    };

    // Get recovery entries only
    const getRecoveryEntries = (customerId: string): CustomerLedgerEntry[] => {
        return getCustomerLedger(customerId, { type: 'RECOVERY' });
    };

    // Render tab content
    const renderTabContent = () => {
        if (!selectedCustomer) return null;

        const balance = getCustomerBalance(selectedCustomer.customerId);
        const aging = getCustomerAging(selectedCustomer.customerId);
        const ledger = getCustomerLedgerEntries(selectedCustomer.customerId);
        const sales = getSalesEntries(selectedCustomer.customerId);
        const recoveries = getRecoveryEntries(selectedCustomer.customerId);

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Balance Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400 uppercase tracking-wide font-medium">
                                        Current Balance
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-4xl font-bold mt-1',
                                            balance > 0 ? 'text-rose-500' : 'text-emerald-500'
                                        )}
                                    >
                                        {formatCurrency(balance)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                                        {balance > 0
                                            ? 'Amount receivable'
                                            : balance < 0
                                              ? 'Advance received'
                                              : 'No outstanding balance'}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                        <ArrowUpRight className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Total Credit Sales
                                        </p>
                                        <p className="text-lg font-bold text-rose-500">
                                            {formatCurrency(
                                                sales.reduce((sum, s) => sum + s.debit, 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Total Recovered
                                        </p>
                                        <p className="text-lg font-bold text-emerald-500">
                                            {formatCurrency(
                                                recoveries.reduce((sum, r) => sum + r.credit, 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Credit Info */}
                        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                                Credit Information
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">
                                        Credit Limit
                                    </span>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        {formatCurrency(selectedCustomer.creditLimit)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">
                                        Available Credit
                                    </span>
                                    <span
                                        className={clsx(
                                            'font-medium',
                                            selectedCustomer.creditLimit - balance > 0
                                                ? 'text-emerald-500'
                                                : 'text-rose-500'
                                        )}
                                    >
                                        {formatCurrency(
                                            Math.max(0, selectedCustomer.creditLimit - balance)
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">
                                        Utilization
                                    </span>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        {((balance / selectedCustomer.creditLimit) * 100).toFixed(
                                            1
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                    <div
                                        className={clsx(
                                            'h-full rounded-full transition-all',
                                            balance / selectedCustomer.creditLimit > 0.9
                                                ? 'bg-rose-500'
                                                : balance / selectedCustomer.creditLimit > 0.7
                                                  ? 'bg-amber-500'
                                                  : 'bg-emerald-500'
                                        )}
                                        style={{
                                            width: `${Math.min(100, (balance / selectedCustomer.creditLimit) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                                Recent Activity
                            </h4>
                            <div className="space-y-2">
                                {ledger
                                    .slice(-3)
                                    .reverse()
                                    .map(entry => (
                                        <div
                                            key={entry.id}
                                            className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={clsx(
                                                        'w-8 h-8 rounded-lg flex items-center justify-center',
                                                        entry.debit > 0
                                                            ? 'bg-rose-500/20'
                                                            : 'bg-emerald-500/20'
                                                    )}
                                                >
                                                    {entry.debit > 0 ? (
                                                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                                        {entry.type.replace('_', ' ')}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={clsx(
                                                    'font-semibold',
                                                    entry.debit > 0
                                                        ? 'text-rose-500'
                                                        : 'text-emerald-500'
                                                )}
                                            >
                                                {entry.debit > 0 ? '+' : '-'}
                                                {formatCurrency(entry.debit || entry.credit)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                );

            case 'ledger':
                return (
                    <div className="space-y-4">
                        <div className="text-sm text-[var(--text-secondary)] mb-4">
                            Complete transaction history with running balance
                        </div>
                        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                            <table className="w-full">
                                <thead className="bg-[var(--bg-primary)]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Reference
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Debit
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Credit
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Balance
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">
                                            Shift
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {ledger.map(entry => (
                                        <tr
                                            key={entry.id}
                                            className="bg-[var(--bg-elevated)] hover:bg-[var(--bg-primary)] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-[var(--text-primary)]">
                                                    {formatDate(entry.date)}
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    {formatTime(entry.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={entry.debit > 0 ? 'rose' : 'emerald'}>
                                                    {entry.type.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                                {entry.reference}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.debit > 0 && (
                                                    <span className="text-rose-500 font-medium">
                                                        {formatCurrency(entry.debit)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.credit > 0 && (
                                                    <span className="text-emerald-500 font-medium">
                                                        {formatCurrency(entry.credit)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span
                                                    className={clsx(
                                                        'font-bold',
                                                        entry.balance > 0
                                                            ? 'text-rose-500'
                                                            : entry.balance < 0
                                                              ? 'text-emerald-500'
                                                              : 'text-[var(--text-primary)]'
                                                    )}
                                                >
                                                    {formatCurrency(entry.balance)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    <div>{entry.staffName}</div>
                                                    <div className="text-blue-400">
                                                        {entry.shiftId}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'sales':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Credit sales transactions
                            </p>
                            <Badge color="rose">{sales.length} transactions</Badge>
                        </div>
                        {sales.length === 0 ? (
                            <Card className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                                <p className="text-[var(--text-secondary)]">
                                    No credit sales found
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {sales.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                                    <ArrowUpRight className="w-5 h-5 text-rose-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        {entry.fuelType?.replace('_', ' ') ||
                                                            'Credit Sale'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)} •{' '}
                                                        {entry.liters
                                                            ? `${entry.liters}L`
                                                            : entry.reference}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-rose-500">
                                                    +{formatCurrency(entry.debit)}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    {entry.staffName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'recoveries':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Payment & recovery transactions
                            </p>
                            <Badge color="emerald">{recoveries.length} transactions</Badge>
                        </div>
                        {recoveries.length === 0 ? (
                            <Card className="text-center py-12">
                                <DollarSign className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                                <p className="text-[var(--text-secondary)]">No recoveries found</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {recoveries.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                    <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        Recovery
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)} •{' '}
                                                        {entry.receiptNumber || entry.reference}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-emerald-500">
                                                    -{formatCurrency(entry.credit)}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    {entry.staffName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'aging':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                            <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                                Aging Summary
                            </h4>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase mb-1">
                                        Current
                                    </p>
                                    <p className="text-xl font-bold text-emerald-500">
                                        {formatCurrency(aging.current)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        0-30 days
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase mb-1">
                                        30+ Days
                                    </p>
                                    <p className="text-xl font-bold text-amber-500">
                                        {formatCurrency(aging.days30)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        31-60 days
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase mb-1">
                                        60+ Days
                                    </p>
                                    <p className="text-xl font-bold text-orange-500">
                                        {formatCurrency(aging.days60)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        61-90 days
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase mb-1">
                                        90+ Days
                                    </p>
                                    <p className="text-xl font-bold text-rose-500">
                                        {formatCurrency(aging.days90)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)]">Overdue</p>
                                </div>
                            </div>
                        </div>

                        {/* Aging Bar */}
                        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                                Distribution
                            </h4>
                            <div className="h-8 rounded-lg overflow-hidden flex">
                                {aging.total > 0 && (
                                    <>
                                        <div
                                            className="bg-emerald-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                            style={{
                                                width: `${(aging.current / aging.total) * 100}%`,
                                            }}
                                        >
                                            {((aging.current / aging.total) * 100).toFixed(0)}%
                                        </div>
                                        <div
                                            className="bg-amber-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                            style={{
                                                width: `${(aging.days30 / aging.total) * 100}%`,
                                            }}
                                        >
                                            {((aging.days30 / aging.total) * 100).toFixed(0)}%
                                        </div>
                                        <div
                                            className="bg-orange-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                            style={{
                                                width: `${(aging.days60 / aging.total) * 100}%`,
                                            }}
                                        >
                                            {((aging.days60 / aging.total) * 100).toFixed(0)}%
                                        </div>
                                        <div
                                            className="bg-rose-500 h-full flex items-center justify-center text-xs text-white font-medium"
                                            style={{
                                                width: `${(aging.days90 / aging.total) * 100}%`,
                                            }}
                                        >
                                            {((aging.days90 / aging.total) * 100).toFixed(0)}%
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Customers"
                subtitle="Manage customer accounts with full ledger history"
                actions={
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add Customer
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Receivables */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 uppercase tracking-wide font-medium">
                                Total Receivables
                            </p>
                            <p className="text-2xl font-bold text-blue-500">
                                {formatCurrency(totalReceivables)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>From ledger calculations</span>
                    </div>
                </div>

                {/* Active Customers */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                                Active Customers
                            </p>
                            <p className="text-2xl font-bold text-emerald-500">{activeCustomers}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>of {customers.length} total</span>
                    </div>
                </div>

                {/* Over Credit Limit */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-rose-400 uppercase tracking-wide font-medium">
                                Over Limit
                            </p>
                            <p className="text-2xl font-bold text-rose-500">{overCreditLimit}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Need attention</span>
                    </div>
                </div>

                {/* Today's Transactions */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-amber-400 uppercase tracking-wide font-medium">
                                Ledger Entries
                            </p>
                            <p className="text-2xl font-bold text-amber-500">
                                {ledgerEntries.length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Total transactions</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                    type="text"
                    placeholder="Search customers by name or phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
            </div>

            {/* Customer List */}
            <div className="grid gap-3">
                {filteredCustomers.length === 0 ? (
                    <Card className="text-center py-12">
                        <User className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                        <p className="text-[var(--text-secondary)]">No customers found</p>
                    </Card>
                ) : (
                    filteredCustomers.map(customer => {
                        const balance = getCustomerBalance(customer.customerId);
                        const isOverLimit = balance > customer.creditLimit;

                        return (
                            <div
                                key={customer.customerId}
                                onClick={() => openCustomerDetail(customer)}
                                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={clsx(
                                                'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg',
                                                isOverLimit
                                                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30'
                                                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30'
                                            )}
                                        >
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[var(--text-primary)]">
                                                    {customer.name}
                                                </h3>
                                                <Badge
                                                    color={
                                                        customer.status === 'ACTIVE'
                                                            ? 'emerald'
                                                            : 'rose'
                                                    }
                                                >
                                                    {customer.status}
                                                </Badge>
                                                {isOverLimit && (
                                                    <Badge color="rose">Over Limit</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Phone size={14} /> {customer.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CreditCard size={14} /> Limit:{' '}
                                                    {formatCurrency(customer.creditLimit)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-[var(--text-secondary)] uppercase">
                                                Balance
                                            </p>
                                            <p
                                                className={clsx(
                                                    'text-xl font-bold',
                                                    balance > 0
                                                        ? 'text-rose-500'
                                                        : balance < 0
                                                          ? 'text-emerald-500'
                                                          : 'text-[var(--text-primary)]'
                                                )}
                                            >
                                                {formatCurrency(balance)}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Customer Detail Modal */}
            {isDetailModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-blue-500/10 to-indigo-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                            {selectedCustomer.name}
                                        </h2>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {selectedCustomer.phone}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                                {[
                                    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
                                    { id: 'ledger', label: 'Ledger', icon: <FileText size={16} /> },
                                    {
                                        id: 'sales',
                                        label: 'Sales',
                                        icon: <ArrowUpRight size={16} />,
                                    },
                                    {
                                        id: 'recoveries',
                                        label: 'Recoveries',
                                        icon: <ArrowDownRight size={16} />,
                                    },
                                    { id: 'aging', label: 'Aging', icon: <Calendar size={16} /> },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as CustomerTab)}
                                        className={clsx(
                                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                                            activeTab === tab.id
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">{renderTabContent()}</div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[var(--border)] flex justify-between">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Close
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsCreditModalOpen(true)}
                                >
                                    <ArrowUpRight size={18} /> Add Credit
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsRecoveryModalOpen(true)}
                                >
                                    <ArrowDownRight size={18} /> Record Recovery
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Credit Modal */}
            {isCreditModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-orange-500/10 to-amber-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Add Credit Sale
                            </h2>
                            <button
                                onClick={() => setIsCreditModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Invoice Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="CR-..."
                                    value={creditForm.invoiceNumber}
                                    onChange={e =>
                                        setCreditForm({
                                            ...creditForm,
                                            invoiceNumber: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Amount (₨) *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={creditForm.amount}
                                        onChange={e =>
                                            setCreditForm({
                                                ...creditForm,
                                                amount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={creditForm.date}
                                        onChange={e =>
                                            setCreditForm({ ...creditForm, date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Remarks
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    rows={3}
                                    value={creditForm.remarks}
                                    onChange={e =>
                                        setCreditForm({ ...creditForm, remarks: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsCreditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    useCustomerLedgerStore.getState().addEntry({
                                        customerId: selectedCustomer.customerId,
                                        customerName: selectedCustomer.name,
                                        date: creditForm.date,
                                        shiftId: 'ADMIN-ENTRY',
                                        type: 'CREDIT_SALE',
                                        reference: creditForm.invoiceNumber,
                                        invoiceNumber: creditForm.invoiceNumber,
                                        debit: creditForm.amount,
                                        credit: 0,
                                        remarks: creditForm.remarks,
                                        staffId: 'OWNER',
                                        staffName: 'Admin',
                                    });
                                    setIsCreditModalOpen(false);
                                }}
                                disabled={!creditForm.amount}
                            >
                                <Plus size={18} /> Add Credit
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Recovery Modal */}
            {isRecoveryModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Record Recovery
                            </h2>
                            <button
                                onClick={() => setIsRecoveryModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Amount (₨) *
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={recoveryForm.amount}
                                        onChange={e =>
                                            setRecoveryForm({
                                                ...recoveryForm,
                                                amount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={recoveryForm.date}
                                        onChange={e =>
                                            setRecoveryForm({
                                                ...recoveryForm,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Payment Reference (Cheque # / Trans ID)
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="REC-..."
                                    value={recoveryForm.paymentRef}
                                    onChange={e =>
                                        setRecoveryForm({
                                            ...recoveryForm,
                                            paymentRef: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Remarks
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border(--border)]"
                                    rows={3}
                                    value={recoveryForm.remarks}
                                    onChange={e =>
                                        setRecoveryForm({
                                            ...recoveryForm,
                                            remarks: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsRecoveryModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    useCustomerLedgerStore.getState().addEntry({
                                        customerId: selectedCustomer.customerId,
                                        customerName: selectedCustomer.name,
                                        date: recoveryForm.date,
                                        shiftId: 'ADMIN-ENTRY',
                                        type: 'RECOVERY',
                                        reference: recoveryForm.paymentRef,
                                        receiptNumber: recoveryForm.paymentRef,
                                        debit: 0,
                                        credit: recoveryForm.amount,
                                        remarks: recoveryForm.remarks,
                                        staffId: 'OWNER',
                                        staffName: 'Admin',
                                    });
                                    setIsRecoveryModalOpen(false);
                                }}
                                disabled={!recoveryForm.amount}
                            >
                                <Plus size={18} /> Record Recovery
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Customer Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-blue-500/10 to-indigo-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Add New Customer
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="e.g. Ahmad Traders"
                                    value={newCustomer.name}
                                    onChange={e =>
                                        setNewCustomer({ ...newCustomer, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        placeholder="0300-..."
                                        value={newCustomer.phone}
                                        onChange={e =>
                                            setNewCustomer({
                                                ...newCustomer,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        CNIC
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        placeholder="12345-..."
                                        value={newCustomer.cnic}
                                        onChange={e =>
                                            setNewCustomer({ ...newCustomer, cnic: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Credit Limit (₨)
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    value={newCustomer.creditLimit}
                                    onChange={e =>
                                        setNewCustomer({
                                            ...newCustomer,
                                            creditLimit: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Payment Terms
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    value={newCustomer.paymentTerms}
                                    onChange={e =>
                                        setNewCustomer({
                                            ...newCustomer,
                                            paymentTerms: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="NET_15">Net 15</option>
                                    <option value="NET_30">Net 30</option>
                                    <option value="NET_60">Net 60</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddCustomer}
                                disabled={!newCustomer.name || !newCustomer.phone}
                            >
                                <Plus size={18} /> Create Customer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;
