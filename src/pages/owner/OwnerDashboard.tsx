import React, { useMemo } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { AlertTriangle, Package, TrendingUp, Truck, ShieldAlert, ShieldCheck, BarChart3, Clock } from 'lucide-react';

const STATIONS = [
    { id: 'STN-001', name: 'Station 1', manager: 'Brother 1' },
    { id: 'STN-002', name: 'Station 2', manager: 'Brother 2' },
    { id: 'STN-003', name: 'Station 3', manager: 'Brother 3' },
];

const FUEL_LABELS: Record<string, string> = {
    PETROL_92: 'Petrol 92',
    PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel',
    PREMIUM_DIESEL: 'Premium Diesel',
    CNG: 'CNG',
};

function navigate(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
}

export const OwnerDashboard: React.FC = () => {
    const { ownerStockPool, dispatches, alerts } = useAntiFraudStore();

    const openAlerts = alerts.filter(a => a.status === 'OPEN');
    const criticalAlerts = openAlerts.filter(a => a.severity === 'CRITICAL');
    const warningAlerts = openAlerts.filter(a => a.severity === 'WARNING');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAlerts = alerts.filter(a => a.triggeredAt.startsWith(todayStr));

    const stationStats = useMemo(() => {
        return STATIONS.map(station => {
            const stationDispatches = dispatches.filter(d => d.toStationId === station.id);
            const inTransit = stationDispatches.filter(d => d.status === 'IN_TRANSIT');
            const disputed = stationDispatches.filter(d => d.status === 'DISPUTED');
            const stationAlerts = alerts.filter(a => a.stationId === station.id && a.status === 'OPEN');
            return { ...station, inTransit: inTransit.length, disputed: disputed.length, openAlerts: stationAlerts.length };
        });
    }, [dispatches, alerts]);

    const poolFuels = Object.entries(ownerStockPool).filter(([, qty]) => qty > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Owner Command Center</h1>
                        <p className="text-slate-400 text-sm">Group-level intelligence across all 3 stations</p>
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            {criticalAlerts.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center gap-3 animate-pulse">
                    <ShieldAlert size={24} className="text-red-400 shrink-0" />
                    <div>
                        <p className="font-black text-red-300">{criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length > 1 ? 'S' : ''} REQUIRE YOUR ATTENTION</p>
                        <p className="text-red-400 text-sm">{criticalAlerts[0].details}</p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/fraud')}
                        className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-sm transition-colors shrink-0"
                    >
                        View All
                    </button>
                </div>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert size={16} className="text-red-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Critical Alerts</span>
                    </div>
                    <p className="text-3xl font-black text-red-400">{criticalAlerts.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Require action</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Warnings</span>
                    </div>
                    <p className="text-3xl font-black text-amber-400">{warningAlerts.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Active warnings</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck size={16} className="text-blue-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">In Transit</span>
                    </div>
                    <p className="text-3xl font-black text-blue-400">
                        {dispatches.filter(d => d.status === 'IN_TRANSIT').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Awaiting confirmation</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Today Alerts</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-400">{todayAlerts.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Generated today</p>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Station Status Cards */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">Station Overview</h2>
                    {stationStats.map(station => (
                        <div key={station.id}
                            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur hover:border-blue-500/40 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-black text-lg">{station.name}</h3>
                                    <p className="text-slate-400 text-sm">{station.manager}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black ${
                                    station.openAlerts > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    station.inTransit > 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                    {station.openAlerts > 0 ? `⚠ ${station.openAlerts} ALERT${station.openAlerts > 1 ? 'S' : ''}` :
                                     station.inTransit > 0 ? `🚚 ${station.inTransit} IN TRANSIT` :
                                     '✓ CLEAN'}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Dispatches</p>
                                    <p className="text-xl font-black text-blue-400">
                                        {dispatches.filter(d => d.toStationId === station.id).length}
                                    </p>
                                </div>
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Disputed</p>
                                    <p className={`text-xl font-black ${station.disputed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {station.disputed}
                                    </p>
                                </div>
                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Open Alerts</p>
                                    <p className={`text-xl font-black ${station.openAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {station.openAlerts}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                            onClick={() => navigate('/owner/stock')}
                            className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-bold flex items-center gap-3 shadow-lg shadow-blue-900/30">
                            <Package size={20} />
                            <div className="text-left">
                                <p className="text-sm font-black">Stock Management</p>
                                <p className="text-xs opacity-70">Purchase & Dispatch</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/owner/fraud')}
                            className="p-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all font-bold flex items-center gap-3 shadow-lg shadow-red-900/30">
                            <ShieldAlert size={20} />
                            <div className="text-left">
                                <p className="text-sm font-black">Fraud Alerts</p>
                                <p className="text-xs opacity-70">{openAlerts.length} open alerts</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Owner Stock Pool */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">Owner Stock Pool</h2>
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        {poolFuels.length === 0 ? (
                            <div className="text-center py-8">
                                <Package size={32} className="text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No stock in pool</p>
                                <button
                                    onClick={() => navigate('/owner/stock')}
                                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Purchase Fuel
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {poolFuels.map(([fuel, qty]) => (
                                    <div key={fuel} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl">
                                        <div>
                                            <p className="font-bold text-sm">{FUEL_LABELS[fuel] || fuel}</p>
                                            <p className="text-xs text-slate-500">Available in pool</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-400">{qty.toLocaleString()} L</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Dispatches */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur">
                        <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <Clock size={14} /> Recent Dispatches
                        </h3>
                        {dispatches.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">No dispatches yet</p>
                        ) : (
                            <div className="space-y-2">
                                {dispatches.slice(0, 5).map(d => (
                                    <div key={d.dispatchId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/40 transition-colors">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            d.status === 'CONFIRMED' ? 'bg-emerald-400' :
                                            d.status === 'DISPUTED' ? 'bg-red-400' :
                                            d.status === 'OVERDUE' ? 'bg-amber-400' :
                                            'bg-blue-400'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{FUEL_LABELS[d.fuelType]} → Stn {d.toStationId.slice(-1)}</p>
                                            <p className="text-xs text-slate-500">{d.quantityDispatched.toLocaleString()}L</p>
                                        </div>
                                        <span className={`text-xs font-black shrink-0 ${
                                            d.status === 'CONFIRMED' ? 'text-emerald-400' :
                                            d.status === 'DISPUTED' ? 'text-red-400' :
                                            'text-blue-400'
                                        }`}>{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial Impact of Fraud */}
                    {alerts.length > 0 && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
                            <h3 className="font-black text-sm uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                                <TrendingUp size={14} /> Fraud Financial Impact
                            </h3>
                            <div className="space-y-2">
                                {STATIONS.map(s => {
                                    const impact = alerts
                                        .filter(a => a.stationId === s.id)
                                        .reduce((sum, a) => sum + a.financialImpact, 0);
                                    return (
                                        <div key={s.id} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-400">{s.name}</span>
                                            <span className={`font-black text-sm ${impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {impact > 0 ? `-₨${impact.toLocaleString()}` : '✓ Clear'}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-red-500/20 pt-2 flex justify-between items-center">
                                    <span className="text-sm font-black text-red-300">Total Impact</span>
                                    <span className="font-black text-red-400">
                                        -₨{alerts.reduce((s, a) => s + a.financialImpact, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
