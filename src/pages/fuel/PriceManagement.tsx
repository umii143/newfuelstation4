import { Badge, Button, Card, Input, PageHeader } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';
import { useRateImpactStore } from '@/stores/rateImpactStore';
import type { FuelType, RateChangeReason } from '@/types';
import clsx from 'clsx';
import { format } from 'date-fns';
import {
    BarChart3,
    Clock,
    Droplets,
    History,
    Save,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { getCurrentUserId, getCurrentUserName } from '@/lib/authHelpers';

const FUEL_LABELS: Record<FuelType, string> = {
    PETROL_92: 'Petrol 92',
    PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel',
    PREMIUM_DIESEL: 'Premium Diesel',
    CNG: 'CNG',
};

const FUEL_BADGE: Record<FuelType, 'emerald' | 'amber' | 'blue'> = {
    PETROL_92: 'emerald',
    PETROL_95: 'emerald',
    DIESEL: 'amber',
    PREMIUM_DIESEL: 'amber',
    CNG: 'blue',
};

interface PriceManagementProps {
    onNavigate?: (path: string) => void;
}

const reasonOptions: { value: RateChangeReason; label: string }[] = [
    { value: 'OMC_RATE_CHANGE', label: 'OMC Official Revision' },
    { value: 'MARKET_CONDITIONS', label: 'Market Conditions' },
    { value: 'GOVERNMENT_NOTIFICATION', label: 'Government Notification' },
    { value: 'PROMOTIONAL_OFFER', label: 'Promotional Offer' },
];

const PriceManagement: React.FC<PriceManagementProps> = ({ onNavigate }) => {
    const { rateConfigs, rateChangeHistory, tankConfigs, changeRate } = useConfigStore();
    const { analyzeRateChangeImpact, getLatestImpact } = useRateImpactStore();

    const [editingFuel, setEditingFuel] = useState<FuelType | null>(null);
    const [newRate, setNewRate] = useState('');
    const [reason, setReason] = useState<RateChangeReason>('OMC_RATE_CHANGE');
    const [reasonNote, setReasonNote] = useState('');
    const [showHistory, setShowHistory] = useState(true);

    const navigateTo = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
            return;
        }
        window.location.href = path;
    };

    const fuelRateConfigs = useMemo(
        () => rateConfigs.filter(config => config.fuelType !== 'CNG'),
        [rateConfigs]
    );

    const fuelInventoryByType = useMemo(() => {
        return tankConfigs.reduce<Record<string, number>>((acc, tank) => {
            if (tank.businessUnit !== 'FUEL' || !tank.isActive) return acc;
            acc[tank.fuelType] = (acc[tank.fuelType] || 0) + (tank.currentLevel || 0);
            return acc;
        }, {});
    }, [tankConfigs]);

    const latestImpact = getLatestImpact();

    const handleStartEdit = (fuelType: FuelType, currentRate: number) => {
        setEditingFuel(fuelType);
        setNewRate(currentRate.toString());
        setReason('OMC_RATE_CHANGE');
        setReasonNote('');
    };

    const handleSaveRate = (fuelType: FuelType) => {
        const parsedRate = parseFloat(newRate);
        const currentConfig = fuelRateConfigs.find(config => config.fuelType === fuelType);

        if (!currentConfig || Number.isNaN(parsedRate) || parsedRate <= 0) return;
        if (parsedRate === currentConfig.currentRate) {
            setEditingFuel(null);
            setReasonNote('');
            return;
        }

        const change = changeRate(
            fuelType,
            parsedRate,
            getCurrentUserId(),
            getCurrentUserName(),
            reason,
            reasonNote.trim() || undefined
        );

        analyzeRateChangeImpact(change);
        setEditingFuel(null);
        setNewRate('');
        setReasonNote('');
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Price Management"
                subtitle="Change petrol and diesel rates, review rate history, and jump to profit/loss impact analysis"
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={() => navigateTo('/rate-impact')}>
                            <BarChart3 size={16} className="mr-2" />
                            Rate Impact
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigateTo('/financials/intelligence')}
                        >
                            <TrendingUp size={16} className="mr-2" />
                            Profit / Loss View
                        </Button>
                    </div>
                }
            />

            {latestImpact && (
                <Card className="p-5 border-blue-200 bg-blue-50/70">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                                Latest Revaluation
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {latestImpact.totalPaperProfitLoss >= 0 ? '+' : '-'}Rs{' '}
                                {Math.abs(latestImpact.totalPaperProfitLoss).toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-600">
                                Inventory impact across{' '}
                                {latestImpact.totalInventoryLiters.toLocaleString()} liters at the
                                last rate change.
                            </p>
                        </div>
                        <Button onClick={() => navigateTo('/rate-impact')}>
                            Review Analysis
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Active Fuel Rates</h2>
                            <p className="text-sm text-slate-500">
                                All official fuel rates including diesel are managed here.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowHistory(v => !v)}
                        >
                            <History size={16} className="mr-2" />
                            {showHistory ? 'Hide History' : 'Show History'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {fuelRateConfigs.map(config => {
                            const isEditing = editingFuel === config.fuelType;
                            const diff = config.currentRate - config.previousRate;
                            const percent =
                                config.previousRate > 0
                                    ? (diff / config.previousRate) * 100
                                    : 0;
                            const inventoryLiters = fuelInventoryByType[config.fuelType] || 0;

                            return (
                                <div
                                    key={config.fuelType}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <Badge color={FUEL_BADGE[config.fuelType]}>
                                                {FUEL_LABELS[config.fuelType]}
                                            </Badge>
                                            <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">
                                                Fuel in Inventory
                                            </p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {inventoryLiters.toLocaleString()} L
                                            </p>
                                        </div>
                                        {!isEditing && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleStartEdit(
                                                        config.fuelType,
                                                        config.currentRate
                                                    )
                                                }
                                            >
                                                <Save size={14} className="mr-2" />
                                                Change Rate
                                            </Button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <Input
                                                label="New Rate (PKR / Litre)"
                                                type="number"
                                                step="0.01"
                                                value={newRate}
                                                onChange={e => setNewRate(e.target.value)}
                                            />
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
                                                    Reason
                                                </label>
                                                <select
                                                    value={reason}
                                                    onChange={e =>
                                                        setReason(
                                                            e.target.value as RateChangeReason
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {reasonOptions.map(option => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Input
                                                label="Note"
                                                value={reasonNote}
                                                onChange={e => setReasonNote(e.target.value)}
                                                placeholder="Optional note for audit trail"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1"
                                                    onClick={() => setEditingFuel(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-1"
                                                    onClick={() =>
                                                        handleSaveRate(config.fuelType)
                                                    }
                                                >
                                                    Save Rate
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-blue-600">
                                                    {config.currentRate.toFixed(2)}
                                                </span>
                                                <span className="text-sm font-bold text-slate-500">
                                                    PKR / L
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Previous Rate</span>
                                                <span className="font-bold text-slate-800">
                                                    {config.previousRate.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Last Updated</span>
                                                <span className="font-bold text-slate-800">
                                                    {format(
                                                        new Date(config.lastChangedAt),
                                                        'dd MMM yyyy'
                                                    )}
                                                </span>
                                            </div>
                                            {diff !== 0 && (
                                                <div
                                                    className={clsx(
                                                        'flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold w-fit',
                                                        diff > 0
                                                            ? 'bg-rose-50 text-rose-600'
                                                            : 'bg-emerald-50 text-emerald-600'
                                                    )}
                                                >
                                                    {diff > 0 ? (
                                                        <TrendingUp size={14} />
                                                    ) : (
                                                        <TrendingDown size={14} />
                                                    )}
                                                    {diff > 0 ? '+' : ''}
                                                    {diff.toFixed(2)} ({percent.toFixed(2)}%)
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Droplets className="text-blue-300" />
                            <div>
                                <h3 className="text-lg font-black">Rate Intelligence</h3>
                                <p className="text-sm text-white/70">
                                    Track revisions and jump into impact analysis.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Total Revisions</span>
                                <span className="font-black">
                                    {rateChangeHistory.filter(change => change.fuelType !== 'CNG').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Managed Fuel Types</span>
                                <span className="font-black">{fuelRateConfigs.length}</span>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            <Button
                                variant="secondary"
                                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/15"
                                onClick={() => navigateTo('/rate-impact')}
                            >
                                Open History
                            </Button>
                            <Button
                                className="flex-1 bg-white text-slate-900 hover:bg-slate-100"
                                onClick={() => navigateTo('/financials/intelligence')}
                            >
                                Open P/L
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={18} className="text-blue-500" />
                            <h3 className="text-lg font-bold text-slate-900">Recent Rate History</h3>
                        </div>
                        <div className="space-y-3 max-h-[540px] overflow-y-auto">
                            {showHistory &&
                                rateChangeHistory
                                    .filter(change => change.fuelType !== 'CNG')
                                    .slice()
                                    .reverse()
                                    .map(change => (
                                        <div
                                            key={change.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <Badge color={FUEL_BADGE[change.fuelType]}>
                                                    {FUEL_LABELS[change.fuelType]}
                                                </Badge>
                                                <span
                                                    className={clsx(
                                                        'text-sm font-black',
                                                        change.rateDifference >= 0
                                                            ? 'text-rose-600'
                                                            : 'text-emerald-600'
                                                    )}
                                                >
                                                    {change.rateDifference >= 0 ? '+' : ''}
                                                    {change.rateDifference.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-800">
                                                {change.oldRate.toFixed(2)} to{' '}
                                                {change.newRate.toFixed(2)} PKR / L
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {reasonOptions.find(
                                                    option => option.value === change.reason
                                                )?.label || change.reason}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {format(
                                                    new Date(change.timestamp),
                                                    'dd MMM yyyy, hh:mm a'
                                                )}{' '}
                                                by {change.changedByName}
                                            </p>
                                            {change.reasonNote && (
                                                <p className="mt-2 text-xs text-slate-600">
                                                    Note: {change.reasonNote}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                            {!showHistory && (
                                <p className="text-sm text-slate-500">
                                    History is hidden. Use the button above to review all revisions.
                                </p>
                            )}
                            {showHistory &&
                                rateChangeHistory.filter(change => change.fuelType !== 'CNG')
                                    .length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        No fuel rate changes recorded yet.
                                    </p>
                                )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PriceManagement;
