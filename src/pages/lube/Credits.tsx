import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useCustomerStore } from '@/stores/dataStores';
import { format } from 'date-fns';
import { CheckCircle, CreditCard, Plus, Search, Users } from 'lucide-react';
import React, { useState } from 'react';

export const CreditsPage: React.FC = () => {
    const { customers, addCustomer, isLoading, error: storeError } = useCustomerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cnic: '',
        creditLimit: 0,
        paymentTerms: 'NET_30' as 'NET_15' | 'NET_30' | 'NET_60',
    });

    // Filter credit customers
    const creditCustomers = customers.filter(c => c.creditLimit > 0);

    const filteredCustomers = creditCustomers.filter(
        c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    );

    const totalCreditLimit = creditCustomers.reduce((sum, c) => sum + c.creditLimit, 0);
    const totalUtilized = creditCustomers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
    const availableCredit = totalCreditLimit - totalUtilized;

    const handleAddCustomer = async () => {
        if (formData.name && formData.phone && formData.creditLimit > 0) {
            setLocalError(null);
            try {
                await addCustomer({
                    stationId: 'STN-001',
                    name: formData.name,
                    phone: formData.phone,
                    cnic: formData.cnic,
                    creditLimit: formData.creditLimit,
                    paymentTerms: formData.paymentTerms,
                    status: 'ACTIVE', businessUnit: 'LUBE' as const,
                });
                setShowAddCustomerModal(false);
                setFormData({
                    name: '',
                    phone: '',
                    cnic: '',
                    creditLimit: 0,
                    paymentTerms: 'NET_30',
                });
            } catch (err: any) {
                setLocalError(err.message || 'Failed to add customer');
            }
        }
    };

    return (
        <div>
            <PageHeader
                title="Credit Management"
                subtitle={`${creditCustomers.length} customers with credit facility`}
                actions={
                    <Button variant="primary" onClick={() => setShowAddCustomerModal(true)}>
                        <Plus size={18} />
                        Add Credit Customer
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CreditCard className="mb-2 opacity-50" size={24} />
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">
                        Total Credit Limit
                    </p>
                    <h3 className="text-3xl font-black mt-1">
                        ₨{totalCreditLimit.toLocaleString()}
                    </h3>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-rose-500">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Utilized
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        ₨{totalUtilized.toLocaleString()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {totalCreditLimit > 0
                            ? ((totalUtilized / totalCreditLimit) * 100).toFixed(1)
                            : '0.0'}
                        % used
                    </p>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Available
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        ₨{availableCredit.toLocaleString()}
                    </h3>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-amber-500">
                    <Users className="text-amber-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Active Customers
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {creditCustomers.filter(c => c.status === 'ACTIVE').length}
                    </h3>
                </Card>
            </div>

            {/* Credit Customers List */}
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
                                    Credit Limit
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-right">
                                    Used
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-right">
                                    Available
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
                            {filteredCustomers.map(customer => {
                                const availableAmount =
                                    customer.creditLimit - (customer.currentBalance || 0);
                                const utilizationPct =
                                    ((customer.currentBalance || 0) / customer.creditLimit) * 100;

                                return (
                                    <tr
                                        key={customer.customerId}
                                        className="hover:bg-blue-50/30 transition-colors"
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
                                        <td className="px-6 py-4 text-gray-600">
                                            {customer.phone}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-900">
                                            ₨{customer.creditLimit.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={`font-bold ${utilizationPct > 80 ? 'text-rose-600' : 'text-amber-600'}`}
                                            >
                                                ₨{(customer.currentBalance || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                ₨{availableAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                color={
                                                    customer.status === 'ACTIVE'
                                                        ? 'emerald'
                                                        : 'gray'
                                                }
                                            >
                                                {customer.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm">
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Customer Modal */}
            <Modal
                isOpen={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                title="Add Credit Customer"
                size="md"
            >
                <div className="space-y-6 pt-4">
                    <Input
                        label="Customer Name"
                        placeholder="e.g. Ahmad Traders"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Phone Number"
                            placeholder="+92 3XX XXXXXXX"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="CNIC (Optional)"
                            placeholder="XXXXX-XXXXXXX-X"
                            value={formData.cnic}
                            onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Credit Limit"
                        type="number"
                        placeholder="0"
                        value={formData.creditLimit}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                creditLimit: parseFloat(e.target.value) || 0,
                            })
                        }
                        className="h-14 text-xl font-black text-center"
                    />

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                            Payment Terms
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setFormData({ ...formData, paymentTerms: 'NET_15' })}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    formData.paymentTerms === 'NET_15'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <p className="font-bold">15 Days</p>
                                <p className="text-xs opacity-70 mt-1">NET_15</p>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, paymentTerms: 'NET_30' })}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    formData.paymentTerms === 'NET_30'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <p className="font-bold">30 Days</p>
                                <p className="text-xs opacity-70 mt-1">NET_30</p>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, paymentTerms: 'NET_60' })}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    formData.paymentTerms === 'NET_60'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <p className="font-bold">60 Days</p>
                                <p className="text-xs opacity-70 mt-1">NET_60</p>
                            </button>
                        </div>
                    </div>

                    {(localError || storeError) && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold capitalize">
                            {localError || storeError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setShowAddCustomerModal(false)}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddCustomer}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                            disabled={
                                isLoading ||
                                !formData.name ||
                                !formData.phone ||
                                formData.creditLimit <= 0
                            }
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <CheckCircle size={18} />
                            )}
                            {isLoading ? 'Saving...' : 'Add Customer'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
