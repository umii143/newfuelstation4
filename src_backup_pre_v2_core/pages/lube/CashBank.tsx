import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useCashBankStore } from '@/stores/ledgerStore';
import clsx from 'clsx';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CreditCard,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const CashBankPage: React.FC = () => {
    const { entries, accounts } = useCashBankStore();
    const [activeTab, setActiveTab] = useState<'cash' | 'digital'>('cash');

    // Filter ledger entries for LUBE business unit
    const lubeEntries = useMemo(() => {
        return entries.filter(e => e.businessUnit === 'LUBE');
    }, [entries]);

    // Separate Cash vs Digital/Bank accounts
    const cashAccountIds = accounts.filter(a => a.type === 'CASH').map(a => a.accountId);
    
    const cashTransactions = lubeEntries.filter(t => cashAccountIds.includes(t.accountId));
    const digitalTransactions = lubeEntries.filter(t => !cashAccountIds.includes(t.accountId));

    const cashIn = cashTransactions.reduce((sum, t) => sum + t.credit, 0); // Credit increases cash
    const cashOut = cashTransactions.reduce((sum, t) => sum + t.debit, 0); // Debit decreases cash
    const cashBalance = cashIn - cashOut;

    const digitalIn = digitalTransactions.reduce((sum, t) => sum + t.credit, 0);
    const digitalOut = digitalTransactions.reduce((sum, t) => sum + t.debit, 0);
    const digitalBalance = digitalIn - digitalOut;

    const displayedTransactions = activeTab === 'cash' ? cashTransactions : digitalTransactions;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageHeader title="Cash & Bank" subtitle="Track cash on hand and digital payments" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Section */}
                <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <Wallet size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Cash on Hand</h3>
                            <p className="text-sm text-slate-600">Physical cash balance</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white/60 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Current Balance</p>
                            <h2 className="text-3xl font-bold text-emerald-600">
                                ₨{cashBalance.toLocaleString()}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/40 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowDownLeft size={14} className="text-emerald-600" />
                                    <p className="text-xs text-slate-600">Cash In</p>
                                </div>
                                <p className="font-bold text-emerald-600">
                                    ₨{cashIn.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-white/40 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowUpRight size={14} className="text-rose-600" />
                                    <p className="text-xs text-slate-600">Cash Out</p>
                                </div>
                                <p className="font-bold text-rose-600">
                                    ₨{cashOut.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setActiveTab('cash')}
                    >
                        View Cash Transactions
                    </Button>
                </Card>

                {/* Digital Section */}
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <CreditCard size={28} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Digital Payments</h3>
                            <p className="text-sm text-slate-600">Cards & bank transfers</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 bg-white/60 rounded-xl">
                            <p className="text-sm text-slate-600 mb-1">Total Digital</p>
                            <h2 className="text-3xl font-bold text-blue-600">
                                ₨{digitalBalance.toLocaleString()}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/40 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowDownLeft size={14} className="text-blue-600" />
                                    <p className="text-xs text-slate-600">Received</p>
                                </div>
                                <p className="font-bold text-blue-600">
                                    ₨{digitalIn.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-white/40 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowUpRight size={14} className="text-rose-600" />
                                    <p className="text-xs text-slate-600">Paid Out</p>
                                </div>
                                <p className="font-bold text-rose-600">
                                    ₨{digitalOut.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setActiveTab('digital')}
                    >
                        View Digital Transactions
                    </Button>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
                <button
                    onClick={() => setActiveTab('cash')}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-bold transition-all duration-200',
                        activeTab === 'cash'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'text-slate-600 hover:bg-slate-100'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Wallet size={18} />
                        Cash Transactions
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('digital')}
                    className={clsx(
                        'px-4 py-2 rounded-lg font-bold transition-all duration-200',
                        activeTab === 'digital'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-100'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <CreditCard size={18} />
                        Digital Payments
                    </span>
                </button>
            </div>

            {/* Transactions Table */}
            <Card className="p-0 overflow-hidden shadow-2xl bg-white/60 backdrop-blur-2xl border border-slate-200/80">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-200/50">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Method
                                </th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                            {displayedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        No transactions found in this ledger.
                                    </td>
                                </tr>
                            ) : (
                                displayedTransactions.map(txn => {
                                    const amount = txn.credit > 0 ? txn.credit : txn.debit;
                                    const isIncoming = txn.credit > 0;
                                    
                                    return (
                                        <tr key={txn.id} className="hover:bg-white/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="font-medium text-slate-900">
                                                        {new Date(txn.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900">
                                                    {txn.remarks || txn.type}
                                                </p>
                                                {txn.reference && (
                                                    <p className="text-xs text-slate-500">
                                                        Ref: {txn.reference}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge color="blue">{txn.accountName}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span
                                                    className={clsx(
                                                        'font-bold flex items-center justify-end gap-1',
                                                        isIncoming
                                                            ? 'text-emerald-600'
                                                            : 'text-rose-600'
                                                    )}
                                                >
                                                    {isIncoming ? (
                                                        <TrendingUp size={14} />
                                                    ) : (
                                                        <TrendingDown size={14} />
                                                    )}
                                                    ₨{amount.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CashBankPage;
