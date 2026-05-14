import { Badge, Button, Card } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';
import { useRateImpactStore } from '@/stores/rateImpactStore';
import type { FuelType, RateChange } from '@/types';
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Droplets,
    Package,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';

// ============================================
// RATE CHANGE IMPACT PAGE
// Mandatory as per specification Section 2.4
// ============================================

export const RateImpactPage: React.FC = () => {
    const { rateConfigs, rateChangeHistory } = useConfigStore();
    const { rateChangeImpacts, analyzeRateChangeImpact, get7DayComparison } = useRateImpactStore();

    const [selectedRateChange, setSelectedRateChange] = useState<RateChange | null>(null);
    const [expandedSections, setExpandedSections] = useState<string[]>(['inventory', 'sales']);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const getFuelTypeLabel = (type: FuelType) => {
        const labels: Record<FuelType, string> = {
            PETROL_92: 'Petrol 92',
            PETROL_95: 'Petrol 95',
            DIESEL: 'Diesel',
            PREMIUM_DIESEL: 'Premium Diesel',
            CNG: 'CNG',
        };
        return labels[type] || type;
    };

    const getFuelColor = (type: FuelType) => {
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

    // Get impact data for selected rate change
    const selectedImpact = selectedRateChange
        ? rateChangeImpacts.find(i => i.rateChangeId === selectedRateChange.id)
        : null;

    const selectedComparison = selectedRateChange ? get7DayComparison(selectedRateChange.id) : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingUp className="text-blue-500" />
                        Rate Change Impact Analysis
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Track fuel rate changes and their financial impact on inventory and sales
                    </p>
                </div>
            </div>

            {/* Current Rates Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {rateConfigs.map(config => {
                    const color = getFuelColor(config.fuelType);
                    const change = config.currentRate - config.previousRate;
                    const changePercent =
                        config.previousRate > 0 ? (change / config.previousRate) * 100 : 0;

                    return (
                        <Card
                            key={config.fuelType}
                            className={`bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 border-${color}-500/20`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {getFuelTypeLabel(config.fuelType)}
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                                        PKR {config.currentRate.toFixed(2)}
                                    </p>
                                    {change !== 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {change > 0 ? (
                                                <TrendingUp size={14} className="text-rose-500" />
                                            ) : (
                                                <TrendingDown
                                                    size={14}
                                                    className="text-emerald-500"
                                                />
                                            )}
                                            <span
                                                className={
                                                    change > 0
                                                        ? 'text-rose-500'
                                                        : 'text-emerald-500'
                                                }
                                            >
                                                {change > 0 ? '+' : ''}
                                                {changePercent.toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Droplets className={`text-${color}-500`} size={24} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rate Change History */}
                <Card className="lg:col-span-1">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Rate Change History
                    </h3>

                    {rateChangeHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <BarChart3
                                size={48}
                                className="mx-auto text-[var(--text-muted)] mb-4"
                            />
                            <p className="text-[var(--text-secondary)]">No rate changes recorded</p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">
                                Change a fuel rate to see impact analysis
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {rateChangeHistory
                                .slice()
                                .reverse()
                                .map(change => {
                                    const isSelected = selectedRateChange?.id === change.id;
                                    const color = getFuelColor(change.fuelType);

                                    return (
                                        <button
                                            key={change.id}
                                            onClick={() => setSelectedRateChange(change)}
                                            className={`w-full p-3 rounded-xl text-left transition-all ${
                                                isSelected
                                                    ? `bg-${color}-500/20 border-2 border-${color}-500`
                                                    : 'bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-blue-500/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge
                                                    color={color as 'emerald' | 'amber' | 'blue'}
                                                >
                                                    {getFuelTypeLabel(change.fuelType)}
                                                </Badge>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        change.rateDifference > 0
                                                            ? 'text-rose-500'
                                                            : 'text-emerald-500'
                                                    }`}
                                                >
                                                    {change.rateDifference > 0 ? '+' : ''}
                                                    {change.changePercentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-[var(--text-secondary)] line-through">
                                                    PKR {change.oldRate}
                                                </span>
                                                <ArrowRight
                                                    size={12}
                                                    className="text-[var(--text-muted)]"
                                                />
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    PKR {change.newRate}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                {new Date(change.timestamp).toLocaleDateString()} •{' '}
                                                {change.changedByName}
                                            </p>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </Card>

                {/* Impact Analysis Panel */}
                <Card className="lg:col-span-2">
                    {!selectedRateChange ? (
                        <div className="text-center py-16">
                            <BarChart3
                                size={64}
                                className="mx-auto text-[var(--text-muted)] mb-4"
                            />
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                Select a Rate Change
                            </h3>
                            <p className="text-[var(--text-secondary)] mt-1">
                                Click on a rate change from the history to view its impact analysis
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selected Change Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                        Impact Analysis:{' '}
                                        {getFuelTypeLabel(selectedRateChange.fuelType)}
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {new Date(selectedRateChange.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selectedImpact && (
                                        <Button
                                            onClick={() =>
                                                analyzeRateChangeImpact(selectedRateChange)
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            <RefreshCw size={16} />
                                            Analyze Impact
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Rate Change Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-[var(--bg-elevated)] text-center">
                                    <p className="text-sm text-[var(--text-secondary)]">Old Rate</p>
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        PKR {selectedRateChange.oldRate}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--bg-elevated)] text-center">
                                    <p className="text-sm text-[var(--text-secondary)]">New Rate</p>
                                    <p className="text-xl font-bold text-[var(--text-primary)]">
                                        PKR {selectedRateChange.newRate}
                                    </p>
                                </div>
                                <div
                                    className={`p-4 rounded-xl text-center ${
                                        selectedRateChange.rateDifference > 0
                                            ? 'bg-rose-500/10'
                                            : 'bg-emerald-500/10'
                                    }`}
                                >
                                    <p className="text-sm text-[var(--text-secondary)]">Change</p>
                                    <p
                                        className={`text-xl font-bold ${
                                            selectedRateChange.rateDifference > 0
                                                ? 'text-rose-500'
                                                : 'text-emerald-500'
                                        }`}
                                    >
                                        {selectedRateChange.rateDifference > 0 ? '+' : ''}
                                        PKR {selectedRateChange.rateDifference.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Inventory Impact Section */}
                            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleSection('inventory')}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className="text-blue-500" />
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            Inventory Impact (Paper Profit/Loss)
                                        </span>
                                    </div>
                                    {expandedSections.includes('inventory') ? (
                                        <ChevronUp className="text-[var(--text-secondary)]" />
                                    ) : (
                                        <ChevronDown className="text-[var(--text-secondary)]" />
                                    )}
                                </button>
                                {expandedSections.includes('inventory') && (
                                    <div className="p-4 space-y-4">
                                        {selectedImpact ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
                                                        <p className="text-xs text-[var(--text-secondary)]">
                                                            Total Inventory at Change
                                                        </p>
                                                        <p className="text-lg font-bold text-[var(--text-primary)]">
                                                            {selectedImpact.totalInventoryLiters.toLocaleString()}{' '}
                                                            L
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`p-3 rounded-lg ${
                                                            selectedImpact.totalPaperProfitLoss >= 0
                                                                ? 'bg-emerald-500/10'
                                                                : 'bg-rose-500/10'
                                                        }`}
                                                    >
                                                        <p className="text-xs text-[var(--text-secondary)]">
                                                            Paper{' '}
                                                            {selectedImpact.totalPaperProfitLoss >=
                                                            0
                                                                ? 'Profit'
                                                                : 'Loss'}
                                                        </p>
                                                        <p
                                                            className={`text-lg font-bold ${
                                                                selectedImpact.totalPaperProfitLoss >=
                                                                0
                                                                    ? 'text-emerald-500'
                                                                    : 'text-rose-500'
                                                            }`}
                                                        >
                                                            PKR{' '}
                                                            {Math.abs(
                                                                selectedImpact.totalPaperProfitLoss
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedImpact.inventorySnapshots.map(
                                                        snapshot => (
                                                            <div
                                                                key={snapshot.id}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)]"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-[var(--text-primary)]">
                                                                        {snapshot.tankName}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                                        {snapshot.litersAtChange.toLocaleString()}{' '}
                                                                        L
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`font-medium ${
                                                                        snapshot.paperProfitLoss >=
                                                                        0
                                                                            ? 'text-emerald-500'
                                                                            : 'text-rose-500'
                                                                    }`}
                                                                >
                                                                    {snapshot.paperProfitLoss >= 0
                                                                        ? '+'
                                                                        : ''}
                                                                    PKR{' '}
                                                                    {snapshot.paperProfitLoss.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertTriangle
                                                    size={32}
                                                    className="mx-auto text-amber-500 mb-2"
                                                />
                                                <p className="text-[var(--text-secondary)]">
                                                    Click "Analyze Impact" to calculate inventory
                                                    impact
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sales Comparison Section */}
                            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleSection('sales')}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="text-purple-500" />
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            7-Day Sales Comparison
                                        </span>
                                    </div>
                                    {expandedSections.includes('sales') ? (
                                        <ChevronUp className="text-[var(--text-secondary)]" />
                                    ) : (
                                        <ChevronDown className="text-[var(--text-secondary)]" />
                                    )}
                                </button>
                                {expandedSections.includes('sales') && (
                                    <div className="p-4 space-y-4">
                                        {selectedComparison ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                                                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                                                        7 Days Before Change
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-[var(--text-secondary)]">
                                                                Volume
                                                            </span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                {selectedComparison.prePeriod.totalLiters.toLocaleString()}{' '}
                                                                L
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[var(--text-secondary)]">
                                                                Revenue
                                                            </span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                PKR{' '}
                                                                {selectedComparison.prePeriod.totalRevenue.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-[var(--bg-elevated)]">
                                                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                                                        7 Days After Change
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-[var(--text-secondary)]">
                                                                Volume
                                                            </span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                {selectedComparison.postPeriod.totalLiters.toLocaleString()}{' '}
                                                                L
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[var(--text-secondary)]">
                                                                Revenue
                                                            </span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                PKR{' '}
                                                                {selectedComparison.postPeriod.totalRevenue.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                                                    <div className="grid grid-cols-2 gap-4 text-center">
                                                        <div>
                                                            <p className="text-xs text-[var(--text-secondary)]">
                                                                Volume Change
                                                            </p>
                                                            <p
                                                                className={`text-xl font-bold ${
                                                                    selectedComparison.volumeChange >=
                                                                    0
                                                                        ? 'text-emerald-500'
                                                                        : 'text-rose-500'
                                                                }`}
                                                            >
                                                                {selectedComparison.volumeChange >=
                                                                0
                                                                    ? '+'
                                                                    : ''}
                                                                {selectedComparison.volumeChangePercentage.toFixed(
                                                                    1
                                                                )}
                                                                %
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[var(--text-secondary)]">
                                                                Revenue Change
                                                            </p>
                                                            <p
                                                                className={`text-xl font-bold ${
                                                                    selectedComparison.revenueChange >=
                                                                    0
                                                                        ? 'text-emerald-500'
                                                                        : 'text-rose-500'
                                                                }`}
                                                            >
                                                                {selectedComparison.revenueChange >=
                                                                0
                                                                    ? '+'
                                                                    : ''}
                                                                {selectedComparison.revenueChangePercentage.toFixed(
                                                                    1
                                                                )}
                                                                %
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertTriangle
                                                    size={32}
                                                    className="mx-auto text-amber-500 mb-2"
                                                />
                                                <p className="text-[var(--text-secondary)]">
                                                    Click "Analyze Impact" to see sales comparison
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Customer Credit Impact Section */}
                            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleSection('credits')}
                                    className="w-full flex items-center justify-between p-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="text-cyan-500" />
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            Customer Credit Adjustments
                                        </span>
                                    </div>
                                    {expandedSections.includes('credits') ? (
                                        <ChevronUp className="text-[var(--text-secondary)]" />
                                    ) : (
                                        <ChevronDown className="text-[var(--text-secondary)]" />
                                    )}
                                </button>
                                {expandedSections.includes('credits') && (
                                    <div className="p-4">
                                        {selectedImpact &&
                                        selectedImpact.creditAdjustmentsApplied.length > 0 ? (
                                            <div className="space-y-2">
                                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-sm mb-4">
                                                    <AlertTriangle
                                                        size={16}
                                                        className="text-amber-500"
                                                    />
                                                    <span className="text-amber-500">
                                                        {
                                                            selectedImpact.creditAdjustmentsApplied
                                                                .length
                                                        }{' '}
                                                        customers have outstanding balances that may
                                                        need adjustment
                                                    </span>
                                                </div>
                                                {selectedImpact.creditAdjustmentsApplied.map(
                                                    adj => (
                                                        <div
                                                            key={adj.customerId}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)]"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                    {adj.customerName}
                                                                </p>
                                                                <p className="text-xs text-[var(--text-secondary)]">
                                                                    ~
                                                                    {adj.outstandingLiters.toFixed(
                                                                        0
                                                                    )}{' '}
                                                                    L outstanding
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p
                                                                    className={`font-medium ${
                                                                        adj.adjustmentAmount > 0
                                                                            ? 'text-emerald-500'
                                                                            : 'text-rose-500'
                                                                    }`}
                                                                >
                                                                    {adj.adjustmentAmount > 0
                                                                        ? '+'
                                                                        : ''}
                                                                    PKR{' '}
                                                                    {adj.adjustmentAmount.toFixed(
                                                                        0
                                                                    )}
                                                                </p>
                                                                <Badge
                                                                    color={
                                                                        adj.adjustmentType ===
                                                                        'AUTO'
                                                                            ? 'emerald'
                                                                            : adj.adjustmentType ===
                                                                                'PENDING'
                                                                              ? 'amber'
                                                                              : 'blue'
                                                                    }
                                                                >
                                                                    {adj.adjustmentType}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle
                                                    size={32}
                                                    className="mx-auto text-emerald-500 mb-2"
                                                />
                                                <p className="text-[var(--text-secondary)]">
                                                    No customer credit adjustments required
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default RateImpactPage;
