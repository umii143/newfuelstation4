import React, { useState } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { useSupplierStore } from '@/stores/dataStores';
import type { FuelType } from '@/types';
import { Package, Plus, Truck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const STATIONS = [
    { id: 'STN-001', name: 'Station 1 — GT Road', manager: 'Brother 1' },
    { id: 'STN-002', name: 'Station 2 — Main Bazaar', manager: 'Brother 2' },
    { id: 'STN-003', name: 'Station 3 — Bypass Road', manager: 'Brother 3' },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
    { value: 'PETROL_92', label: 'Petrol 92 (Super)' },
    { value: 'PETROL_95', label: 'Petrol 95' },
    { value: 'DIESEL', label: 'Diesel (HSD)' },
    { value: 'PREMIUM_DIESEL', label: 'Premium Diesel' },
    { value: 'CNG', label: 'CNG' },
];

const FUEL_LABEL: Record<string, string> = {
    PETROL_92: 'Petrol 92', PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel', PREMIUM_DIESEL: 'Premium Diesel', CNG: 'CNG',
};

type ActiveTab = 'pool' | 'purchase' | 'dispatch';

export const StockManagement: React.FC = () => {
    const { ownerStockPool, purchases, dispatches, createStockPurchase, createStockDispatch } = useAntiFraudStore();
    const { suppliers } = useSupplierStore();
    const fuelSuppliers = suppliers.filter(s => s.type === 'FUEL_SUPPLIER');

    const [activeTab, setActiveTab] = useState<ActiveTab>('pool');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Purchase form
    const [purFuelType, setPurFuelType] = useState<FuelType>('PETROL_92');
    const [purQty, setPurQty] = useState<number>(0);
    const [purRate, setPurRate] = useState<number>(0);
    const [purSupplier, setPurSupplier] = useState('');
    const [purInvoice, setPurInvoice] = useState('');
    const [purPayMethod, setPurPayMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT'>('CASH');
    const [purStatus, setPurStatus] = useState<'PAID' | 'PARTIAL' | 'CREDIT_DUE'>('PAID');
    const [purAmtPaid, setPurAmtPaid] = useState<number>(0);
    const [purNote, setPurNote] = useState('');

    // Dispatch form
    const [disStation, setDisStation] = useState('');
    const [disFuelType, setDisFuelType] = useState<FuelType>('PETROL_92');
    const [disQty, setDisQty] = useState<number>(0);
    const [disTanker, setDisTanker] = useState('');
    const [disDriver, setDisDriver] = useState('');
    const [disDriverCnic, setDisDriverCnic] = useState('');
    const [disDriverPhone, setDisDriverPhone] = useState('');

    const totalCost = purQty * purRate;
    const availableForDispatch = ownerStockPool[disFuelType] || 0;

    const handlePurchase = () => {
        if (!purSupplier || purQty <= 0 || purRate <= 0 || !purInvoice) return;
        const supplier = fuelSuppliers.find(s => s.supplierId === purSupplier);
        createStockPurchase({
            purchaseDate: new Date().toISOString(),
            supplierId: purSupplier,
            fuelType: purFuelType,
            quantityLiters: purQty,
            ratePerLiter: purRate,
            totalCost,
            invoiceNumber: purInvoice,
            paymentMethod: purPayMethod,
            paymentStatus: purStatus,
            amountPaid: purStatus === 'PAID' ? totalCost : purAmtPaid,
            amountDue: purStatus === 'PAID' ? 0 : totalCost - purAmtPaid,
            notes: purNote || `Purchase from ${supplier?.name || 'Unknown'}`
        });
        // Reset form
        setPurQty(0); setPurRate(0); setPurInvoice(''); setPurNote('');
    };

    const handleDispatch = () => {
        if (!disStation || disQty <= 0 || !disTanker || !disDriver) return;
        if (disQty > availableForDispatch) {
            alert(`Insufficient stock! Only ${availableForDispatch.toLocaleString()}L available in Owner Pool.`);
            return;
        }
        const poolRate = purchases.filter(p => p.fuelType === disFuelType).slice(-1)[0]?.ratePerLiter || 0;
        createStockDispatch({
            dispatchDate: new Date().toISOString(),
            fromPool: 'OWNER_POOL',
            toStationId: disStation,
            fuelType: disFuelType,
            quantityDispatched: disQty,
            tankerNumber: disTanker,
            driverName: disDriver,
            driverCnic: disDriverCnic,
            driverPhone: disDriverPhone,
            challanNumber: `CHL-${Date.now()}`,
            costPricePerLiter: poolRate,
            totalCostValue: disQty * poolRate,
        });
        setDisQty(0); setDisTanker(''); setDisDriver(''); setDisDriverCnic(''); setDisDriverPhone('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    Stock Management
                </h1>
                <p className="text-slate-400 text-sm mt-1">Purchase fuel into the Owner Pool, then dispatch to stations</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-800/60 p-1 rounded-2xl border border-slate-700/50">
                {(['pool', 'purchase', 'dispatch'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                            activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {tab === 'pool' ? '📦 Owner Pool' : tab === 'purchase' ? '🛒 Purchase' : '🚚 Dispatch'}
                    </button>
                ))}
            </div>

            {/* Pool View */}
            {activeTab === 'pool' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FUEL_TYPES.map(({ value, label }) => {
                            const qty = ownerStockPool[value] || 0;
                            return (
                                <div key={value} className={`rounded-2xl p-5 border transition-all ${
                                    qty > 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/40'
                                }`}>
                                    <p className="text-xs text-slate-400 uppercase font-black tracking-wider mb-1">{label}</p>
                                    <p className={`text-4xl font-black ${qty > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {qty.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Liters in pool</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Purchases */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                        <button
                            className="w-full flex items-center justify-between p-4 text-left"
                            onClick={() => setExpandedSection(expandedSection === 'purchases' ? null : 'purchases')}
                        >
                            <h3 className="font-black text-sm uppercase tracking-wider">Purchase History ({purchases.length})</h3>
                            {expandedSection === 'purchases' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {expandedSection === 'purchases' && (
                            <div className="border-t border-slate-700/50 divide-y divide-slate-700/30">
                                {purchases.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-6">No purchases yet</p>
                                ) : purchases.map(p => (
                                    <div key={p.purchaseId} className="px-4 py-3 flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">{FUEL_LABEL[p.fuelType]} — {p.quantityLiters.toLocaleString()}L</p>
                                            <p className="text-xs text-slate-500">Inv: {p.invoiceNumber} · ₨{p.ratePerLiter}/L</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-sm">₨{p.totalCost.toLocaleString()}</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                p.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                                                p.paymentStatus === 'CREDIT_DUE' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>{p.paymentStatus}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Purchase Form */}
            {activeTab === 'purchase' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                        <h2 className="font-black text-lg flex items-center gap-2">
                            <Plus size={20} className="text-blue-400" /> New Stock Purchase
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Fuel Type</label>
                                <select value={purFuelType} onChange={e => setPurFuelType(e.target.value as FuelType)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Supplier</label>
                                <select value={purSupplier} onChange={e => setPurSupplier(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    <option value="">Select Supplier...</option>
                                    {fuelSuppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.name}</option>)}
                                    <option value="DIRECT">Direct Purchase</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Quantity (Liters)</label>
                                <input type="number" inputMode="numeric" min="0" value={purQty || ''}
                                    onChange={e => setPurQty(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Rate per Liter (₨)</label>
                                <input type="number" inputMode="decimal" min="0" value={purRate || ''}
                                    onChange={e => setPurRate(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Invoice Number</label>
                            <input type="text" value={purInvoice} onChange={e => setPurInvoice(e.target.value)}
                                placeholder="INV-XXXXX"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Payment Method</label>
                                <select value={purPayMethod} onChange={e => setPurPayMethod(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="CREDIT">Credit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Payment Status</label>
                                <select value={purStatus} onChange={e => setPurStatus(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    <option value="PAID">Fully Paid</option>
                                    <option value="PARTIAL">Partial Payment</option>
                                    <option value="CREDIT_DUE">Credit Due</option>
                                </select>
                            </div>
                        </div>

                        {purStatus !== 'PAID' && (
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Amount Paid (₨)</label>
                                <input type="number" inputMode="numeric" value={purAmtPaid || ''}
                                    onChange={e => setPurAmtPaid(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                        )}

                        {/* Cost Summary */}
                        <div className="rounded-2xl bg-blue-900/30 border border-blue-500/30 p-4 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-blue-300 uppercase font-black mb-1">Total Cost</p>
                                <p className="text-3xl font-black text-white">₨{totalCost.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">{purQty.toLocaleString()}L × ₨{purRate}</p>
                                {purStatus !== 'PAID' && (
                                    <p className="text-xs text-amber-400 font-bold mt-1">
                                        Due: ₨{(totalCost - purAmtPaid).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={!purSupplier || purQty <= 0 || purRate <= 0 || !purInvoice}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-black text-lg shadow-lg"
                        >
                            ✓ Confirm Purchase & Add to Owner Pool
                        </button>
                    </div>
                </div>
            )}

            {/* Dispatch Form */}
            {activeTab === 'dispatch' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                        <h2 className="font-black text-lg flex items-center gap-2">
                            <Truck size={20} className="text-blue-400" /> Dispatch to Station
                        </h2>

                        {/* Pool Availability */}
                        <div className="bg-slate-900/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {FUEL_TYPES.map(({ value, label }) => (
                                <div key={value} className="text-center">
                                    <p className="text-xs text-slate-500 font-bold">{label}</p>
                                    <p className={`font-black ${(ownerStockPool[value] || 0) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {(ownerStockPool[value] || 0).toLocaleString()}L
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Destination Station</label>
                                <select value={disStation} onChange={e => setDisStation(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    <option value="">Choose Station...</option>
                                    {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Fuel Type</label>
                                <select value={disFuelType} onChange={e => setDisFuelType(e.target.value as FuelType)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base">
                                    {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                                Quantity to Dispatch (L) — Available: {availableForDispatch.toLocaleString()}L
                            </label>
                            <input type="number" inputMode="numeric" min="0" max={availableForDispatch} value={disQty || ''}
                                onChange={e => setDisQty(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            {disQty > availableForDispatch && (
                                <p className="text-red-400 text-xs mt-1 font-bold">⚠ Exceeds available stock ({availableForDispatch.toLocaleString()}L)</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tanker Number</label>
                                <input type="text" value={disTanker} onChange={e => setDisTanker(e.target.value)}
                                    placeholder="e.g. LHR-1234"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Driver Name</label>
                                <input type="text" value={disDriver} onChange={e => setDisDriver(e.target.value)}
                                    placeholder="Driver full name"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Driver CNIC</label>
                                <input type="text" value={disDriverCnic} onChange={e => setDisDriverCnic(e.target.value)}
                                    placeholder="XXXXX-XXXXXXX-X"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Driver Phone</label>
                                <input type="tel" value={disDriverPhone} onChange={e => setDisDriverPhone(e.target.value)}
                                    placeholder="03XX-XXXXXXX"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:border-blue-500 outline-none text-base" />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl bg-blue-900/30 border border-blue-500/30 p-4 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-blue-300 uppercase font-black">Dispatching</p>
                                <p className="text-2xl font-black">{disQty.toLocaleString()}L</p>
                                <p className="text-xs text-slate-400">{FUEL_LABEL[disFuelType] || disFuelType}</p>
                            </div>
                            {disStation && (
                                <div className="flex items-center gap-2 text-blue-400">
                                    <ArrowRight size={20} />
                                    <div>
                                        <p className="font-black text-sm">{STATIONS.find(s => s.id === disStation)?.name}</p>
                                        <p className="text-xs text-slate-400">Remaining in pool after: {(availableForDispatch - disQty).toLocaleString()}L</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDispatch}
                            disabled={!disStation || disQty <= 0 || disQty > availableForDispatch || !disTanker || !disDriver}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-black text-lg shadow-lg"
                        >
                            🚚 Dispatch Stock to Station
                        </button>

                        {/* Dispatch History */}
                        {dispatches.length > 0 && (
                            <div className="border-t border-slate-700/50 pt-4">
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-3">Recent Dispatches</h3>
                                <div className="space-y-2">
                                    {dispatches.slice(0, 8).map(d => (
                                        <div key={d.dispatchId} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                d.status === 'CONFIRMED' ? 'bg-emerald-400' :
                                                d.status === 'DISPUTED' ? 'bg-red-400' :
                                                'bg-blue-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold">{FUEL_LABEL[d.fuelType]} — {d.quantityDispatched.toLocaleString()}L</p>
                                                <p className="text-xs text-slate-500">→ {STATIONS.find(s => s.id === d.toStationId)?.name || d.toStationId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-black px-2 py-1 rounded-lg ${
                                                    d.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    d.status === 'DISPUTED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-blue-500/20 text-blue-400'}`}>
                                                    {d.status}
                                                </p>
                                                {d.quantityReceived !== undefined && d.quantityReceived !== d.quantityDispatched && (
                                                    <p className="text-xs text-red-400 mt-0.5">Rcvd: {d.quantityReceived}L</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
