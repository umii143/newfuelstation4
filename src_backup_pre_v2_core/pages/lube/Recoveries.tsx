import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { getCurrentUserId } from '@/lib/authHelpers';
import { useCustomerStore } from '@/stores/dataStores';
import type { Customer } from '@/types';
import { format } from 'date-fns';
import {
    Banknote,
    CheckCircle,
    CreditCard,
    DollarSign,
    Search,
    Smartphone,
    TrendingUp,
    User,
} from 'lucide-react';
import React, { useState } from 'react';

export const RecoveriesPage: React.FC = () => {
    const { customers, recordPayment } = useCustomerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL'>('CASH');

    // Filter customers with outstanding balance (lube-specific in future)
    const customersWithBalance = customers.filter(c => (c.currentBalance || 0) > 0);

    const filteredCustomers = customersWithBalance.filter(
        c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    );

    const totalOutstanding = customersWithBalance.reduce((sum, c) => sum + (c.currentBalance || 0), 0);

    const handleOpenPaymentModal = (customer: any) => {
        setSelectedCustomer(customer);
        setPaymentAmount(0);
        setPaymentMethod('CASH');
        setShowPaymentModal(true);
    };

    const handleRecordPayment = () => {
        if (selectedCustomer && paymentAmount > 0) {
            recordPayment(selectedCustomer.customerId, paymentAmount, paymentMethod, getCurrentUserId());
            setShowPaymentModal(false);
            setSelectedCustomer(null);
            setPaymentAmount(0);
        }
    };

    return (
        <div>
            <PageHeader
                title="Customer Recoveries"
                subtitle={`${customersWithBalance.length} customers with outstanding balance`}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg">
                    <DollarSign className="mb-2 opacity-50" size={24} />
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">
                        Total Outstanding
                    </p>
                    <h3 className="text-3xl font-black mt-1">
                        ₨{totalOutstanding.toLocaleString()}
                    </h3>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-amber-500">
                    <User className="text-amber-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Pending Customers
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {customersWithBalance.length}
                    </h3>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-emerald-500">
                    <TrendingUp className="text-emerald-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Recovery Target
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        ₨{(totalOutstanding * 0.3).toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">30% monthly target</p>
                </Card>
            </div>

            {/* Customers List */}
            <Card className="p-0 overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div className="relative w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <Input
                            placeholder="Search customers..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white border-b uppercase">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Phone
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-right">
                                    Outstanding
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCustomers.map(customer => (
                                <tr
                                    key={customer.customerId}
                                    className="hover:bg-rose-50/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {customer.name}
                                            </p>
                                            {customer.lastTransaction && (
                                                <p className="text-xs text-gray-500">
                                                    Last:{' '}
                                                    {format(
                                                        new Date(customer.lastTransaction),
                                                        'dd MMM yyyy'
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-rose-600">
                                            ₨{(customer.currentBalance || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            color={
                                                customer.status === 'ACTIVE' ? 'emerald' : 'gray'
                                            }
                                        >
                                            {customer.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleOpenPaymentModal(customer)}
                                        >
                                            Record Payment
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Record Payment"
                size="md"
            >
                {selectedCustomer && (
                    <div className="space-y-6 pt-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-black mb-1">
                                Customer
                            </p>
                            <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                            <p className="text-sm text-rose-600 font-bold mt-2">
                                Outstanding: ₨{(selectedCustomer.currentBalance || 0).toLocaleString()}
                            </p>
                        </div>

                        <Input
                            label="Payment Amount"
                            type="number"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-14 text-xl font-black text-center"
                        />

                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                        paymentMethod === 'CASH'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Banknote size={24} />
                                    <span className="text-xs font-bold">CASH</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                        paymentMethod === 'CARD'
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <CreditCard size={24} />
                                    <span className="text-xs font-bold">CARD</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('DIGITAL')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                        paymentMethod === 'DIGITAL'
                                            ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Smartphone size={24} />
                                    <span className="text-xs font-bold">WALLET</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleRecordPayment}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                                disabled={
                                    paymentAmount <= 0 ||
                                    paymentAmount > (selectedCustomer.currentBalance || 0)
                                }
                            >
                                <CheckCircle size={18} />
                                Confirm Payment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
