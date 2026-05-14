import { Badge, Button, Card, Input, Modal } from '@/components/ui';
import { ArrowDownUp, Download, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export type TransactionType =
    | 'REVENUE'
    | 'RECOVERY'
    | 'CREDIT'
    | 'EXPENSE'
    | 'SUPPLIER_PAYMENT'
    | 'BANK_DEPOSIT'
    | 'DIGITAL_PAYMENT'
    | 'NOZZLE_SALES'
    | 'TANKER_ARRIVAL'
    | 'DISCOUNT'
    | 'CARRIAGE'
    | 'INAM_TIP'
    | 'TEST_LITERS';

interface BaseTransaction {
    timestamp: string;
    shiftId: string;
    shiftDate: string;
    salesmanName: string;
    amount: number;
}

interface RecoveryTransaction extends BaseTransaction {
    customerName: string;
    paymentMethod?: string;
}

interface CreditTransaction extends BaseTransaction {
    customerName: string;
    liters?: number;
}

interface ExpenseTransaction extends BaseTransaction {
    category: string;
    description?: string;
}

interface SupplierPaymentTransaction extends BaseTransaction {
    supplierName: string;
}

interface BankDepositTransaction extends BaseTransaction {
    bankName: string;
}

interface NozzleSalesTransaction extends BaseTransaction {
    nozzleName: string;
    fuelType: string;
    liters: number;
    rate: number;
    openingReading?: number;
    closingReading?: number;
}

interface TankerArrivalTransaction {
    timestamp: string;
    shiftId: string;
    supplierName: string;
    fuelType: string;
    liters: number;
    costPrice: number;
    totalAmount: number;
    carriage: number;
}

type Transaction =
    | RecoveryTransaction
    | CreditTransaction
    | ExpenseTransaction
    | SupplierPaymentTransaction
    | BankDepositTransaction
    | NozzleSalesTransaction
    | TankerArrivalTransaction;

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: TransactionType;
    title: string;
    data: Transaction[];
    dateRange: { startDate: string; endDate: string };
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
    isOpen,
    onClose,
    type,
    title,
    data,
    dateRange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<string>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const formatCurrency = (value: number) => `₨${(value || 0).toLocaleString()}`;
    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    const formatDateTime = (dateStr: string) =>
        new Date(dateStr).toLocaleString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    const formatLiters = (value: number) => `${(value || 0).toFixed(2)} L`;

    // Filter and sort data
    const filteredData = useMemo(() => {
        const filtered = data.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const itemStr = JSON.stringify(item).toLowerCase();
            return itemStr.includes(searchLower);
        });

        // Sort
        filtered.sort((a: any, b: any) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (typeof aVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return filtered;
    }, [data, searchQuery, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const totalAmount = filteredData.reduce((sum, item: any) => sum + (item.amount || 0), 0);

    const handleExport = () => {
        // Convert to CSV
        const headers = Object.keys(filteredData[0] || {});
        const csv = [
            headers.join(','),
            ...filteredData.map((row: any) =>
                headers.map(h => JSON.stringify(row[h] || '')).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_${formatDate(dateRange.startDate)}.csv`;
        a.click();
    };

    const renderTable = () => {
        switch (type) {
            case 'RECOVERY':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    Date <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('customerName')}
                                >
                                    Customer <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th
                                    className="p-3 text-right cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Salesman</th>
                                <th className="p-3 text-left">Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3 font-bold">{item.customerName}</td>
                                    <td className="p-3 text-right font-bold text-emerald-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3">{item.salesmanName}</td>
                                    <td className="p-3">
                                        <Badge color="blue">{item.paymentMethod || 'CASH'}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'CREDIT':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    Date <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('customerName')}
                                >
                                    Customer <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-right">Liters</th>
                                <th
                                    className="p-3 text-right cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Salesman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3 font-bold">{item.customerName}</td>
                                    <td className="p-3 text-right text-blue-600">
                                        {item.liters ? formatLiters(item.liters) : '-'}
                                    </td>
                                    <td className="p-3 text-right font-bold text-blue-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3">{item.salesmanName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'EXPENSE':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    Date <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('category')}
                                >
                                    Category <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Description</th>
                                <th
                                    className="p-3 text-right cursor-pointer hover:bg-slate-200"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <ArrowDownUp className="inline w-3 h-3" />
                                </th>
                                <th className="p-3 text-left">Salesman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3">
                                        <Badge color="amber">
                                            {item.category.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-slate-600 max-w-xs truncate">
                                        {item.description || '-'}
                                    </td>
                                    <td className="p-3 text-right font-bold text-rose-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3">{item.salesmanName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'CARRIAGE':
            case 'INAM_TIP':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Salesman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3">{item.description || item.note || '-'}</td>
                                    <td className="p-3 text-right font-bold text-rose-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3">{item.salesmanName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'DISCOUNT':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th className="p-3 text-left">Customer</th>
                                <th className="p-3 text-left">Reason</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Approved By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3 font-bold">
                                        {item.customerName || 'General'}
                                    </td>
                                    <td className="p-3">
                                        <Badge color="amber">
                                            {item.reason?.replace('_', ' ') || 'OTHER'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right font-bold text-rose-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3 text-xs">{item.approvedByName || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'TEST_LITERS':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th className="p-3 text-left">Nozzle</th>
                                <th className="p-3 text-left">Fuel Type</th>
                                <th className="p-3 text-right">Test Liters</th>
                                <th className="p-3 text-left">Salesman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData
                                .filter((item: any) => (item.testVolume || 0) > 0)
                                .map((item: any, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-3 font-mono text-xs">
                                            {formatDate(item.shiftDate)}
                                        </td>
                                        <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                        <td className="p-3 font-bold">{item.nozzleName}</td>
                                        <td className="p-3">
                                            <Badge color="blue">{item.fuelType}</Badge>
                                        </td>
                                        <td className="p-3 text-right font-bold text-pink-600">
                                            {formatLiters(item.testVolume)}
                                        </td>
                                        <td className="p-3">{item.salesmanName}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                );

            case 'NOZZLE_SALES':
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th className="p-3 text-left">Nozzle</th>
                                <th className="p-3 text-left">Fuel Type</th>
                                <th className="p-3 text-right">Opening</th>
                                <th className="p-3 text-right">Closing</th>
                                <th className="p-3 text-right">Liters</th>
                                <th className="p-3 text-right">Rate</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDate(item.shiftDate)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3 font-bold">{item.nozzleName}</td>
                                    <td className="p-3">
                                        <Badge color="blue">{item.fuelType}</Badge>
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                        {item.openingReading?.toFixed(2) || '-'}
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                        {item.closingReading?.toFixed(2) || '-'}
                                    </td>
                                    <td className="p-3 text-right font-bold text-blue-600">
                                        {formatLiters(item.liters)}
                                    </td>
                                    <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                                    <td className="p-3 text-right font-bold text-emerald-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            default:
                return (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Shift ID</th>
                                <th className="p-3 text-left">Details</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Salesman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredData.map((item: any, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 font-mono text-xs">
                                        {formatDateTime(item.timestamp)}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{item.shiftId}</td>
                                    <td className="p-3">
                                        {item.supplierName || item.bankName || item.customerName}
                                    </td>
                                    <td className="p-3 text-right font-bold">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-3">{item.salesmanName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
            <div className="space-y-4">
                {/* Summary & Search Bar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search transactions..."
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Button variant="secondary" onClick={handleExport} size="sm">
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>

                {/* Total Summary */}
                <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">
                                Total Entries
                            </p>
                            <p className="text-2xl font-black text-blue-700">
                                {filteredData.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold text-right">
                                Total Amount
                            </p>
                            <p className="text-2xl font-black text-emerald-700">
                                {formatCurrency(totalAmount)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <div className="max-h-[500px] overflow-auto rounded-xl border border-[var(--border)]">
                    {filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No transactions found</p>
                        </div>
                    ) : (
                        renderTable()
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-xs text-slate-500">
                        Showing {filteredData.length} of {data.length} transactions
                    </p>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
