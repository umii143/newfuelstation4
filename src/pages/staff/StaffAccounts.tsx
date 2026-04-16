import { Button, Card, KPICard, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useStaffStore } from '@/stores/dataStores';
import { useStaffLedgerStore } from '@/stores/ledgerStore';
import { StaffTransactionType } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, ChevronRight, CreditCard, Filter, History, Search, Wallet } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const StaffAccounts: React.FC = () => {
    const { users } = useStaffStore();
    const { entries, addEntry, getStaffBalance } = useStaffLedgerStore();
    const { user: currentUser } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<StaffTransactionType>('SALARY');

    // Action Form State
    const [actionData, setActionData] = useState({
        amount: 0,
        note: '',
        date: new Date().toISOString().split('T')[0],
    });

    const activeUsers = users.filter(u => u.status === 'ACTIVE');

    const selectedUser = useMemo(
        () => users.find(u => u.userId === selectedUserId),
        [users, selectedUserId]
    );

    const userLedger = useMemo(
        () =>
            entries
                .filter(e => e.userId === selectedUserId)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [entries, selectedUserId]
    );

    const filteredUsers = activeUsers.filter(
        u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = () => {
        if (!selectedUserId || !selectedUser || actionData.amount <= 0) return;

        // Debit increases if we pay staff (Salary, Advance)
        // Credit increases if staff returns money
        const isDebit = ['SALARY', 'ADVANCE', 'BONUS', 'LOAN'].includes(actionType);

        addEntry({
            userId: selectedUserId,
            userName: selectedUser.name,
            date: actionData.date,
            type: actionType,
            amount: actionData.amount,
            debit: isDebit ? actionData.amount : 0,
            credit: !isDebit ? actionData.amount : 0,
            note: actionData.note,
            createdBy: (currentUser as any)?.userId || 'SYSTEM',
        });

        setIsActionModalOpen(false);
        setActionData({ amount: 0, note: '', date: new Date().toISOString().split('T')[0] });
    };

    if (selectedUserId && selectedUser) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedUserId(null)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Staff List
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Profile Summary */}
                    <Card className="p-6 h-fit space-y-6 lg:sticky lg:top-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedUser.name}
                                </h2>
                                <p className="text-blue-600 font-medium">
                                    {selectedUser.role.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Base Salary
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    ₨{selectedUser.baseSalary?.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                    Net Balance
                                </p>
                                <p
                                    className={`text-lg font-bold ${getStaffBalance(selectedUserId) < 0 ? 'text-red-500' : 'text-blue-700'}`}
                                >
                                    ₨{Math.abs(getStaffBalance(selectedUserId)).toLocaleString()}
                                    {getStaffBalance(selectedUserId) < 0 ? ' (Payable)' : ''}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Button
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => {
                                    setActionType('SALARY');
                                    setIsActionModalOpen(true);
                                }}
                            >
                                <Wallet className="w-4 h-4" />
                                Release Salary
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="secondary"
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => {
                                        setActionType('ADVANCE');
                                        setIsActionModalOpen(true);
                                    }}
                                >
                                    Advance
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => {
                                        setActionType('BONUS');
                                        setIsActionModalOpen(true);
                                    }}
                                >
                                    Bonus
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Ledger History */}
                    <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[700px]">
                        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-400" />
                                Transaction History
                            </h3>
                            <Button variant="secondary" size="sm" className="h-8">
                                <Filter className="w-3 h-3 mr-2" />
                                Filter
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">
                                            Date & Type
                                        </th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-right">
                                            Debit
                                        </th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-right">
                                            Credit
                                        </th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-right">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userLedger.map(entry => (
                                        <tr
                                            key={entry.id}
                                            className="border-b hover:bg-gray-50 transition-colors group"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {format(new Date(entry.date), 'dd MMM yyyy')}
                                                </div>
                                                <div
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1 
                                                    ${
                                                        entry.type === 'SALARY'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : entry.type === 'ADVANCE'
                                                              ? 'bg-orange-100 text-orange-700'
                                                              : entry.type === 'BONUS'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {entry.type}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 max-w-[200px]">
                                                <p className="text-sm text-gray-600 truncate">
                                                    {entry.note || '-'}
                                                </p>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    By {entry.createdBy}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-red-500 text-right">
                                                {entry.debit > 0
                                                    ? `-₨${entry.debit.toLocaleString()}`
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-green-500 text-right">
                                                {entry.credit > 0
                                                    ? `+₨${entry.credit.toLocaleString()}`
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right bg-gray-50/50 group-hover:bg-blue-50 transition-colors">
                                                ₨{entry.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {userLedger.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-12 text-center text-gray-400"
                                            >
                                                No transactions found for this employee
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Action Modal */}
                {isActionModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md overflow-hidden animate-in zoom-in duration-200 shadow-2xl">
                            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Record {actionType.toLowerCase()}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Transaction for {selectedUser.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsActionModalOpen(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                            ₨
                                        </span>
                                        <input
                                            type="number"
                                            autoFocus
                                            className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xl font-bold"
                                            value={actionData.amount}
                                            onChange={e =>
                                                setActionData({
                                                    ...actionData,
                                                    amount: parseFloat(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Transaction Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={actionData.date}
                                        onChange={e =>
                                            setActionData({ ...actionData, date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Remarks/Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add details about this payment..."
                                        className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={actionData.note}
                                        onChange={e =>
                                            setActionData({ ...actionData, note: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsActionModalOpen(false)}
                                >
                                    Discard
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                    onClick={handleAction}
                                >
                                    Confirm Action
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Staff Accounts & Payroll"
                subtitle="Manage salary disbursements, advances and individual ledgers"
            />

            {/* Quick Search and Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 md:col-span-2 flex items-center justify-between gap-4 bg-white/40 backdrop-blur-xl border-white/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find staff member to view ledger..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Card>
                <KPICard
                    label="Global Balance"
                    value={`₨${users.reduce((acc, u) => acc + getStaffBalance(u.userId), 0).toLocaleString()}`}
                    icon={<CreditCard />}
                    color="indigo"
                    animate={true}
                />
            </div>

            {/* User List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredUsers.map(user => (
                    <Card
                        key={user.userId}
                        className="group p-4 hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-blue-400 cursor-pointer overflow-hidden relative"
                        onClick={() => setSelectedUserId(user.userId)}
                    >
                        {/* Status Glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 blur-3xl group-hover:bg-blue-400/20 transition-all rounded-full" />

                        <div className="flex items-center gap-4 relative">
                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm group-hover:scale-105 transition-all">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {user.role.replace('_', ' ')}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs relative">
                            <span className="text-gray-400 font-medium">Balance</span>
                            <span
                                className={`font-bold ${getStaffBalance(user.userId) < 0 ? 'text-red-500' : 'text-blue-600'}`}
                            >
                                ₨{Math.abs(getStaffBalance(user.userId)).toLocaleString()}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Simple X icon missing in initial import
const X: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default StaffAccounts;
