import { useAuthStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useAuditStore } from '@/stores/ledgerStore';
import { useConfigStore } from '@/stores/configStore';
import { format } from 'date-fns';
import { Clock, History, Save, TrendingUp, Zap } from 'lucide-react';
import React, { useState } from 'react';

const PriceManagement: React.FC = () => {
    const { tanks, updateFuelPrice } = useFuelStore();
    const { addLog, logs } = useAuditStore();
    const { user } = useAuthStore();

    // Local state for edits
    const [edits, setEdits] = useState<{ [tankId: string]: { rate: number; costPrice: number } }>(
        {}
    );

    const priceLogs = logs.filter(l => l.module === 'PRICE_MANAGEMENT').slice(0, 3);
    const lastUpdateLog = priceLogs[0];

    const hasEdits = Object.keys(edits).length > 0;

    const handleRateChange = (tankId: string, rate: number) => {
        setEdits(prev => ({
            ...prev,
            [tankId]: { ...prev[tankId], rate },
        }));
    };

    const handleSave = () => {
        if (!hasEdits) return;

        let itemsUpdated = 0;
        Object.keys(edits).forEach(tankId => {
            const tank = tanks.find(t => t.tankId === tankId);
            if (tank) {
                const newRate = edits[tankId].rate || tank.salePrice;
                const newCost = edits[tankId].costPrice || tank.costPrice;

                if (newRate !== tank.salePrice || newCost !== tank.costPrice) {
                    updateFuelPrice(tankId, newCost, newRate);
                    try {
                        useConfigStore.getState().updateTank(tankId, { salePrice: newRate, costPrice: newCost });
                        useConfigStore.getState().changeRate(
                            tank.fuelType,
                            newRate,
                            (user as any)?.userId || 'SYS',
                            (user as any)?.name || 'Admin',
                            'OMC_RATE_CHANGE'
                        );
                    } catch (e) {
                        console.warn('useConfigStore sync error:', e);
                    }
                    itemsUpdated++;
                }
            }
        });

        if (itemsUpdated > 0) {
            addLog({
                userId: (user as any)?.userId || 'SYS',
                userName: (user as any)?.name || 'System Admin',
                action: `Updated fuel rates for ${itemsUpdated} tank(s)`,
                module: 'PRICE_MANAGEMENT',
                severity: 'INFO',
                details: `Sale/Cost prices were modified globally.`,
            });
        }

        setEdits({});
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Price Management
                    </h1>
                    <p className="text-gray-500 mt-1">Real-time Rate Control & History</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!hasEdits}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg font-bold uppercase tracking-wide text-xs ${
                            hasEdits
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-blue-200'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <Save size={18} />
                        Update All Rates
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Pricing Card */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-2xl">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-8">
                        Active Fuel Rates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tanks.map(tank => (
                            <div
                                key={tank.tankId}
                                className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            tank.fuelType.includes('PETROL')
                                                ? 'bg-amber-100 text-amber-700'
                                                : tank.fuelType.includes('DIESEL')
                                                  ? 'bg-green-100 text-green-700'
                                                  : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {tank.fuelType.replace('_', ' ')}
                                    </span>
                                    <Zap
                                        className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        size={16}
                                    />
                                </div>
                                <p className="font-bold text-gray-800">{tank.name}</p>
                                <div className="mt-4 flex items-end gap-2">
                                    <input
                                        type="number"
                                        value={
                                            edits[tank.tankId]?.rate !== undefined
                                                ? edits[tank.tankId].rate
                                                : tank.salePrice
                                        }
                                        onChange={e =>
                                            handleRateChange(
                                                tank.tankId,
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="text-3xl font-black text-blue-600 bg-transparent border-b-2 border-blue-500/20 focus:border-blue-500 focus:outline-none w-32"
                                    />
                                    <span className="text-sm font-bold text-gray-500 mb-2">
                                        PKR/L
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History & Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                        <TrendingUp size={100} className="absolute -bottom-4 -right-4 opacity-10" />
                        <h3 className="text-lg font-black uppercase tracking-wider mb-2">
                            Last Update
                        </h3>
                        {lastUpdateLog ? (
                            <>
                                <p className="text-sm opacity-80 mb-6 flex items-center gap-2">
                                    <Clock size={16} />{' '}
                                    {format(
                                        new Date(lastUpdateLog.timestamp),
                                        'MMM dd, yyyy @ hh:mm a'
                                    )}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                            {lastUpdateLog.action}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-white/50">
                                            By: {lastUpdateLog.userName}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm opacity-80 mb-6">No recent global updates.</p>
                        )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-xl">
                        <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History size={18} /> Price Audit History
                        </h3>
                        <div className="space-y-4">
                            {priceLogs.length === 0 ? (
                                <p className="text-xs text-gray-500 italic">
                                    No price updates found in audit log.
                                </p>
                            ) : (
                                priceLogs.map(log => (
                                    <div
                                        key={log.id}
                                        className="text-xs p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border-l-4 border-blue-500"
                                    >
                                        <p className="font-bold text-gray-800">{log.action}</p>
                                        <p className="text-gray-500 mt-1">
                                            {format(new Date(log.timestamp), 'dd MMM hh:mm a')} — By{' '}
                                            {log.userName}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceManagement;
