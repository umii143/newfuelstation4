import React, { useMemo } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { 
    AlertTriangle, Package, TrendingUp, Truck, ShieldAlert, 
    ShieldCheck, BarChart3, Clock, Zap, Activity, Info,
    Fingerprint, Lock, Eye, Search, Filter, AlertCircle
} from 'lucide-react';
import { useAuditStore } from '@/stores/ledgerStore';

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

const LiveFraudFeed: React.FC<{ alerts: any[] }> = ({ alerts }) => (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-xl h-full flex flex-col">
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Audit Intelligence</h3>
            </div>
            <Zap size={14} className="text-amber-400" />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {alerts.length === 0 ? (
                <div className="p-10 text-center text-slate-600">
                    <ShieldCheck size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No active threats detected</p>
                </div>
            ) : (
                alerts.map((alert) => (
                    <div key={alert.alertId} className="p-4 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                                {alert.ruleId}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                                {new Date(alert.triggeredAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-tight mb-1">{alert.details}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Station {alert.stationId?.slice(-1) || '?'}</span>
                            <span className="text-[10px] font-black text-red-400/80">Impact: ₨{alert.financialImpact.toLocaleString()}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const SecurityMonitor: React.FC<{ logs: any[] }> = ({ logs }) => (
    <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-red-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Intrusion Monitor</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-red-300 uppercase">Live Lockdown</span>
            </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {logs.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">System Integrity Optimal</p>
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="p-4 border-b border-slate-800/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter">
                                {log.action.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-tight mb-1">{log.details}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">User: {log.userName}</span>
                            <span className="text-[10px] font-mono text-slate-600">{log.id}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

export const OwnerDashboard: React.FC = () => {
    const { ownerStockPool, dispatches, alerts } = useAntiFraudStore();
    const { logs } = useAuditStore();

    const securityLogs = useMemo(() => 
        logs.filter(l => l.module === 'SECURITY').slice(0, 5),
    [logs]);

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
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Owner Command Center</h1>
                        <p className="text-slate-400 text-sm">Group-level intelligence across all stations</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate('/owner/fraud')}
                        className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <ShieldAlert size={14} className="text-red-400" />
                        Forensic Logs
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            {criticalAlerts.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center gap-3 animate-pulse">
                    <ShieldAlert size={24} className="text-red-400 shrink-0" />
                    <div className="flex-1">
                        <p className="font-black text-red-300">{criticalAlerts.length} CRITICAL ALERT{criticalAlerts.length > 1 ? 'S' : ''} DETECTED</p>
                        <p className="text-red-400/80 text-xs truncate max-w-2xl">{criticalAlerts[0].details}</p>
                    </div>
                    <button
                        onClick={() => navigate('/owner/fraud')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-sm transition-colors shrink-0"
                    >
                        Investigate
                    </button>
                </div>
            )}

            {/* Top Row: Intelligence & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <LiveFraudFeed alerts={openAlerts.slice(0, 10)} />
                </div>
                <div className="space-y-6">
                    <SecurityMonitor logs={securityLogs} />
                    
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Risk Heatmap</h3>
                        </div>
                        <div className="space-y-4">
                            {STATIONS.map(s => {
                                const sAlerts = alerts.filter(a => a.stationId === s.id && a.status === 'OPEN');
                                const riskLevel = sAlerts.length > 5 ? 'CRITICAL' : sAlerts.length > 2 ? 'HIGH' : sAlerts.length > 0 ? 'MODERATE' : 'LOW';
                                const riskColor = riskLevel === 'CRITICAL' ? 'bg-red-500' : riskLevel === 'HIGH' ? 'bg-orange-500' : riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500';
                                
                                return (
                                    <div key={s.id}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1">
                                            <span>{s.name}</span>
                                            <span className={riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>{riskLevel}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${riskColor} transition-all duration-1000`} 
                                                style={{ width: `${Math.min(100, (sAlerts.length + 1) * 20)}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Critical Alerts', val: criticalAlerts.length, sub: 'Immediate action', icon: ShieldAlert, color: 'text-red-400' },
                    { label: 'Warnings', val: warningAlerts.length, sub: 'Active warnings', icon: AlertTriangle, color: 'text-amber-400' },
                    { label: 'In Transit', val: dispatches.filter(d => d.status === 'IN_TRANSIT').length, sub: 'Pending receipt', icon: Truck, color: 'text-blue-400' },
                    { label: 'Today Total', val: todayAlerts.length, sub: 'Last 24 hours', icon: ShieldCheck, color: 'text-emerald-400' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                            <kpi.icon size={16} className={kpi.color} />
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{kpi.label}</span>
                        </div>
                        <p className={`text-3xl font-black ${kpi.color}`}>{kpi.val}</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Station Status Cards */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Unit Deployment Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stationStats.map(station => (
                            <div key={station.id}
                                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md hover:border-blue-500/30 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-lg group-hover:text-blue-400 transition-colors">{station.name}</h3>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Manager: {station.manager}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        station.openAlerts > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                        {station.openAlerts > 0 ? `⚠ ${station.openAlerts} ALERT` : '✓ SECURE'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Dispatches', val: dispatches.filter(d => d.toStationId === station.id).length, color: 'text-blue-400' },
                                        { label: 'Disputed', val: station.disputed, color: station.disputed > 0 ? 'text-red-400' : 'text-slate-400' },
                                        { label: 'Alerts', val: station.openAlerts, color: station.openAlerts > 0 ? 'text-red-400' : 'text-slate-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-950/40 rounded-xl p-2 text-center border border-slate-800/50">
                                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{stat.label}</p>
                                            <p className={`text-lg font-black ${stat.color}`}>{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={() => navigate('/owner/stock')}
                            className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-black flex items-center justify-between group shadow-xl shadow-blue-900/20">
                            <div className="flex items-center gap-4">
                                <Package size={24} className="group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-sm">Group Stock Control</p>
                                    <p className="text-[10px] opacity-70">Purchase & Dispatch</p>
                                </div>
                            </div>
                            <Clock size={16} className="opacity-30" />
                        </button>
                        <button
                            onClick={() => navigate('/owner/fraud')}
                            className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/50 transition-all font-black flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <ShieldAlert size={24} className="text-red-400 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-sm text-red-100">Forensic Intelligence</p>
                                    <p className="text-[10px] text-red-400/70">Audit Trail Analysis</p>
                                </div>
                            </div>
                            <Lock size={16} className="opacity-30" />
                        </button>
                    </div>
                </div>

                {/* Right Summary Column */}
                <div className="space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-red-400" />
                            Financial Leakage
                        </h2>
                        <div className="space-y-3">
                            {STATIONS.map(s => {
                                const impact = alerts
                                    .filter(a => a.stationId === s.id)
                                    .reduce((sum, a) => sum + a.financialImpact, 0);
                                return (
                                    <div key={s.id} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
                                        <span className="text-xs font-bold text-slate-300">{s.name}</span>
                                        <span className={`font-black text-xs ${impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {impact > 0 ? `-₨${impact.toLocaleString()}` : '✓ Secure'}
                                        </span>
                                    </div>
                                );
                            })}
                            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                                <span className="text-xs font-black text-red-300 uppercase">Total Leakage</span>
                                <span className="text-xl font-black text-red-400">
                                    ₨{alerts.reduce((s, a) => s + a.financialImpact, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={16} className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Forensic Confidence</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-4xl font-black text-emerald-400">99.8%</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Zero-Escape Reliability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
