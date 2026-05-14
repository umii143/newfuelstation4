import React, { useState } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUserId } from '@/lib/authHelpers';
import { useFuelStore } from '@/stores/fuelStore';
import type { FuelType } from '@/types';
import {
    Truck, CheckCircle2, AlertTriangle, Camera, ClipboardList,
    ArrowRight, ShieldAlert, ChevronRight, Clock
} from 'lucide-react';

const FUEL_LABEL: Record<string, string> = {
    PETROL_92: 'Petrol 92', PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel (HSD)', PREMIUM_DIESEL: 'Premium Diesel', CNG: 'CNG',
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

export const StockReceipt: React.FC = () => {
    const { dispatches, confirmStockReceipt } = useAntiFraudStore();
    const { user } = useAuthStore();
    const { tanks, updateTank } = useFuelStore();

    // Filter dispatches that belong to this station and are IN_TRANSIT
    const myStationId = user?.stationId || '';
    const pendingDispatches = dispatches.filter(
        d => d.toStationId === myStationId && d.status === 'IN_TRANSIT'
    );
    const recentDispatches = dispatches.filter(
        d => d.toStationId === myStationId && d.status !== 'IN_TRANSIT'
    ).slice(0, 5);

    // Wizard state
    const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
    const [step, setStep] = useState<WizardStep>(1);
    const [beforeDip, setBeforeDip] = useState<number>(0);
    const [afterDip, setAfterDip] = useState<number>(0);
    const [sealIntact, setSealIntact] = useState<boolean | null>(null);
    const [notes, setNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [resultStatus, setResultStatus] = useState<'CONFIRMED' | 'DISPUTED' | null>(null);

    const selectedDispatch = dispatches.find(d => d.dispatchId === selectedDispatchId);
    const receivedQty = Math.max(0, afterDip - beforeDip);
    const dispatched = selectedDispatch?.quantityDispatched ?? 0;
    const variance = dispatched - receivedQty;
    const variancePct = dispatched > 0 ? (variance / dispatched) * 100 : 0;
    const isFraud = variancePct > 2 || sealIntact === false;

    const resetWizard = () => {
        setSelectedDispatchId(null);
        setStep(1);
        setBeforeDip(0);
        setAfterDip(0);
        setSealIntact(null);
        setNotes('');
        setSubmitted(false);
        setResultStatus(null);
    };

    const handleConfirm = () => {
        if (!selectedDispatch || sealIntact === null) return;

        // Confirm receipt in anti-fraud store (triggers FR-01/FR-17 if needed)
        confirmStockReceipt(
            selectedDispatch.dispatchId,
            getCurrentUserId(),
            receivedQty,
            beforeDip,
            afterDip,
            sealIntact,
            notes
        );

        // Only update tank if within tolerance AND seal intact
        if (variancePct <= 2 && sealIntact) {
            const tank = tanks.find(t => t.fuelType === (selectedDispatch.fuelType as FuelType));
            if (tank) {
                updateTank(tank.tankId, { currentLevel: tank.currentLevel + receivedQty });
            }
            setResultStatus('CONFIRMED');
        } else {
            setResultStatus('DISPUTED');
        }

        setSubmitted(true);
    };

    if (submitted && resultStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    {resultStatus === 'CONFIRMED' ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black text-emerald-400 mb-2">Receipt Confirmed ✓</h2>
                            <p className="text-slate-400 mb-2">
                                <strong className="text-white">{receivedQty.toLocaleString()}L</strong> of{' '}
                                {FUEL_LABEL[selectedDispatch?.fuelType || ''] || selectedDispatch?.fuelType} added to tank.
                            </p>
                            <p className="text-xs text-slate-500 mb-6">
                                Variance: {variancePct.toFixed(2)}% — Within acceptable tolerance.
                                This record is now permanently locked.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-6">
                                <ShieldAlert size={40} className="text-red-400" />
                            </div>
                            <h2 className="text-2xl font-black text-red-400 mb-2">Discrepancy Flagged 🚨</h2>
                            <p className="text-slate-300 mb-2">
                                Dispatched: <strong>{dispatched.toLocaleString()}L</strong> | Received: <strong>{receivedQty.toLocaleString()}L</strong>
                            </p>
                            <p className="text-red-400 font-bold mb-2">
                                Shortage: {variance.toLocaleString()}L ({variancePct.toFixed(2)}%)
                                {!sealIntact && ' | Seal Broken'}
                            </p>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-6 text-sm text-slate-400">
                                A CRITICAL fraud alert (FR-{!sealIntact ? '17' : '01'}) has been sent to the Owner.
                                <br />Tank level has <strong className="text-red-400">NOT</strong> been updated pending owner resolution.
                            </div>
                        </>
                    )}
                    <button
                        onClick={resetWizard}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-black"
                    >
                        Return to Stock Receipt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Truck size={20} />
                    </div>
                    Stock Receipt Confirmation
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Confirm every tanker arrival. Your entry is final and cannot be edited.
                </p>
            </div>

            {/* No active wizard → show pending + recent */}
            {!selectedDispatchId && (
                <div className="space-y-6">
                    {/* Pending Confirmations */}
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <Clock size={14} className="text-amber-400" />
                            Pending Confirmations ({pendingDispatches.length})
                        </h2>
                        {pendingDispatches.length === 0 ? (
                            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-8 text-center">
                                <CheckCircle2 size={32} className="text-emerald-500/50 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold">No pending deliveries</p>
                                <p className="text-slate-600 text-sm">All dispatches have been confirmed.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingDispatches.map(d => {
                                    const dispatchedAt = new Date(d.createdAt);
                                    const hoursAgo = Math.floor((Date.now() - dispatchedAt.getTime()) / 3600000);
                                    return (
                                        <button
                                            key={d.dispatchId}
                                            onClick={() => { setSelectedDispatchId(d.dispatchId); setStep(1); }}
                                            className="w-full bg-amber-900/20 border border-amber-500/40 rounded-2xl p-4 text-left hover:border-amber-400 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                                            🚚 IN TRANSIT
                                                        </span>
                                                        <span className="text-xs text-slate-500">{d.challanNumber}</span>
                                                    </div>
                                                    <p className="font-black">{FUEL_LABEL[d.fuelType]} — {d.quantityDispatched.toLocaleString()}L</p>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        Driver: {d.driverName} | Tanker: {d.tankerNumber}
                                                    </p>
                                                    <p className="text-xs text-amber-400 mt-1">
                                                        {hoursAgo >= 4 ? `⚠ ${hoursAgo}h ago — OVERDUE` : `Dispatched ${hoursAgo}h ago`}
                                                    </p>
                                                </div>
                                                <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Receipts */}
                    {recentDispatches.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                <ClipboardList size={14} /> Recent Receipts
                            </h2>
                            <div className="space-y-2">
                                {recentDispatches.map(d => (
                                    <div key={d.dispatchId}
                                        className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            d.status === 'CONFIRMED' ? 'bg-emerald-400' : 'bg-red-400'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">{FUEL_LABEL[d.fuelType]} — {d.quantityDispatched.toLocaleString()}L dispatched</p>
                                            <p className="text-xs text-slate-500">
                                                Received: {d.quantityReceived?.toLocaleString() ?? '—'}L |{' '}
                                                {new Date(d.createdAt).toLocaleDateString('en-PK')}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                                            d.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Wizard */}
            {selectedDispatchId && selectedDispatch && (
                <div className="max-w-xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center gap-1 mb-6">
                        {[1, 2, 3, 4].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                    step > s ? 'bg-emerald-500 text-white' :
                                    step === s ? 'bg-blue-600 text-white' :
                                    'bg-slate-700 text-slate-500'
                                }`}>{step > s ? '✓' : s}</div>
                                {i < 3 && <div className={`flex-1 h-0.5 ${step > s + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Dispatch Info Banner */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 mb-5">
                        <p className="text-xs text-blue-400 uppercase font-black mb-1">Incoming Delivery — {selectedDispatch.challanNumber}</p>
                        <p className="text-lg font-black">{FUEL_LABEL[selectedDispatch.fuelType]} — {selectedDispatch.quantityDispatched.toLocaleString()}L</p>
                        <p className="text-sm text-slate-400">Driver: {selectedDispatch.driverName} | Tanker: {selectedDispatch.tankerNumber}</p>
                    </div>

                    {/* Step 1: Tanker Seal Check */}
                    {step === 1 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                            <h3 className="font-black text-lg">Step 1: Verify Tanker Seal</h3>
                            <p className="text-slate-400 text-sm">Before unloading begins, check if the tanker's seal is intact.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSealIntact(true)}
                                    className={`p-5 rounded-2xl border-2 transition-all font-black text-center ${
                                        sealIntact === true
                                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                            : 'border-slate-600 text-slate-400 hover:border-emerald-500/50'
                                    }`}>
                                    <CheckCircle2 size={28} className="mx-auto mb-2" />
                                    Seal Intact ✓
                                </button>
                                <button
                                    onClick={() => setSealIntact(false)}
                                    className={`p-5 rounded-2xl border-2 transition-all font-black text-center ${
                                        sealIntact === false
                                            ? 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'border-slate-600 text-slate-400 hover:border-red-500/50'
                                    }`}>
                                    <ShieldAlert size={28} className="mx-auto mb-2" />
                                    Seal Broken ⚠
                                </button>
                            </div>
                            {sealIntact === false && (
                                <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3 text-sm text-red-300">
                                    ⚠ Broken seal will trigger a <strong>CRITICAL FR-17 Alert</strong> to the owner immediately after submission.
                                    You must still complete the receipt process.
                                </div>
                            )}
                            <button
                                onClick={() => setStep(2)}
                                disabled={sealIntact === null}
                                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all font-black flex items-center justify-center gap-2"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                            <button onClick={resetWizard} className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors">
                                Cancel & Return
                            </button>
                        </div>
                    )}

                    {/* Step 2: Before Dip */}
                    {step === 2 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                            <h3 className="font-black text-lg">Step 2: Before Dip Reading</h3>
                            <p className="text-slate-400 text-sm">
                                Measure the tank level <strong className="text-white">BEFORE</strong> the tanker starts unloading.
                            </p>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tank Level Before Unloading (Liters)</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    value={beforeDip || ''}
                                    onChange={e => setBeforeDip(parseFloat(e.target.value) || 0)}
                                    placeholder="Enter dip reading in liters"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl font-black focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="bg-slate-700/30 rounded-xl p-3 flex items-center gap-2 text-sm text-slate-400">
                                <Camera size={16} className="shrink-0 text-blue-400" />
                                In the full system, a photo of the dip stick is required here.
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-all font-bold">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={beforeDip <= 0}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all font-black"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: After Dip */}
                    {step === 3 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                            <h3 className="font-black text-lg">Step 3: After Dip Reading</h3>
                            <p className="text-slate-400 text-sm">
                                After unloading is <strong className="text-white">COMPLETE</strong>, measure the tank level again.
                            </p>
                            <div className="bg-slate-700/30 rounded-xl p-3 text-sm">
                                <p className="text-slate-400">Before Dip: <span className="text-white font-black">{beforeDip.toLocaleString()}L</span></p>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tank Level After Unloading (Liters)</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={beforeDip}
                                    value={afterDip || ''}
                                    onChange={e => setAfterDip(parseFloat(e.target.value) || 0)}
                                    placeholder="Enter dip reading in liters"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl font-black focus:border-blue-500 outline-none"
                                />
                            </div>
                            {afterDip > 0 && (
                                <div className="bg-slate-900/60 rounded-xl p-3 text-sm">
                                    <p className="text-slate-400">Fuel received: <span className="text-emerald-400 font-black text-lg">{receivedQty.toLocaleString()}L</span></p>
                                </div>
                            )}
                            <div className="bg-slate-700/30 rounded-xl p-3 flex items-center gap-2 text-sm text-slate-400">
                                <Camera size={16} className="shrink-0 text-blue-400" />
                                In the full system, a photo of the dip stick is required here.
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)}
                                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-all font-bold">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={afterDip <= beforeDip}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all font-black"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Confirm */}
                    {step === 4 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                            <h3 className="font-black text-lg">Step 4: Review & Confirm</h3>

                            {/* Variance Summary */}
                            <div className={`rounded-2xl p-5 border ${
                                isFraud
                                    ? 'bg-red-900/30 border-red-500/50'
                                    : 'bg-emerald-900/20 border-emerald-500/30'
                            }`}>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Dispatched by Owner</p>
                                        <p className="text-2xl font-black text-blue-400">{dispatched.toLocaleString()}L</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Confirmed Received</p>
                                        <p className="text-2xl font-black text-white">{receivedQty.toLocaleString()}L</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                                    isFraud ? 'bg-red-500/20' : 'bg-emerald-500/20'
                                }`}>
                                    {isFraud ? <AlertTriangle size={18} className="text-red-400 shrink-0" /> : <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                                    <div>
                                        <p className={`font-black text-sm ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isFraud
                                                ? `⚠ DISCREPANCY: ${variance.toLocaleString()}L short (${variancePct.toFixed(2)}%)`
                                                : `✓ Within tolerance (${variancePct.toFixed(2)}% variance)`
                                            }
                                        </p>
                                        {!sealIntact && (
                                            <p className="text-red-400 text-xs font-bold mt-0.5">+ Tanker seal was broken</p>
                                        )}
                                    </div>
                                </div>
                                {isFraud && (
                                    <p className="text-red-400 text-xs mt-2">
                                        This will trigger a CRITICAL alert to the owner. Tank will NOT be updated until owner resolves.
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Additional Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Any observations about the delivery..."
                                    rows={3}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-400 font-bold">
                                ⚠ This submission is FINAL. You cannot edit after confirming. Your PIN and timestamp are permanently recorded.
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(3)}
                                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-all font-bold">
                                    ← Back
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-3 rounded-xl transition-all font-black ${
                                        isFraud
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {isFraud ? '🚨 Submit & Alert Owner' : '✓ Confirm Receipt'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
