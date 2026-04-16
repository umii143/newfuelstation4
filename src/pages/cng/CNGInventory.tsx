import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useCNGStore, type DecantingRecord } from '@/stores/cngStore';
import { useSupplierStore } from '@/stores/dataStores';
import { motion } from 'framer-motion';
import {
    ArrowDownToLine,
    Box,
    CheckCircle2,
    History,
    Package,
    Search,
    TrendingUp,
    Truck,
    Wind,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);

const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const CNG_RATE_PER_KG = 200; // PKR/KG — editable in configuration

export const CNGInventoryPage: React.FC = () => {
    const { decantingRecords, totalCNGStock, compressors, shifts, addDecantingRecord } =
        useCNGStore();

    const { suppliers } = useSupplierStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [showDecantingModal, setShowDecantingModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [decantingData, setDecantingData] = useState({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        supplierId: '',
        containerId: '',
        totalKG: 0,
        ratePerKG: CNG_RATE_PER_KG,
        carriageCharges: 0,
        unloadingPoint: 'Cascade Bank 1 (Primary)',
    });

    const estimatedCost =
        decantingData.totalKG * decantingData.ratePerKG + decantingData.carriageCharges;

    const handleSaveDecanting = () => {
        if (!decantingData.supplier.trim() || decantingData.totalKG <= 0) return;

        addDecantingRecord({
            date: decantingData.date,
            supplier: decantingData.supplier,
            supplierId: decantingData.supplierId || undefined,
            containerId: decantingData.containerId,
            totalKG: decantingData.totalKG,
            carriageCharges: decantingData.carriageCharges,
            unloadingPoint: decantingData.unloadingPoint,
            totalCost: estimatedCost,
        });

        // Wire to actual Supplier Ledger
        if (decantingData.supplierId) {
            import('@/stores/ledgerStore').then(({ useSupplierLedgerStore }) => {
                useSupplierLedgerStore.getState().addEntry({
                    supplierId: decantingData.supplierId,
                    supplierName: decantingData.supplier,
                    date: decantingData.date,
                    type: 'PURCHASE',
                    reference: decantingData.containerId || 'CNG-DECANT',
                    debit: 0,
                    credit: estimatedCost,
                    remarks: `CNG Decanting: ${decantingData.totalKG} KG`,
                    shiftId: 'SYSTEM',
                    staffId: 'SYSTEM',
                    staffName: 'System',
                });
            });
        }

        setSuccessMessage(
            `✓ ${decantingData.totalKG.toLocaleString()} KG received. Stock updated.`
        );
        setTimeout(() => setSuccessMessage(''), 4000);

        setShowDecantingModal(false);
        setDecantingData({
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            supplierId: '',
            containerId: '',
            totalKG: 0,
            ratePerKG: CNG_RATE_PER_KG,
            carriageCharges: 0,
            unloadingPoint: 'Cascade Bank 1 (Primary)',
        });
    };

    // Stats derived from real data
    const totalReceived30Days = useMemo(() => {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        return decantingRecords
            .filter(r => r.createdAt >= cutoff)
            .reduce((sum, r) => sum + r.totalKG, 0);
    }, [decantingRecords]);

    const totalSpent30Days = useMemo(() => {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        return decantingRecords
            .filter(r => r.createdAt >= cutoff)
            .reduce((sum, r) => sum + r.totalCost, 0);
    }, [decantingRecords]);

    // Consumption estimate from CNG shifts (net KG sold)
    const totalKGSold = useMemo(() => {
        return shifts.reduce((sum, s) => sum + s.totalLitersSold, 0); // CNG uses liters field for KG
    }, [shifts]);

    const filteredHistory = useMemo(
        () =>
            decantingRecords.filter(
                r =>
                    r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.containerId.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [decantingRecords, searchTerm]
    );

    // Stock status thresholds
    const stockStatus = totalCNGStock > 3000 ? 'GOOD' : totalCNGStock > 1000 ? 'MODERATE' : 'LOW';
    const stockColor =
        stockStatus === 'GOOD' ? 'emerald' : stockStatus === 'MODERATE' ? 'amber' : 'rose';

    return (
        <div className="p-4 md:p-8 space-y-8">
            <PageHeader
                title="CNG Inventory"
                subtitle="Track gas stock, decanting logs, and supply chain logistics"
                actions={
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowDecantingModal(true)}
                    >
                        <ArrowDownToLine size={18} /> Record Decanting
                    </Button>
                }
            />

            {/* Success Banner */}
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700"
                >
                    <CheckCircle2 size={20} />
                    <span className="font-bold">{successMessage}</span>
                </motion.div>
            )}

            {/* Stock Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Live Stock */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl relative overflow-hidden group">
                        <div
                            className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 transition-all group-hover:opacity-40 ${stockStatus === 'GOOD' ? 'bg-emerald-500' : stockStatus === 'MODERATE' ? 'bg-amber-500' : 'bg-rose-500'}`}
                        />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Wind size={16} className="text-[var(--text-secondary)]" />
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                                    Live Stock
                                </p>
                            </div>
                            <h3 className="text-xl font-black mb-2">CNG Raw Gas</h3>
                            <div className="flex items-baseline gap-2 mb-4 text-primary">
                                <span className="text-4xl font-black">
                                    {totalCNGStock.toLocaleString()}
                                </span>
                                <span className="text-sm font-bold opacity-60">KG</span>
                            </div>
                            <Badge color={stockColor as any}>{stockStatus}</Badge>
                        </div>
                    </Card>
                </motion.div>

                {/* Compressor Count */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 bg-blue-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={16} className="text-[var(--text-secondary)]" />
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                                    Compressors
                                </p>
                            </div>
                            <h3 className="text-xl font-black mb-2">Active Units</h3>
                            <div className="flex items-baseline gap-2 mb-4 text-primary">
                                <span className="text-4xl font-black">
                                    {compressors.filter(c => c.status === 'OPERATIONAL').length ||
                                        '—'}
                                </span>
                                <span className="text-sm font-bold opacity-60">
                                    / {compressors.length || 0}
                                </span>
                            </div>
                            <Badge color="blue">
                                {compressors.length === 0 ? 'CONFIGURE IN SETTINGS' : 'UNITS'}
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Stats Panel */}
                <Card className="p-6 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-primary/10 opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-around items-center gap-6">
                        <div className="text-center">
                            <Package className="mx-auto mb-2 text-primary opacity-50" size={24} />
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                Received (30 Days)
                            </p>
                            <p className="text-2xl font-black">
                                {totalReceived30Days > 0
                                    ? `${totalReceived30Days.toLocaleString()} KG`
                                    : '—'}
                            </p>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <TrendingUp
                                className="mx-auto mb-2 text-emerald-400 opacity-50"
                                size={24}
                            />
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                Total Shifts Sold
                            </p>
                            <p className="text-2xl font-black text-emerald-400">
                                {totalKGSold > 0 ? `${totalKGSold.toLocaleString()} KG` : '—'}
                            </p>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block" />
                        <div className="text-center">
                            <Package
                                className="mx-auto mb-2 text-yellow-400 opacity-50"
                                size={24}
                            />
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                Spend (30 Days)
                            </p>
                            <p className="text-2xl font-black text-yellow-400">
                                {totalSpent30Days > 0 ? formatCurrency(totalSpent30Days) : '—'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* History Table */}
            <Card className="bg-white/40 backdrop-blur-xl border-white/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <History size={20} className="text-primary" /> Decanting & Purchase History
                        <Badge color="blue">{decantingRecords.length} records</Badge>
                    </h3>
                    <div className="relative w-full md:w-64">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                            size={14}
                        />
                        <input
                            type="text"
                            placeholder="Search supplier or truck ID..."
                            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/50 border border-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-16">
                            <Box size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold opacity-40 uppercase tracking-widest text-sm">
                                No decanting records yet
                            </p>
                            <p className="text-xs opacity-30 mt-1">
                                Record your first gas delivery using the button above
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-active)] text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Supplier</th>
                                    <th className="p-4">Truck / Container ID</th>
                                    <th className="p-4">Volume (KG)</th>
                                    <th className="p-4">Total Cost</th>
                                    <th className="p-4">Unloading Point</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {filteredHistory.map((record: DecantingRecord) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-white/30 transition-colors"
                                    >
                                        <td className="p-4 font-bold text-sm tracking-tight">
                                            {formatDate(record.date || record.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Truck size={16} />
                                                </div>
                                                <span className="font-bold text-sm">
                                                    {record.supplier}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-xs opacity-70">
                                            {record.containerId || '—'}
                                        </td>
                                        <td className="p-4 font-black text-primary">
                                            {record.totalKG.toLocaleString()} KG
                                        </td>
                                        <td className="p-4 font-bold text-emerald-600">
                                            {formatCurrency(record.totalCost)}
                                        </td>
                                        <td className="p-4 text-sm opacity-70">
                                            {record.unloadingPoint}
                                        </td>
                                        <td className="p-4">
                                            <Badge color="emerald">RECEIVED</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Decanting Modal */}
            <Modal
                isOpen={showDecantingModal}
                onClose={() => setShowDecantingModal(false)}
                title="Record Gas Delivery (Decanting)"
                size="md"
            >
                <div className="space-y-5">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Delivery Date *
                        </label>
                        <input
                            type="date"
                            className="w-full p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                            value={decantingData.date}
                            onChange={e =>
                                setDecantingData({ ...decantingData, date: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Supplier dropdown from real supplier store */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                Supplier *
                            </label>
                            {suppliers.length > 0 ? (
                                <select
                                    className="w-full p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                                    value={decantingData.supplierId}
                                    onChange={e => {
                                        const sup = suppliers.find(
                                            s => s.supplierId === e.target.value
                                        );
                                        setDecantingData({
                                            ...decantingData,
                                            supplierId: e.target.value,
                                            supplier: sup?.name ?? '',
                                        });
                                    }}
                                >
                                    <option value="">-- Select Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.supplierId} value={s.supplierId}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    placeholder="e.g. SSGC Bulkers"
                                    value={decantingData.supplier}
                                    onChange={e =>
                                        setDecantingData({
                                            ...decantingData,
                                            supplier: e.target.value,
                                        })
                                    }
                                />
                            )}
                        </div>
                        <Input
                            label="Truck / Container ID"
                            placeholder="TR-XXXX"
                            value={decantingData.containerId}
                            onChange={e =>
                                setDecantingData({ ...decantingData, containerId: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Total KG Received *"
                            type="number"
                            placeholder="0.00"
                            value={decantingData.totalKG || ''}
                            onChange={e =>
                                setDecantingData({
                                    ...decantingData,
                                    totalKG: parseFloat(e.target.value) || 0,
                                })
                            }
                            icon={<Box className="text-primary" size={16} />}
                        />
                        <Input
                            label="Rate / KG (PKR)"
                            type="number"
                            value={decantingData.ratePerKG}
                            onChange={e =>
                                setDecantingData({
                                    ...decantingData,
                                    ratePerKG: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                        <Input
                            label="Carriage Charges (PKR)"
                            type="number"
                            placeholder="0"
                            value={decantingData.carriageCharges || ''}
                            onChange={e =>
                                setDecantingData({
                                    ...decantingData,
                                    carriageCharges: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                            Unloading Point
                        </label>
                        <select
                            className="w-full p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                            value={decantingData.unloadingPoint}
                            onChange={e =>
                                setDecantingData({
                                    ...decantingData,
                                    unloadingPoint: e.target.value,
                                })
                            }
                        >
                            <option>Cascade Bank 1 (Primary)</option>
                            <option>Cascade Bank 2 (Secondary)</option>
                            <option>Direct Line</option>
                        </select>
                    </div>

                    {/* Cost Summary */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Gas Cost</span>
                            <span className="font-bold text-primary">
                                {formatCurrency(decantingData.totalKG * decantingData.ratePerKG)}
                            </span>
                        </div>
                        {decantingData.carriageCharges > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Carriage</span>
                                <span className="font-bold">
                                    {formatCurrency(decantingData.carriageCharges)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm border-t border-primary/10 pt-2">
                            <span className="font-bold text-slate-700">Total Payable</span>
                            <span className="font-black text-primary text-lg">
                                {formatCurrency(estimatedCost)}
                            </span>
                        </div>
                        {decantingData.supplierId && (
                            <p className="text-xs text-emerald-600 font-medium">
                                ✓ Will be posted to supplier ledger automatically
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowDecantingModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveDecanting}
                            disabled={!decantingData.supplier || decantingData.totalKG <= 0}
                        >
                            <ArrowDownToLine size={18} />
                            Confirm Delivery
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
