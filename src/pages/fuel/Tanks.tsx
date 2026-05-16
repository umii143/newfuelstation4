import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useSupplierStore } from '@/stores/dataStores';
import { useSupplierLedgerStore } from '@/stores/ledgerStore';
import clsx from 'clsx';
import { CheckCircle, Droplets, Gauge, History, PackagePlus, X, TrendingDown, Thermometer, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { LiquidTank } from '@/components/fuel/LiquidTank';
import { motion } from 'framer-motion';

export const TanksPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
    const { tankConfigs } = useConfigStore();
    const { shifts } = useFuelStore();
    
    const activeShifts = shifts.filter(s => s.status === 'OPEN');
    const handleNavigateToOrders = () => {
        if (onNavigate) {
            onNavigate('/fuel/orders');
        } else {
            window.location.href = '/fuel/orders';
        }
    };

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
                            onClick={handleNavigateToOrders}
                        >
                            <PackagePlus size={18} />
                            Receive Tanker (PO)
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

                                    {/* Ultra High-Fidelity Liquid Animation */}
                                    <div className="mb-6">
                                        <LiquidTank
                                            percentage={percentage}
                                            color={color as any}
                                            label={tank.name}
                                            currentLevel={tank.currentLevel || 0}
                                            capacity={tank.capacity || 0}
                                            isFlowing={activeShifts.length > 0}
                                            flowDirection="out"
                                        />
                                    </div>

                                <div className="pt-4 border-t border-[var(--border)]">
                                    <div className="mb-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Forensic Telemetry</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border)]">
                                                <p className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">
                                                    Last Arrival
                                                </p>
                                                <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">
                                                    {new Date(tank.lastUpdated || Date.now()).toLocaleDateString('en-PK')}
                                                </p>
                                            </div>
                                            <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border)]">
                                                <p className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">
                                                    Avg Stock Rate
                                                </p>
                                                <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">
                                                    ₨{tank.costPrice?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                            <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border)]">
                                                <p className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">
                                                    Est. Dead Stock
                                                </p>
                                                <p className="text-xs font-bold text-rose-500 truncate mt-0.5">
                                                    {((tank.capacity ?? 0) * 0.02).toFixed(0)} L
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
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
                                        onClick={handleNavigateToOrders}
                                    >
                                        <PackagePlus size={14} className="mr-1" />
                                        Receive
                                    </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    );
                })}
            </div>



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
