import { Badge, Button, Card, Input, PageHeader } from '@/components/ui';
import { LiquidTank } from '@/components/fuel/LiquidTank';
import { useConfigStore } from '@/stores/configStore';
import clsx from 'clsx';
import {
    AlertTriangle,
    Droplets,
    Gauge,
    PackagePlus,
    Search,
    Settings2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

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

export const TanksPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
    const { tankConfigs } = useConfigStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [fuelFilter, setFuelFilter] = useState('ALL');

    const navigateTo = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
            return;
        }
        window.location.href = path;
    };

    const fuelTanks = useMemo(
        () =>
            tankConfigs.filter(
                tank => tank.businessUnit === 'FUEL' && tank.isActive !== false
            ),
        [tankConfigs]
    );

    const fuelTypeOptions = useMemo(
        () => ['ALL', ...new Set(fuelTanks.map(tank => tank.fuelType))],
        [fuelTanks]
    );

    const filteredTanks = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return fuelTanks.filter(tank => {
            const matchesQuery =
                !query ||
                tank.name.toLowerCase().includes(query) ||
                tank.tankId.toLowerCase().includes(query) ||
                tank.fuelType.toLowerCase().includes(query);
            const matchesType = fuelFilter === 'ALL' || tank.fuelType === fuelFilter;
            return matchesQuery && matchesType;
        });
    }, [fuelFilter, fuelTanks, searchQuery]);

    const inventoryMetrics = useMemo(() => {
        const totalCapacity = fuelTanks.reduce((sum, tank) => sum + (tank.capacity ?? 0), 0);
        const totalVolume = fuelTanks.reduce((sum, tank) => sum + (tank.currentLevel ?? 0), 0);
        const availableSpace = Math.max(0, totalCapacity - totalVolume);
        const lowInventoryTanks = fuelTanks.filter(
            tank =>
                (tank.currentLevel ?? 0) <=
                Math.max(tank.minimumThresholdLevel ?? 0, tank.reorderPoint ?? 0)
        );

        return {
            totalCapacity,
            totalVolume,
            availableSpace,
            lowInventoryTanks,
            utilization:
                totalCapacity > 0 ? Math.round((totalVolume / totalCapacity) * 100) : 0,
        };
    }, [fuelTanks]);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Tank Inventory"
                subtitle="One screen for tank stock, low-level monitoring, dip workflow, and tanker receiving"
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={() => navigateTo('/fuel/dips')}
                        >
                            <Gauge size={18} />
                            Record Dip
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={() => navigateTo('/fuel/station-master')}
                        >
                            <Settings2 size={18} />
                            Configure Tanks
                        </Button>
                        <Button
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                            onClick={() => navigateTo('/fuel/orders')}
                        >
                            <PackagePlus size={18} />
                            Receive Tanker
                        </Button>
                    </div>
                }
            />

            {inventoryMetrics.lowInventoryTanks.length > 0 && (
                <Card className="p-4 border-amber-300 bg-amber-50/80">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                            <div>
                                <p className="font-bold text-amber-900">
                                    {inventoryMetrics.lowInventoryTanks.length} tank
                                    {inventoryMetrics.lowInventoryTanks.length > 1 ? 's are' : ' is'} near refill threshold
                                </p>
                                <p className="text-sm text-amber-800">
                                    Reorder fuel from the tanker receipt flow before pump availability is affected.
                                </p>
                            </div>
                        </div>
                        <Button
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => navigateTo('/fuel/orders')}
                        >
                            Open Purchase Orders
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Current Stock
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {inventoryMetrics.totalVolume.toLocaleString()}
                        <span className="ml-1 text-base font-bold text-slate-500">L</span>
                    </p>
                </Card>
                <Card className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Total Capacity
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {inventoryMetrics.totalCapacity.toLocaleString()}
                        <span className="ml-1 text-base font-bold text-slate-500">L</span>
                    </p>
                </Card>
                <Card className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Available Space
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {inventoryMetrics.availableSpace.toLocaleString()}
                        <span className="ml-1 text-base font-bold text-slate-500">L</span>
                    </p>
                </Card>
                <Card className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Utilization
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {inventoryMetrics.utilization}
                        <span className="ml-1 text-base font-bold text-slate-500">%</span>
                    </p>
                </Card>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by tank name, tank ID, or fuel type"
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={fuelFilter}
                        onChange={e => setFuelFilter(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {fuelTypeOptions.map(option => (
                            <option key={option} value={option}>
                                {option === 'ALL' ? 'All Fuel Types' : option.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTanks.length === 0 && (
                    <Card className="col-span-full p-12 text-center">
                        <Droplets size={42} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-lg font-bold text-slate-800">No tank inventory found</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Adjust the search/filter or configure tanks from Station Master.
                        </p>
                    </Card>
                )}

                {filteredTanks.map(tank => {
                    const color = getFuelColor(tank.fuelType);
                    const percentage = getFillPercentage(tank.currentLevel ?? 0, tank.capacity ?? 0);
                    const isLow =
                        (tank.currentLevel ?? 0) <=
                        Math.max(tank.minimumThresholdLevel ?? 0, tank.reorderPoint ?? 0);

                    return (
                        <Card
                            key={tank.tankId}
                            className="group relative overflow-hidden border-2 hover:border-blue-500/40 transition-all duration-300"
                        >
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

                            <div className="relative p-6 space-y-5">
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                            {isLow && <Badge color="rose">Low Inventory</Badge>}
                                        </div>
                                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                                            {tank.name}
                                        </h3>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            {tank.tankId}
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
                                        <Droplets size={22} />
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-[var(--text-primary)]">
                                            {(tank.currentLevel ?? 0).toLocaleString()}
                                            <span className="ml-1 text-lg font-semibold text-[var(--text-secondary)]">
                                                L
                                            </span>
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            Capacity {(tank.capacity ?? 0).toLocaleString()} L
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            Fill
                                        </p>
                                        <p className="text-lg font-black text-[var(--text-primary)]">
                                            {percentage.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>

                                <LiquidTank
                                    percentage={percentage}
                                    color={color as 'emerald' | 'amber' | 'blue'}
                                    label={tank.name}
                                    currentLevel={tank.currentLevel || 0}
                                    capacity={tank.capacity || 0}
                                    isFlowing={false}
                                    flowDirection="out"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            Reorder Point
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                                            {(tank.reorderPoint ?? 0).toLocaleString()} L
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            Free Space
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                                            {Math.max(
                                                0,
                                                (tank.capacity ?? 0) - (tank.currentLevel ?? 0)
                                            ).toLocaleString()}{' '}
                                            L
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => navigateTo('/fuel/dips')}
                                    >
                                        Record Dip
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => navigateTo('/fuel/orders')}
                                    >
                                        Receive
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">
                        Inventory Summary
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] uppercase tracking-wider font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Tank</th>
                                <th className="px-6 py-4">Fuel Type</th>
                                <th className="px-6 py-4 text-right">Current</th>
                                <th className="px-6 py-4 text-right">Capacity</th>
                                <th className="px-6 py-4 text-right">Fill %</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTanks.map(tank => {
                                const percentage = getFillPercentage(
                                    tank.currentLevel ?? 0,
                                    tank.capacity ?? 0
                                );
                                const isLow =
                                    (tank.currentLevel ?? 0) <=
                                    Math.max(tank.minimumThresholdLevel ?? 0, tank.reorderPoint ?? 0);

                                return (
                                    <tr
                                        key={tank.tankId}
                                        className="border-t border-[var(--border)] hover:bg-[var(--bg-surface)]"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[var(--text-primary)]">
                                                {tank.name}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)]">
                                                {tank.tankId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tank.fuelType.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">
                                            {(tank.currentLevel ?? 0).toLocaleString()} L
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(tank.capacity ?? 0).toLocaleString()} L
                                        </td>
                                        <td className="px-6 py-4 text-right">{percentage.toFixed(0)}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge color={isLow ? 'rose' : 'emerald'}>
                                                {isLow ? 'Reorder' : 'Healthy'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
