import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/dataStores';
import clsx from 'clsx';
import { Calendar, DollarSign, FileText, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

const EXPENSE_CATEGORIES = [
    { value: 'UTILITIES', label: 'Utilities', color: 'blue' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'amber' },
    { value: 'SALARIES', label: 'Salaries', color: 'emerald' },
    { value: 'SUPPLIES', label: 'Supplies', color: 'purple' },
    { value: 'TRANSPORT', label: 'Transport', color: 'cyan' },
    { value: 'OTHER', label: 'Other', color: 'gray' },
];

export const ExpensesPage: React.FC = () => {
    const { user } = useAuthStore();
    const { expenses, addExpense, deleteExpense } = useExpenseStore();
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    // New Expense Form State
    const [formData, setFormData] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        category: 'UTILITIES',
        description: '',
        amount: '',
        paymentMethod: 'CASH',
        paidTo: '',
    });

    const filteredExpenses =
        selectedCategory === 'ALL'
            ? expenses
            : expenses.filter(e => e.category === selectedCategory);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const todayExpenses = expenses
        .filter(e => e.expenseDate === new Date().toISOString().split('T')[0])
        .reduce((sum, e) => sum + e.amount, 0);

    const handleAddExpense = async () => {
        if (!formData.amount || isNaN(Number(formData.amount))) return;

        await addExpense({
            category: formData.category,
            amount: Number(formData.amount),
            description: formData.description,
            paymentMethod: formData.paymentMethod,
            paidTo: formData.paidTo,
            expenseDate: formData.expenseDate,
            approvedById: (user as any)?.id || 'SYS',
            expenseId: `EXP-${Date.now()}`,
        });

        setShowModal(false);
        setFormData({
            expenseDate: new Date().toISOString().split('T')[0],
            category: 'UTILITIES',
            description: '',
            amount: '',
            paymentMethod: 'CASH',
            paidTo: '',
        });
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Expenses"
                subtitle="Track daily operational expenses"
                actions={
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Add Expense
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-600 tracking-tight">
                                Today's Expenses
                            </p>
                            <h3 className="text-3xl font-black mt-1 text-rose-600 tracking-tighter">
                                ₨{todayExpenses.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-rose-500/20 rounded-2xl shadow-inner">
                            <Calendar size={24} className="text-rose-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-600 tracking-tight">
                                Total Expenses
                            </p>
                            <h3 className="text-3xl font-black mt-1 text-amber-600 tracking-tighter">
                                ₨{totalExpenses.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-2xl shadow-inner">
                            <DollarSign size={24} className="text-amber-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-600 tracking-tight">
                                Total Entries
                            </p>
                            <h3 className="text-3xl font-black mt-1 text-blue-600 tracking-tighter">
                                {expenses.length}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-2xl shadow-inner">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Category Filter */}
            <div className="p-2 bg-white/60 backdrop-blur-2xl border border-slate-200/80 shadow-md rounded-2xl">
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        className={clsx(
                            'px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                            selectedCategory === 'ALL'
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-y-[-2px]'
                                : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )}
                    >
                        All
                    </button>
                    {EXPENSE_CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={clsx(
                                'px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                                selectedCategory === cat.value
                                    ? `bg-${cat.color}-500 text-white shadow-xl shadow-${cat.color}-500/30 translate-y-[-2px]`
                                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expenses Table */}
            <Card className="p-0 overflow-hidden shadow-xl border border-slate-200/80 rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200/60">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Details
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Payment
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-slate-500 font-medium"
                                    >
                                        No expenses recorded yet. Note down your first expense!
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map(expense => {
                                    const categoryConfig = EXPENSE_CATEGORIES.find(
                                        c => c.value === expense.category
                                    );
                                    return (
                                        <tr
                                            key={expense.id}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar
                                                        size={14}
                                                        className="text-slate-400"
                                                    />
                                                    <span className="font-bold text-slate-900 tracking-tight">
                                                        {new Date(
                                                            expense.expenseDate
                                                        ).toLocaleDateString('en-PK', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    color={(categoryConfig?.color as any) || 'gray'}
                                                >
                                                    {categoryConfig?.label || expense.category}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 max-w-sm">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {expense.description || '-'}
                                                </p>
                                                {expense.paidTo && (
                                                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                                        To: {expense.paidTo}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-rose-600 text-base">
                                                    ₨{expense.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    color={'slate' as any}
                                                    className="font-bold border-slate-200"
                                                >
                                                    {expense.paymentMethod}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 hover:text-rose-600 hover:bg-rose-50"
                                                        onClick={() => deleteExpense(expense.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Record Expense"
                size="md"
            >
                <div className="space-y-5 p-2">
                    <Input
                        label="Date"
                        type="date"
                        value={formData.expenseDate}
                        onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Category
                            </label>
                            <select
                                className="w-full h-11 px-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                value={formData.category}
                                onChange={e =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Payment Method
                            </label>
                            <select
                                className="w-full h-11 px-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                value={formData.paymentMethod}
                                onChange={e =>
                                    setFormData({ ...formData, paymentMethod: e.target.value })
                                }
                            >
                                <option value="CASH">Cash</option>
                                <option value="BANK">Bank Transfer</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Amount (₨)"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />

                    <Input
                        label="Description"
                        placeholder="What was this expense for?"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />

                    <Input
                        label="Paid To (Optional)"
                        placeholder="Vendor or recipient name"
                        value={formData.paidTo}
                        onChange={e => setFormData({ ...formData, paidTo: e.target.value })}
                    />

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="secondary"
                            className="flex-1 rounded-xl"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 rounded-xl shadow-lg shadow-blue-500/30 font-black text-lg"
                            onClick={handleAddExpense}
                            disabled={!formData.amount}
                        >
                            <span className="relative z-10">Add Expense</span>
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExpensesPage;
