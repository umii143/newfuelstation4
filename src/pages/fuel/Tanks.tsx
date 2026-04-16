import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';
import { useSupplierStore } from '@/stores/dataStores';
import { useSupplierLedgerStore } from '@/stores/ledgerStore';
import clsx from 'clsx';
import { CheckCircle, Droplets, Gauge, History, PackagePlus, X } from 'lucide-react';
import React, { useState } from 'react';

interface ReceiveForm {
    tankId: string;
    litersReceived: number;
    supplierId: string;
    invoiceNumber: string;
    ratePerLiter: number;
    date: string;
    notes: string;
}

const defaultReceiveForm: ReceiveForm = {
    tankId: '',
    litersReceived: 0,
    supplierId: '',
    invoiceNumber: '',
    ratePerLiter: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
};

export const TanksPage: React.FC = () => {
    const { tankConfigs, updateTankLevel } = useConfigStore();
    const { suppliers } = useSupplierStore();
    const { addEntry: addSupplierLedgerEntry } = useSupplierLedgerStore();

    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [receiveForm, setReceiveForm] = useState<ReceiveForm>(defaultReceiveForm);
    const [successMessage, setSuccessMessage] = useState('');

    const getFuelColor = (type: string) => {
        switch (type) {
            case 'PETROL_92':
            case 'PETROL_95':
                return 'emerald';
            case 'DIESEL':
            case 'PREMIUM_DIESEL':
                return 'amber';
            default:
                return 'blue';
        }
    };

    const getFillPercentage = (current: number | null, capacity: number | null) => {
        if (!capacity) return 0;
        return Math.min(100, Math.max(0, ((current ?? 0) / capacity) * 100));
    };

    const selectedTank = tankConfigs.find(t => t.tankId === receiveForm.tankId);
    const totalAmount = receiveForm.litersReceived * receiveForm.ratePerLiter;
    const newLevel = (selectedTank?.currentLevel ?? 0) + receiveForm.litersReceived;
    const willOverflow = selectedTank ? newLevel > (selectedTank.capacity ?? 0) : false;

    const handleReceiveFuel = () => {
        if (!receiveForm.tankId || !receiveForm.litersReceived || willOverflow) return;

        const tank = tankConfigs.find(t => t.tankId === receiveForm.tankId);
        if (!tank) return;

        // 1. Update tank level in config store
        updateTankLevel(receiveForm.tankId, newLevel);

        // 2. Post to supplier ledger if supplier selected
        if (receiveForm.supplierId && receiveForm.ratePerLiter > 0) {
            const supplier = suppliers.find(s => s.supplierId === receiveForm.supplierId);
            addSupplierLedgerEntry({
                supplierId: receiveForm.supplierId,
                supplierName: supplier?.name || 'Unknown Supplier',
                date: receiveForm.date,
                shiftId: 'ADMIN-ENTRY',
                type: 'PURCHASE',
                reference: receiveForm.invoiceNumber || `FUEL-${Date.now()}`,
                invoiceNumber: receiveForm.invoiceNumber,
                debit: 0,
                credit: totalAmount,
                remarks: `Fuel Received: ${receiveForm.litersReceived.toLocaleString()}L of ${tank.fuelType.replace('_', ' ')} into ${tank.name}. Rate: ₨${receiveForm.ratePerLiter}/L. ${receiveForm.notes}`,
                staffId: 'OWNER',
                staffName: 'Admin',
            });
        }

        setSuccessMessage(
            `✅ ${receiveForm.litersReceived.toLocaleString()}L added to ${tank.name}. New level: ${newLevel.toLocaleString()}L`
        );
        setReceiveForm(defaultReceiveForm);
        setTimeout(() => {
            setIsReceiveModalOpen(false);
            setSuccessMessage('');
        }, 2000);
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Fuel Tank Monitoring"
                subtitle="Real-time inventory levels, dip readings and fuel receiving"
                actions={
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <Gauge size={18} />
                            Record Dip
                        </Button>
                        <Button
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                            onClick={() => setIsReceiveModalOpen(true)}
                        >
                            <PackagePlus size={18} />
                            Receive Fuel
                        </Button>
                    </div>
                }
            />

            {/* Tank Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tankConfigs.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-[var(--text-secondary)]">
                        <Droplets size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No tanks configured yet. Add tanks in Settings.</p>
                    </div>
                )}
                {tankConfigs.map(tank => {
                    const color = getFuelColor(tank.fuelType);
                    const percentage = getFillPercentage(
                        tank.currentLevel ?? 0,
                        tank.capacity ?? 0
                    );

                    return (
                        <Card
                            key={tank.tankId}
                            className="group relative overflow-hidden border-2 hover:border-blue-500/50 transition-all duration-300"
                        >
                            {/* Background Fill Animation */}
                            <div
                                className={clsx(
                                    'absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-10',
                                    color === 'emerald'
                                        ? 'bg-emerald-500'
                                        : color === 'amber'
                                          ? 'bg-amber-500'
                                          : 'bg-blue-500'
                                )}
                                style={{ height: `${percentage}%` }}
                            />

                            <div className="relative p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                color={
                                                    color === 'emerald'
                                                        ? 'emerald'
                                                        : color === 'amber'
                                                          ? 'amber'
                                                          : 'blue'
                                                }
                                            >
                                                {tank.fuelType.replace('_', ' ')}
                                            </Badge>
                                            {percentage < 20 && (
                                                <Badge color="rose" className="animate-pulse">
                                                    LOW LEVEL
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                                            {tank.name}
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            ID: {tank.tankId}
                                        </p>
                                    </div>
                                    <div
                                        className={clsx(
                                            'p-3 rounded-2xl',
                                            color === 'emerald'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : color === 'amber'
                                                  ? 'bg-amber-500/10 text-amber-500'
                                                  : 'bg-blue-500/10 text-blue-500'
                                        )}
                                    >
                                        <Droplets size={24} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-4xl font-black text-[var(--text-primary)] tracking-tight">
                                            {(tank.currentLevel ?? 0).toLocaleString()}
                                            <span className="text-lg font-medium text-[var(--text-secondary)] ml-1">
                                                L
                                            </span>
                                        </span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-[var(--text-secondary)]">
                                                Capacity
                                            </span>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                {(tank.capacity ?? 0).toLocaleString()} L
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border)]">
                                        <div
                                            className={clsx(
                                                'h-full rounded-full transition-all duration-1000 relative overflow-hidden',
                                                percentage < 20
                                                    ? 'bg-rose-500'
                                                    : color === 'emerald'
                                                      ? 'bg-emerald-500'
                                                      : color === 'amber'
                                                        ? 'bg-amber-500'
                                                        : 'bg-blue-500'
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
                                        <span>0%</span>
                                        <span>{percentage.toFixed(0)}% Full</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                                                Available Space
                                            </p>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                {(
                                                    (tank.capacity ?? 0) - (tank.currentLevel ?? 0)
                                                ).toLocaleString()}{' '}
                                                L
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                                                Reorder Point
                                            </p>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                {(tank.reorderPoint ?? 0).toLocaleString()} L
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 ml-4"
                                        onClick={() => {
                                            setReceiveForm({
                                                ...defaultReceiveForm,
                                                tankId: tank.tankId,
                                            });
                                            setIsReceiveModalOpen(true);
                                        }}
                                    >
                                        <PackagePlus size={14} className="mr-1" />
                                        Receive
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Receive Fuel Modal */}
            {isReceiveModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[var(--bg-surface)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-emerald-500/10 to-teal-500/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <PackagePlus className="text-emerald-500" size={22} />
                                    Receive Fuel Stock
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    Record fuel delivery and update tank level
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsReceiveModalOpen(false);
                                    setReceiveForm(defaultReceiveForm);
                                    setSuccessMessage('');
                                }}
                                className="p-2 hover:bg-[var(--bg-elevated)] rounded-full"
                            >
                                <X size={20} className="text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {/* Success */}
                        {successMessage && (
                            <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-700">
                                <CheckCircle size={20} />
                                <p className="text-sm font-semibold">{successMessage}</p>
                            </div>
                        )}

                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Tank Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Select Tank *
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                    value={receiveForm.tankId}
                                    onChange={e =>
                                        setReceiveForm({ ...receiveForm, tankId: e.target.value })
                                    }
                                >
                                    <option value="">-- Select Tank --</option>
                                    {tankConfigs.map(t => (
                                        <option key={t.tankId} value={t.tankId}>
                                            {t.name} — {t.fuelType.replace('_', ' ')} (Current:{' '}
                                            {(t.currentLevel ?? 0).toLocaleString()}L / Cap:{' '}
                                            {(t.capacity ?? 0).toLocaleString()}L)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Liters Received */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                        Liters Received *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={clsx(
                                            'w-full p-3 rounded-xl bg-[var(--bg-elevated)] border text-[var(--text-primary)] focus:outline-none',
                                            willOverflow
                                                ? 'border-rose-500 focus:border-rose-500'
                                                : 'border-[var(--border)] focus:border-emerald-500'
                                        )}
                                        placeholder="e.g. 10000"
                                        value={receiveForm.litersReceived || ''}
                                        onChange={e =>
                                            setReceiveForm({
                                                ...receiveForm,
                                                litersReceived: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                    {willOverflow && (
                                        <p className="text-xs text-rose-500">
                                            ⚠ Exceeds tank capacity by{' '}
                                            {(
                                                newLevel - (selectedTank?.capacity ?? 0)
                                            ).toLocaleString()}
                                            L!
                                        </p>
                                    )}
                                    {selectedTank &&
                                        !willOverflow &&
                                        receiveForm.litersReceived > 0 && (
                                            <p className="text-xs text-emerald-600">
                                                ✓ New level: {newLevel.toLocaleString()}L
                                            </p>
                                        )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                        Rate / Liter (₨)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. 280"
                                        value={receiveForm.ratePerLiter || ''}
                                        onChange={e =>
                                            setReceiveForm({
                                                ...receiveForm,
                                                ratePerLiter: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Total Amount display */}
                            {totalAmount > 0 && (
                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex justify-between items-center">
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        Total Invoice Amount
                                    </span>
                                    <span className="font-bold text-blue-600 text-lg">
                                        ₨{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {/* Supplier */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Supplier (for Ledger Entry)
                                </label>
                                <select
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                    value={receiveForm.supplierId}
                                    onChange={e =>
                                        setReceiveForm({
                                            ...receiveForm,
                                            supplierId: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">-- No Supplier (skip ledger entry) --</option>
                                    {suppliers
                                        .filter(s => s.status === 'ACTIVE')
                                        .map(s => (
                                            <option key={s.supplierId} value={s.supplierId}>
                                                {s.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Invoice & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                        Invoice Number
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                        placeholder="INV-..."
                                        value={receiveForm.invoiceNumber}
                                        onChange={e =>
                                            setReceiveForm({
                                                ...receiveForm,
                                                invoiceNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                        value={receiveForm.date}
                                        onChange={e =>
                                            setReceiveForm({ ...receiveForm, date: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Notes / Remarks
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                    rows={2}
                                    placeholder="Optional notes..."
                                    value={receiveForm.notes}
                                    onChange={e =>
                                        setReceiveForm({ ...receiveForm, notes: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setIsReceiveModalOpen(false);
                                    setReceiveForm(defaultReceiveForm);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                onClick={handleReceiveFuel}
                                disabled={
                                    !receiveForm.tankId ||
                                    !receiveForm.litersReceived ||
                                    willOverflow ||
                                    !!successMessage
                                }
                            >
                                <PackagePlus size={16} className="mr-2" />
                                Confirm Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Section */}
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                        <History size={20} className="text-blue-500" />
                        Tank Summary
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] uppercase tracking-wider font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Tank Name</th>
                                <th className="px-6 py-4">Fuel Type</th>
                                <th className="px-6 py-4 text-right">Current Level</th>
                                <th className="px-6 py-4 text-right">Capacity</th>
                                <th className="px-6 py-4 text-right">Fill %</th>
                                <th className="px-6 py-4 text-right">Available Space</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {tankConfigs.map(tank => {
                                const pct = getFillPercentage(tank.currentLevel, tank.capacity);
                                return (
                                    <tr
                                        key={tank.tankId}
                                        className="hover:bg-[var(--bg-elevated)] transition-colors"
                                    >
                                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                                            {tank.name}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                                            <Badge
                                                color={
                                                    getFuelColor(tank.fuelType) as
                                                        | 'emerald'
                                                        | 'amber'
                                                        | 'blue'
                                                }
                                            >
                                                {tank.fuelType.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold font-mono text-[var(--text-primary)]">
                                            {(tank.currentLevel ?? 0).toLocaleString()} L
                                        </td>
                                        <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
                                            {(tank.capacity ?? 0).toLocaleString()} L
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={clsx(
                                                    'font-semibold',
                                                    pct < 20
                                                        ? 'text-rose-500'
                                                        : pct < 50
                                                          ? 'text-amber-500'
                                                          : 'text-emerald-500'
                                                )}
                                            >
                                                {pct.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
                                            {(
                                                (tank.capacity ?? 0) - (tank.currentLevel ?? 0)
                                            ).toLocaleString()}{' '}
                                            L
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {tankConfigs.length === 0 && (
                        <div className="p-12 text-center text-[var(--text-secondary)]">
                            <p>No tanks configured. Add tanks via Settings.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
