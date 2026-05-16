// ============================================
// SUPPLIERS PAGE - Entity with Ledger System
// Following Master Principle: Payable = Calculated from Ledger
// ============================================

import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useSupplierStore } from '@/stores/dataStores';
import { useSettingsStore } from '@/stores/authStore';
import { useSupplierLedgerStore } from '@/stores/ledgerStore';
import type { Supplier, SupplierLedgerEntry } from '@/types';
import clsx from 'clsx';
import {
    Building,
    Calendar,
    ChevronRight,
    DollarSign,
    FileText,
    Package,
    Phone,
    Plus,
    Search,
    TrendingDown,
    TrendingUp,
    Truck,
    User,
    Wallet,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { SkeletonKPI, SkeletonList } from '@/components/shared/skeletons/SkeletonList';
import { EmptyState } from '@/components/ui/EmptyState';

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
type SupplierTab = 'overview' | 'ledger' | 'purchases' | 'payments' | 'aging';

export const SuppliersPage: React.FC = () => {
    const { settings } = useSettingsStore();
    const { getFilteredSuppliers, addSupplier, isLoading: isSuppliersLoading, error: storeError } = useSupplierStore();
    const {
        entries: ledgerEntries,
        getSupplierLedger,
        getSupplierPayable,
        getSupplierAging,
        isLoading: isLedgerLoading
    } = useSupplierLedgerStore();
    const isGlobalLoading = isSuppliersLoading || isLedgerLoading;
    const [localError, setLocalError] = useState<string | null>(null);

    // Safely get payable
    const safeGetPayable = (id: string) => {
        try {
            return getSupplierPayable(id) || 0;
        } catch (e) {
            console.error('Error getting payable for', id, e);
            return 0;
        }
    };

    // Safely get aging
    const safeGetAging = (id: string) => {
        try {
            return (
                getSupplierAging(id) || {
                    current: 0,
                    days30: 0,
                    days60: 0,
                    days90: 0,
                    total: 0,
                }
            );
        } catch (e) {
            console.error('Error getting aging for', id, e);
            return {
                current: 0,
                days30: 0,
                days60: 0,
                days90: 0,
                total: 0,
            };
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SupplierTab>('overview');
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Form States
    const [purchaseForm, setPurchaseForm] = useState({
        invoiceNumber: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        remarks: '',
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentRef: '',
        remarks: '',
    });

    // Add Supplier Form State
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        type: 'FUEL_SUPPLIER' as Supplier['type'],
        paymentTerms: 'NET_30' as Supplier['paymentTerms'],
    });

    const handleAddSupplier = async () => {
        if (!newSupplier.name || !newSupplier.phone) return;

        setLocalError(null);
        try {
            await addSupplier({
                ...newSupplier,
                stationId: 'STN-001',
                rating: 5.0,
                status: 'ACTIVE',
                businessUnit: settings.businessUnit,
            });

            setIsAddModalOpen(false);
            setNewSupplier({
                name: '',
                contactPerson: '',
                phone: '',
                email: '',
                type: 'FUEL_SUPPLIER',
                paymentTerms: 'NET_30',
            });
        } catch (error: any) {
            setLocalError(error.message || 'Failed to add supplier');
        }
    };

    // Filter suppliers with safe handling for name/phone
    const filteredSuppliers = getFilteredSuppliers().filter(
        s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const suppliers = getFilteredSuppliers();

    // Safe calculations with array checks and null guards
    const totalPayables = Array.isArray(suppliers)
        ? suppliers.reduce((sum, s) => sum + (s?.supplierId ? safeGetPayable(s.supplierId) : 0), 0)
        : 0;

    const activeSuppliers = Array.isArray(suppliers)
        ? suppliers.filter(s => s?.status === 'ACTIVE').length
        : 0;

    const overduePayables = Array.isArray(suppliers)
        ? suppliers.filter(s => {
              if (!s?.supplierId) return false;
              const aging = safeGetAging(s.supplierId);
              return (aging?.days90 || 0) > 0;
          }).length
        : 0;

    // Open supplier detail
    const openSupplierDetail = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setActiveTab('overview');
        setIsDetailModalOpen(true);
    };

    // Get supplier ledger entries
    const getSupplierLedgerEntries = (supplierId: string): SupplierLedgerEntry[] => {
        return getSupplierLedger(supplierId);
    };

    // Get purchase entries only
    const getPurchaseEntries = (supplierId: string): SupplierLedgerEntry[] => {
        return getSupplierLedger(supplierId, { type: 'PURCHASE' });
    };

    // Get payment entries only
    const getPaymentEntries = (supplierId: string): SupplierLedgerEntry[] => {
        if (!supplierId) return [];
        return getSupplierLedger(supplierId, { type: 'PAYMENT' });
    };

    // Render tab content
    const renderTabContent = () => {
        if (!selectedSupplier) return null;

        const payable = safeGetPayable(selectedSupplier.supplierId);
        const aging = safeGetAging(selectedSupplier.supplierId);
        const ledger = getSupplierLedgerEntries(selectedSupplier.supplierId) || [];
        const purchases = getPurchaseEntries(selectedSupplier.supplierId) || [];
        const payments = getPaymentEntries(selectedSupplier.supplierId) || [];

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Payable Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-400 uppercase tracking-wide font-medium">
                                        Payable Amount
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-4xl font-bold mt-1',
                                            payable > 0 ? 'text-orange-500' : 'text-emerald-500'
                                        )}
                                    >
                                        {formatCurrency(payable)}
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                                        {payable > 0
                                            ? 'Amount owed to supplier'
                                            : payable < 0
                                              ? 'Advance paid'
                                              : 'No outstanding balance'}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Total Purchases
                                        </p>
                                        <p className="text-lg font-bold text-blue-500">
                                            {formatCurrency(
                                                purchases.reduce((sum, p) => sum + p.credit, 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Total Paid
                                        </p>
                                        <p className="text-lg font-bold text-emerald-500">
                                            {formatCurrency(
                                                payments.reduce((sum, p) => sum + p.debit, 0)
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Info */}
                        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                                Supplier Details
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Type</span>
                                    <Badge color="blue">
                                        {(selectedSupplier.type || 'UNKNOWN').replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Phone</span>
                                    <span className="font-medium text-[var(--text-primary)]">
                                        {selectedSupplier.phone}
                                    </span>
                                </div>
                                {selectedSupplier.address && (
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">
                                            Address
                                        </span>
                                        <span className="font-medium text-[var(--text-primary)] text-right max-w-xs">
                                            {selectedSupplier.address}
                                        </span>
                                    </div>
                                )}
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
                                                        entry.credit > 0
                                                            ? 'bg-blue-500/20'
                                                            : 'bg-emerald-500/20'
                                                    )}
                                                >
                                                    {entry.credit > 0 ? (
                                                        <Package className="w-4 h-4 text-blue-500" />
                                                    ) : (
                                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                                        {(entry.type || 'UNKNOWN').replace(
                                                            '_',
                                                            ' '
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={clsx(
                                                    'font-semibold',
                                                    entry.credit > 0
                                                        ? 'text-blue-500'
                                                        : 'text-emerald-500'
                                                )}
                                            >
                                                {entry.credit > 0 ? '+' : '-'}
                                                {formatCurrency(entry.credit || entry.debit)}
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
                            Complete transaction history with running payable balance
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
                                                <Badge
                                                    color={entry.credit > 0 ? 'blue' : 'emerald'}
                                                >
                                                    {(entry.type || 'UNKNOWN').replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                                {entry.invoiceNumber || entry.reference}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.debit > 0 && (
                                                    <span className="text-emerald-500 font-medium">
                                                        {formatCurrency(entry.debit)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.credit > 0 && (
                                                    <span className="text-blue-500 font-medium">
                                                        {formatCurrency(entry.credit)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span
                                                    className={clsx(
                                                        'font-bold',
                                                        entry.balance > 0
                                                            ? 'text-orange-500'
                                                            : 'text-emerald-500'
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

            case 'purchases':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Purchase invoices received
                            </p>
                            <Badge color="blue">{purchases.length} invoices</Badge>
                        </div>
                        {purchases.length === 0 ? (
                            <Card className="text-center py-12">
                                <Package className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                                <p className="text-[var(--text-secondary)]">No purchases found</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {purchases.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        {entry.invoiceNumber || 'Purchase'}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)}
                                                        {entry.dueDate &&
                                                            ` • Due: ${formatDate(entry.dueDate)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-blue-500">
                                                    +{formatCurrency(entry.credit)}
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

            case 'payments':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[var(--text-secondary)]">
                                Payment transactions
                            </p>
                            <Badge color="emerald">{payments.length} payments</Badge>
                        </div>
                        {payments.length === 0 ? (
                            <Card className="text-center py-12">
                                <DollarSign className="w-12 h-12 mx-auto text-[var(--text-secondary)] mb-3" />
                                <p className="text-[var(--text-secondary)]">No payments found</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {payments.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        Payment
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {formatDate(entry.date)} •{' '}
                                                        {entry.paymentRef || entry.reference}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-emerald-500">
                                                    -{formatCurrency(entry.debit)}
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
                title="Suppliers"
                subtitle="Manage fuel and lube suppliers with integrated ledger"
                actions={
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add Supplier
                    </Button>
                }
            />

            {/* Summary Cards */}
            {isGlobalLoading ? (
                <SkeletonKPI count={4} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Payables */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-orange-400 uppercase tracking-wide font-medium">
                                Total Payables
                            </p>
                            <p className="text-2xl font-bold text-orange-500">
                                {formatCurrency(totalPayables)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <span>From ledger calculations</span>
                    </div>
                </div>

                {/* Active Suppliers */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                                Active Suppliers
                            </p>
                            <p className="text-2xl font-bold text-emerald-500">{activeSuppliers}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>of {suppliers.length} total</span>
                    </div>
                </div>

                {/* Overdue */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-rose-400 uppercase tracking-wide font-medium">
                                Overdue
                            </p>
                            <p className="text-2xl font-bold text-rose-500">{overduePayables}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Need payment</span>
                    </div>
                </div>

                {/* Ledger Entries */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-400 uppercase tracking-wide font-medium">
                                Ledger Entries
                            </p>
                            <p className="text-2xl font-bold text-blue-500">
                                {ledgerEntries.length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Total transactions</span>
                    </div>
                </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                <input
                    type="text"
                    placeholder="Search suppliers by name or phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
            </div>

            {/* Supplier List */}
            <div className="grid gap-3">
                {isGlobalLoading ? (
                    <SkeletonList count={5} />
                ) : filteredSuppliers.length === 0 ? (
                    <EmptyState
                        icon={<Building />}
                        title="No Suppliers Found"
                        description="Record your fuel and lube suppliers to manage payables, purchases, and payments."
                        actionLabel="Add Supplier"
                        onAction={() => setIsAddModalOpen(true)}
                    />
                ) : (
                    filteredSuppliers.map(supplier => {
                        const payable = safeGetPayable(supplier.supplierId);
                        const aging = safeGetAging(supplier.supplierId);
                        const isOverdue = aging.days90 > 0;

                        return (
                            <div
                                key={supplier.supplierId}
                                onClick={() => openSupplierDetail(supplier)}
                                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={clsx(
                                                'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg',
                                                isOverdue
                                                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30'
                                                    : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30'
                                            )}
                                        >
                                            {(supplier.name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[var(--text-primary)]">
                                                    {supplier.name}
                                                </h3>
                                                <Badge
                                                    color={
                                                        supplier.status === 'ACTIVE'
                                                            ? 'emerald'
                                                            : 'rose'
                                                    }
                                                >
                                                    {supplier.status}
                                                </Badge>
                                                {(supplier.type || 'UNKNOWN').replace('_', ' ')}
                                                {isOverdue && <Badge color="rose">Overdue</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Phone size={14} /> {supplier.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-[var(--text-secondary)] uppercase">
                                                Payable
                                            </p>
                                            <p
                                                className={clsx(
                                                    'text-xl font-bold',
                                                    payable > 0
                                                        ? 'text-orange-500'
                                                        : payable < 0
                                                          ? 'text-emerald-500'
                                                          : 'text-[var(--text-primary)]'
                                                )}
                                            >
                                                {formatCurrency(payable)}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Supplier Detail Modal */}
            {isDetailModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-orange-500/10 to-amber-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
                                        {(selectedSupplier.name || '?').charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                            {selectedSupplier.name}
                                        </h2>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {selectedSupplier.phone}
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
                                        id: 'purchases',
                                        label: 'Purchases',
                                        icon: <Package size={16} />,
                                    },
                                    {
                                        id: 'payments',
                                        label: 'Payments',
                                        icon: <DollarSign size={16} />,
                                    },
                                    { id: 'aging', label: 'Aging', icon: <Calendar size={16} /> },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as SupplierTab)}
                                        className={clsx(
                                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                                            activeTab === tab.id
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
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
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {renderTabContent() || (
                                <div className="text-center py-12 text-[var(--text-secondary)]">
                                    No content available for this tab.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[var(--border)] flex justify-between">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Close
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsPurchaseModalOpen(true)}
                                >
                                    <Package size={18} /> Add Purchase
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsPaymentModalOpen(true)}
                                >
                                    <DollarSign size={18} /> Record Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Purchase Modal */}
            {isPurchaseModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-blue-500/10 to-indigo-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Record Purchase
                            </h2>
                            <button
                                onClick={() => setIsPurchaseModalOpen(false)}
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
                                    placeholder="INV-..."
                                    value={purchaseForm.invoiceNumber}
                                    onChange={e =>
                                        setPurchaseForm({
                                            ...purchaseForm,
                                            invoiceNumber: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Amount (₨)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        value={purchaseForm.amount}
                                        onChange={e =>
                                            setPurchaseForm({
                                                ...purchaseForm,
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
                                        value={purchaseForm.date}
                                        onChange={e =>
                                            setPurchaseForm({
                                                ...purchaseForm,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Due Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    value={purchaseForm.dueDate}
                                    onChange={e =>
                                        setPurchaseForm({
                                            ...purchaseForm,
                                            dueDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Remarks
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    rows={3}
                                    value={purchaseForm.remarks}
                                    onChange={e =>
                                        setPurchaseForm({
                                            ...purchaseForm,
                                            remarks: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsPurchaseModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    useSupplierLedgerStore.getState().addEntry({
                                        supplierId: selectedSupplier.supplierId,
                                        supplierName: selectedSupplier.name,
                                        date: purchaseForm.date,
                                        shiftId: 'ADMIN-ENTRY',
                                        type: 'PURCHASE',
                                        reference: purchaseForm.invoiceNumber,
                                        invoiceNumber: purchaseForm.invoiceNumber,
                                        dueDate: purchaseForm.dueDate,
                                        debit: 0,
                                        credit: purchaseForm.amount,
                                        remarks: purchaseForm.remarks,
                                        staffId: 'OWNER',
                                        staffName: 'Admin',
                                    });
                                    setIsPurchaseModalOpen(false);
                                }}
                                disabled={!purchaseForm.amount}
                            >
                                <Plus size={18} className="mr-2" />
                                Record Expense
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {isPaymentModalOpen && selectedSupplier && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Record Payment
                            </h2>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
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
                                        value={paymentForm.amount}
                                        onChange={e =>
                                            setPaymentForm({
                                                ...paymentForm,
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
                                        value={paymentForm.date}
                                        onChange={e =>
                                            setPaymentForm({ ...paymentForm, date: e.target.value })
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
                                    placeholder="CHQ-..."
                                    value={paymentForm.paymentRef}
                                    onChange={e =>
                                        setPaymentForm({
                                            ...paymentForm,
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
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    rows={3}
                                    value={paymentForm.remarks}
                                    onChange={e =>
                                        setPaymentForm({ ...paymentForm, remarks: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setIsPaymentModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    useSupplierLedgerStore.getState().addEntry({
                                        supplierId: selectedSupplier.supplierId,
                                        supplierName: selectedSupplier.name,
                                        date: paymentForm.date,
                                        shiftId: 'ADMIN-ENTRY',
                                        type: 'PAYMENT',
                                        reference: paymentForm.paymentRef,
                                        paymentRef: paymentForm.paymentRef,
                                        debit: paymentForm.amount,
                                        credit: 0,
                                        remarks: paymentForm.remarks,
                                        staffId: 'OWNER',
                                        staffName: 'Admin',
                                    });
                                    setIsPaymentModalOpen(false);
                                }}
                                disabled={!paymentForm.amount}
                            >
                                <Plus size={18} /> Record Payment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Supplier Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-orange-500/10 to-amber-500/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Add New Supplier
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(localError || storeError) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold uppercase tracking-widest animate-shake">
                                    {localError || storeError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Supplier Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    placeholder="e.g. Shell Pakistan"
                                    value={newSupplier.name}
                                    onChange={e =>
                                        setNewSupplier({ ...newSupplier, name: e.target.value })
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
                                        placeholder="042-..."
                                        value={newSupplier.phone}
                                        onChange={e =>
                                            setNewSupplier({
                                                ...newSupplier,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                        placeholder="Name"
                                        value={newSupplier.contactPerson}
                                        onChange={e =>
                                            setNewSupplier({
                                                ...newSupplier,
                                                contactPerson: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Supplier Type
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    value={newSupplier.type}
                                    onChange={e =>
                                        setNewSupplier({
                                            ...newSupplier,
                                            type: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="FUEL_SUPPLIER">Fuel Supplier</option>
                                    <option value="LUBE_SUPPLIER">Lube Supplier</option>
                                    <option value="GENERAL_SUPPLIER">General Supplier</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">
                                    Payment Terms
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]"
                                    value={newSupplier.paymentTerms}
                                    onChange={e =>
                                        setNewSupplier({
                                            ...newSupplier,
                                            paymentTerms: e.target.value as any,
                                        })
                                    }
                                >
                                    <option value="NET_30">Net 30</option>
                                    <option value="NET_60">Net 60</option>
                                    <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddSupplier}
                                disabled={!newSupplier.name || !newSupplier.phone}
                            >
                                <Plus size={18} /> Create Supplier
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;
