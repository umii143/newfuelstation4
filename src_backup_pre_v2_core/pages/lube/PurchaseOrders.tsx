import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { getStationId, getCurrentUserId, getCurrentUserName } from '@/lib/authHelpers';
import { useSupplierStore } from '@/stores/dataStores';
import { useCashBankStore } from '@/stores/ledgerStore';
import { useProductStore } from '@/stores/productStore';
import { useProfitStore } from '@/stores/profitStore';
import type { PurchaseOrder } from '@/types';
import { format } from 'date-fns';
import { CheckCircle2, Package, Plus, Search, Truck } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const LubePurchaseOrdersPage: React.FC = () => {
    const { suppliers, purchaseOrders, createPurchaseOrder } = useSupplierStore();
    const { products, updateProduct } = useProductStore();
    const { addEntry: addExpenseEntry, accounts } = useCashBankStore();
    const { addProfitEntry } = useProfitStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form State
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
    const [carriage, setCarriage] = useState(0);
    const [items, setItems] = useState<
        {
            productId: string;
            productName: string;
            sku: string;
            quantity: number;
            purchaseRate: number;
            salePrice: number;
        }[]
    >([]);

    const lubeSuppliers = suppliers.filter(s => s.type === 'LUBE_SUPPLIER' || s.type === 'OTHER');
    const lubeProducts = products.filter(
        p => p.category !== 'FUEL_PETROL' && p.category !== 'FUEL_DIESEL'
    );

    const totalSubtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity * item.purchaseRate, 0);
    }, [items]);

    const totalMargin = useMemo(() => {
        return items.reduce(
            (sum, item) => sum + item.quantity * (item.salePrice - item.purchaseRate),
            0
        );
    }, [items]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                productId: '',
                productName: '',
                sku: '',
                quantity: 1,
                purchaseRate: 0,
                salePrice: 0,
            },
        ]);
    };

    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const handleProductSelect = (idx: number, productId: string) => {
        const product = lubeProducts.find(p => p.productId === productId);
        if (product) {
            const newItems = [...items];
            newItems[idx] = {
                productId: product.productId,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                purchaseRate: product.costPrice,
                salePrice: product.salePrice,
            };
            setItems(newItems);
        }
    };

    const handleCreatePO = () => {
        if (!selectedSupplier || items.length === 0) return;

        const supplier = lubeSuppliers.find(s => s.supplierId === selectedSupplier);

        const newPO: Omit<PurchaseOrder, 'poId' | 'createdAt'> = {
            stationId: getStationId(),
            businessUnit: 'LUBE',
            supplierId: selectedSupplier,
            supplierName: supplier?.name || '',
            orderDate: arrivalDate,
            expectedDate: arrivalDate,
            items: items.map(item => ({
                ...item,
                receivedQty: item.quantity,
                subtotal: item.quantity * item.purchaseRate,
                margin: (item.salePrice - item.purchaseRate) * item.quantity,
            })),
            subtotal: totalSubtotal,
            taxAmount: totalSubtotal * 0.17,
            carriage: carriage,
            totalAmount: totalSubtotal + totalSubtotal * 0.17 + carriage,
            recordedProfit: totalMargin - carriage,
            status: 'APPROVED',
            createdBy: getCurrentUserId(),
            notes: `Lube Purchase Arrival (Carriage: ₨${carriage})`,
        };

        createPurchaseOrder(newPO);

        // Record Carriage as Expense
        const cashAccount = accounts.find(a => a.type === 'CASH');
        if (cashAccount && carriage > 0) {
            addExpenseEntry({
                accountId: cashAccount.accountId,
                accountName: cashAccount.name,
                date: new Date().toISOString().split('T')[0],
                shiftId: 'ADMIN',
                staffId: getCurrentUserId(),
                staffName: getCurrentUserName(),
                type: 'EXPENSE',
                reference: `CARRIAGE-LUBE`,
                debit: carriage,
                credit: 0,
                counterpartyType: 'SUPPLIER',
                counterpartyName: supplier?.name || 'Lube Logistics',
                remarks: `Carriage for Lube Products (PO: ${supplier?.name})`,
            });
        }

        // Add to Profit Ledger
        addProfitEntry({
            date: new Date().toISOString().split('T')[0],
            type: 'LUBE_SALE', // Using generic type for now as reference
            referenceId: 'PO-LUBE',
            description: `Lube Stock Arrival: ${supplier?.name}`,
            revenue: 0,
            cost: totalSubtotal,
            carriage: carriage,
            netProfit: -carriage,
        });

        // Add to Supplier Ledger
        import('@/stores/ledgerStore').then(({ useSupplierLedgerStore }) => {
            useSupplierLedgerStore.getState().addEntry({
                supplierId: newPO.supplierId,
                supplierName: newPO.supplierName,
                date: newPO.orderDate,
                type: 'PURCHASE',
                reference: `LUBE-PO-${Date.now()}`,
                debit: 0,
                credit: newPO.totalAmount,
                remarks: `Lube Purchase Order Arrival`,
                shiftId: 'SYSTEM',
                staffId: 'SYSTEM',
                staffName: 'System',
            });
        });

        // Update Product Stock
        items.forEach(item => {
            const product = lubeProducts.find(p => p.productId === item.productId);
            if (product) {
                updateProduct(product.productId, {
                    currentStock: product.currentStock + item.quantity,
                    costPrice: item.purchaseRate,
                    salePrice: item.salePrice,
                });
            }
        });

        setShowCreateModal(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedSupplier('');
        setArrivalDate(new Date().toISOString().split('T')[0]);
        setCarriage(0);
        setItems([]);
    };

    const formatCurrency = (val: number) => `₨${val.toLocaleString()}`;

    // Filter POs to show only Lube ones (assuming we can identify them, or just filter by supplier type)
    const filteredOrders = purchaseOrders.filter(po => {
        const matchesSearch =
            po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.poId.toLowerCase().includes(searchTerm.toLowerCase());
        // For this demo, let's assume if it's not a fuel supplier, it's a lube PO
        const supplier = suppliers.find(s => s.supplierId === po.supplierId);
        const isLubePO = supplier?.type !== 'FUEL_SUPPLIER';
        return matchesSearch && isLubePO;
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Lube Purchase Orders"
                subtitle="High-Octane Supply Chain Management for Lubricants & Oil"
                actions={
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest py-6 px-8 rounded-2xl"
                    >
                        <Plus size={20} className="mr-2" /> Record Stock Arrival
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                        <Package size={120} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">
                                Projected Lube Margin
                            </p>
                            <h3 className="text-3xl font-black">
                                ₨{(totalMargin - carriage).toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <Package size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] mt-4 font-bold opacity-40 italic">
                        Realized upon retail distribution
                    </p>
                </Card>

                <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/60 shadow-xl border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Logistics Overhead
                            </p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {formatCurrency(
                                    filteredOrders.reduce((s, po) => s + (po.carriage || 0), 0)
                                )}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Truck size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] mt-4 font-bold text-amber-600 uppercase tracking-widest">
                        Cumulative Carriage
                    </p>
                </Card>

                <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/60 shadow-xl border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                                Processed Arrivals
                            </p>
                            <h3 className="text-2xl font-black text-slate-900">
                                {filteredOrders.length}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] mt-4 font-bold text-slate-400 italic">
                        Total PO Records (Active)
                    </p>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden shadow-2xl border-white/60 bg-white/40 backdrop-blur-xl">
                <div className="p-6 bg-slate-50/50 border-b border-white/20 flex justify-between items-center">
                    <div className="relative w-80">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <Input
                            placeholder="Scan ID or Supplier..."
                            className="pl-12 bg-white/60 border-white/40 backdrop-blur-md rounded-2xl h-12"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/10 uppercase">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">
                                    Purchase ID
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">
                                    Logistics Source
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">
                                    Arrival Date
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">
                                    Cargo Load
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em] text-right">
                                    Financial Value
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 tracking-[0.2em]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-20 text-center text-slate-400 italic font-bold"
                                    >
                                        No purchase intelligence records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(po => (
                                    <tr
                                        key={po.poId}
                                        className="hover:bg-amber-500/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                                {po.poId}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-800">
                                                {po.supplierName}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                                                Registered Vendor
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-bold">
                                            {format(new Date(po.orderDate), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge color="blue" className="font-black">
                                                {po.items.length} SKUs Detected
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-black text-right text-lg text-slate-900">
                                            {formatCurrency(po.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <span className="font-black text-[10px] uppercase text-emerald-600 tracking-widest">
                                                    {po.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Record Lube Stock Arrival"
                size="xl"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                                Select Supplier
                            </label>
                            <select
                                className="w-full p-3 rounded-xl border bg-gray-50 font-bold outline-none"
                                value={selectedSupplier}
                                onChange={e => setSelectedSupplier(e.target.value)}
                            >
                                <option value="">Choose Supplier...</option>
                                {lubeSuppliers.map(s => (
                                    <option key={s.supplierId} value={s.supplierId}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Arrival Date"
                            type="date"
                            value={arrivalDate}
                            onChange={e => setArrivalDate(e.target.value)}
                        />
                        <Input
                            label="Transportation / Carriage (₨)"
                            type="number"
                            value={carriage}
                            onChange={e => setCarriage(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">
                                Arrival Items
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAddItem}
                                className="text-blue-500"
                            >
                                <Plus size={14} className="mr-1" /> Add Product
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-12 gap-3 items-end"
                                >
                                    <div className="col-span-4">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">
                                            Product
                                        </label>
                                        <select
                                            className="w-full p-2 bg-white rounded-lg border text-sm font-bold outline-none"
                                            value={item.productId}
                                            onChange={e => handleProductSelect(idx, e.target.value)}
                                        >
                                            <option value="">Select Item...</option>
                                            {lubeProducts.map(p => (
                                                <option key={p.productId} value={p.productId}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Qty (Pcs)"
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => {
                                                const newItems = [...items];
                                                newItems[idx].quantity =
                                                    parseInt(e.target.value) || 0;
                                                setItems(newItems);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            label="Cost Price"
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
                                            label="Sale Price"
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
                                    <div className="col-span-2 flex justify-end">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemoveItem(idx)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-amber-600 text-white shadow-xl flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                                    Grand Total
                                </p>
                                <p className="text-xl font-black">
                                    {formatCurrency(
                                        totalSubtotal + totalSubtotal * 0.17 + carriage
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                                    Projected Margin
                                </p>
                                <p className="text-xl font-black text-emerald-300">
                                    {formatCurrency(totalMargin - carriage)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg"
                                onClick={handleCreatePO}
                            >
                                Update Inventory
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
