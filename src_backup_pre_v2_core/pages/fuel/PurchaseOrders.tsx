import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { getStationId, getCurrentUserId, getCurrentUserName } from '@/lib/authHelpers';
import { useSupplierStore } from '@/stores/dataStores';
import { useFuelStore } from '@/stores/fuelStore';
import { useCashBankStore } from '@/stores/ledgerStore';
import { useProfitStore } from '@/stores/profitStore';
import { useConfigStore } from '@/stores/configStore';
import type { FuelType, POItem, PurchaseOrder } from '@/types';
import { format } from 'date-fns';
import { CheckCircle2, Plus, Search, TrendingUp, Truck } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const PurchaseOrdersPage: React.FC = () => {
    const { suppliers, purchaseOrders, createPurchaseOrder } = useSupplierStore();
    const { tanks, updateTank } = useFuelStore();
    const { addEntry: addExpenseEntry, accounts } = useCashBankStore();
    const { addProfitEntry } = useProfitStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { tankConfigs, rateConfigs } = useConfigStore();
    const getSalePrice = (fuelType: string) => {
        const rateConfig = rateConfigs.find(r => r.fuelType === fuelType);
        if (rateConfig) return rateConfig.currentRate;
        const tank = tankConfigs.find(t => t.fuelType === fuelType);
        return tank?.salePrice || 0;
    };

    // Form State
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [carriage, setCarriage] = useState(0);
    const [items, setItems] = useState<Omit<POItem, 'subtotal' | 'margin'>[]>([
        {
            productId: 'PETROL_92',
            productName: 'Petrol (Super)',
            sku: 'FUEL-P92',
            quantity: 0,
            receivedQty: 0,
            purchaseRate: 0,
            salePrice: getSalePrice('PETROL_92'),
        },
    ]);

    const fuelSuppliers = suppliers.filter(s => s.type === 'FUEL_SUPPLIER');

    const totalSubtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity * item.purchaseRate, 0);
    }, [items]);

    const totalMargin = useMemo(() => {
        return items.reduce(
            (sum, item) => sum + item.quantity * (item.salePrice - item.purchaseRate),
            0
        );
    }, [items]);

    const netProfit = totalMargin - carriage;

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                productId: 'DIESEL',
                productName: 'Diesel (Hi-Speed)',
                sku: 'FUEL-HSD',
                quantity: 0,
                receivedQty: 0,
                purchaseRate: 0,
                salePrice: getSalePrice('DIESEL'),
            },
        ]);
    };

    const handleCreatePO = () => {
        if (!selectedSupplier) return;

        const supplier = fuelSuppliers.find(s => s.supplierId === selectedSupplier);

        const newPO: Omit<PurchaseOrder, 'poId' | 'createdAt'> = {
            stationId: getStationId(),
            businessUnit: 'FUEL',
            supplierId: selectedSupplier,
            supplierName: supplier?.name || '',
            orderDate: new Date().toISOString().split('T')[0],
            expectedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            items: items.map(item => ({
                ...item,
                subtotal: item.quantity * item.purchaseRate,
                margin: (item.salePrice - item.purchaseRate) * item.quantity,
            })) as POItem[],
            subtotal: totalSubtotal,
            taxAmount: totalSubtotal * 0.17, // 17% GST
            carriage: carriage,
            totalAmount: totalSubtotal + totalSubtotal * 0.17 + carriage,
            recordedProfit: netProfit,
            status: 'APPROVED',
            createdBy: getCurrentUserId(),
            notes: `Purchase with Carriage of ₨${carriage.toLocaleString()}`,
        };

        createPurchaseOrder(newPO);

        // Record Carriage as an Expense
        const cashAccount = accounts.find(a => a.type === 'CASH');
        if (cashAccount) {
            addExpenseEntry({
                accountId: cashAccount.accountId,
                accountName: cashAccount.name,
                date: new Date().toISOString().split('T')[0],
                shiftId: 'ADMIN',
                staffId: getCurrentUserId(),
                staffName: getCurrentUserName(),
                type: 'EXPENSE',
                reference: `CARRIAGE-PO`,
                debit: carriage,
                credit: 0,
                counterpartyType: 'SUPPLIER',
                counterpartyName: supplier?.name || 'Fuel Transport',
                remarks: `Carriage/Karaya for Fuel Tanker (PO: ${supplier?.name})`,
            });
        }

        // Sync Profit
        addProfitEntry({
            date: new Date().toISOString().split('T')[0],
            type: 'FUEL_PURCHASE',
            referenceId: 'PO-NEW',
            description: `Tanker Arrival from ${supplier?.name}`,
            revenue: 0,
            cost: totalSubtotal,
            carriage: carriage,
            netProfit: -carriage, // Initial cost is the carriage. Margin realized on sale.
        });

        // Update Tank Stock (for fuelStation logic, we assume instant receipt for this simple demo)
        items.forEach(item => {
            const tank = tanks.find(t => t.fuelType === (item.productId as FuelType));
            if (tank) {
                updateTank(tank.tankId, { currentLevel: tank.currentLevel + item.quantity });
            }
        });

        setShowCreateModal(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedSupplier('');
        setCarriage(0);
        setItems([
            {
                productId: 'PETROL_92',
                productName: 'Petrol (Super)',
                sku: 'FUEL-P92',
                quantity: 0,
                receivedQty: 0,
                purchaseRate: 0,
                salePrice: getSalePrice('PETROL_92'),
            },
        ]);
    };

    const formatCurrency = (val: number) => `₨${val.toLocaleString()}`;

    const filteredOrders = purchaseOrders.filter(
        po =>
            po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.poId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <PageHeader
                title="Fuel Purchase Orders"
                subtitle="Manage tanker arrivals, purchase rates, and carriage costs"
                actions={
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-black uppercase tracking-widest px-6"
                    >
                        <Plus size={18} className="mr-2" /> Record Tanker Arrival
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <TrendingUp className="mb-2 opacity-50" size={24} />
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">
                        Projected Margin
                    </p>
                    <h3 className="text-3xl font-black mt-1">
                        ₨{(totalMargin - carriage).toLocaleString()}
                    </h3>
                    <p className="text-xs mt-2 opacity-60 italic">Based on current PO entries</p>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-amber-500">
                    <Truck className="text-amber-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Total Carriage (Karaya)
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {formatCurrency(
                            purchaseOrders.reduce((s, po) => s + (po.carriage || 0), 0)
                        )}
                    </h3>
                </Card>
                <Card className="p-6 bg-white shadow-xl border-l-4 border-emerald-500">
                    <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Active Orders
                    </p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1">
                        {purchaseOrders.filter(p => p.status !== 'CLOSED').length}
                    </h3>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div className="relative w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <Input
                            placeholder="Search orders..."
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
                                    Order ID
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Supplier
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Total Amount
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-center">
                                    Carriage
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest text-right">
                                    Profit Margin
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 tracking-widest">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(po => (
                                <tr key={po.poId} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{po.poId}</td>
                                    <td className="px-6 py-4 font-medium">{po.supplierName}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(po.orderDate), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-6 py-4 font-black">
                                        {formatCurrency(po.totalAmount || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge color="amber">
                                            {formatCurrency(po.carriage || 0)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-emerald-600">
                                            +{formatCurrency(po.recordedProfit || 0)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={po.status === 'CLOSED' ? 'emerald' : 'blue'}>
                                            {po.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create PO Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Record Fuel Tanker Arrival"
                size="xl"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                Select Supplier
                            </label>
                            <select
                                className="w-full p-3 rounded-xl border bg-gray-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedSupplier}
                                onChange={e => setSelectedSupplier(e.target.value)}
                            >
                                <option value="">Choose Supplier...</option>
                                {fuelSuppliers.map(s => (
                                    <option key={s.supplierId} value={s.supplierId}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Carriage / Karaya (₨)"
                            type="number"
                            value={carriage}
                            onChange={e => setCarriage(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">
                                Ordered Items
                            </h4>
                            <Button variant="ghost" size="sm" onClick={handleAddItem}>
                                <Plus size={14} className="mr-1" /> Add Fuel Type
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-12 gap-4 items-end"
                                >
                                    <div className="col-span-3">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">
                                            Fuel Type
                                        </label>
                                        <select
                                            className="w-full p-2 bg-white rounded-lg border text-sm font-bold outline-none"
                                            value={item.productId}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[idx].productId = e.target.value;
                                                newItems[idx].productName =
                                                    e.target.options[e.target.selectedIndex].text;
                                                newItems[idx].salePrice = getSalePrice(e.target.value);
                                                setItems(newItems);
                                            }}
                                        >
                                            <option value="PETROL_92">Petrol (Super)</option>
                                            <option value="PETROL_95">Petrol 95</option>
                                            <option value="DIESEL">Diesel (HSD)</option>
                                            <option value="PREMIUM_DIESEL">Premium Diesel</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Liters"
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[idx].quantity =
                                                    parseFloat(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Purchase Rate"
                                            type="number"
                                            value={item.purchaseRate}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[idx].purchaseRate =
                                                    parseFloat(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Sale Rate"
                                            type="number"
                                            value={item.salePrice}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[idx].salePrice =
                                                    parseFloat(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase">
                                            Est. Margin
                                        </p>
                                        <p className="text-emerald-600 font-black text-lg">
                                            ₨
                                            {(
                                                (item.salePrice - item.purchaseRate) *
                                                item.quantity
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-xl flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black opacity-60 uppercase">
                                    Total Subtotal
                                </p>
                                <p className="text-xl font-black">
                                    {formatCurrency(totalSubtotal)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-60 uppercase">
                                    Net Profit Impact
                                </p>
                                <p className="text-xl font-black text-emerald-300">
                                    {formatCurrency(netProfit)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="!bg-white !text-blue-600 hover:!bg-blue-50 font-black"
                                onClick={handleCreatePO}
                            >
                                Confirm & Update Stock
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
