import React, { useState } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUserId } from '@/lib/authHelpers';
import type { FraudAlertStatus } from '@/types';
import {
    ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2,
    Clock, ChevronDown, ChevronUp, Search
} from 'lucide-react';

const RULE_LABELS: Record<string, string> = {
    'FR-01': 'Stock received less than dispatched (>2%)',
    'FR-02': 'Revenue less than pump meter expected',
    'FR-03': 'Cash shortage vs expected',
    'FR-04': 'Tank dip reading variance',
    'FR-05': 'Edit attempt on verified record',
    'FR-06': 'Off-hours data entry detected',
    'FR-07': 'Station profit margin dropped significantly',
    'FR-08': 'Deletion attempt detected (BLOCKED)',
    'FR-09': 'Stock dispatch not confirmed in 4 hours',
    'FR-10': 'Expense submitted without receipt',
    'FR-11': 'Credit sale exceeds customer limit',
    'FR-12': 'Pump meter reading decreased',
    'FR-13': 'Same record edited multiple times',
    'FR-14': 'Multiple failed PIN attempts',
    'FR-15': 'Login from unrecognized device',
    'FR-16': 'Sudden revenue drop >30%',
    'FR-17': 'Tanker seal reported broken',
    'FR-18': 'Customer debt unpaid >60 days',
    'FR-19': 'Daily cash variance >PKR 2,000',
    'FR-20': 'Large expense bypassed owner approval',
};

const STATION_NAMES: Record<string, string> = {
    'STN-001': 'Station 1',
    'STN-002': 'Station 2',
    'STN-003': 'Station 3',
};

const STATUS_CONFIG: Record<FraudAlertStatus, { label: string; color: string; bg: string }> = {
    OPEN: { label: 'OPEN', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
    UNDER_REVIEW: { label: 'REVIEWING', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    RESOLVED: { label: 'RESOLVED', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
    FALSE_ALARM: { label: 'FALSE ALARM', color: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/30' },
};

export const FraudAlerts: React.FC = () => {
    const { alerts, resolveFraudAlert } = useAntiFraudStore();
    useAuthStore(); // Keep subscription for future role checks

    const [filterStatus, setFilterStatus] = useState<'ALL' | FraudAlertStatus>('ALL');
    const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [resolveNote, setResolveNote] = useState('');
    const [resolveStatus, setResolveStatus] = useState<'RESOLVED' | 'FALSE_ALARM'>('RESOLVED');

    const filtered = alerts.filter(a => {
        const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
        const matchSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
        const matchSearch = !searchTerm ||
            a.ruleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.stationId && STATION_NAMES[a.stationId]?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchStatus && matchSeverity && matchSearch;
    });

    const openCount = alerts.filter(a => a.status === 'OPEN').length;
    const criticalCount = alerts.filter(a => a.status === 'OPEN' && a.severity === 'CRITICAL').length;
    const totalImpact = alerts.reduce((s, a) => s + a.financialImpact, 0);
    const resolvedCount = alerts.filter(a => a.status === 'RESOLVED' || a.status === 'FALSE_ALARM').length;

    const handleResolve = (alertId: string) => {
        if (!resolveNote.trim()) return;
        resolveFraudAlert(alertId, getCurrentUserId(), resolveNote, resolveStatus);
        setExpandedId(null);
        setResolveNote('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <ShieldAlert size={20} />
                    </div>
                    Fraud Alert Engine
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    All alerts are permanent and cannot be deleted. Every record is immutable.
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
                    <p className="text-xs text-red-400 uppercase font-black tracking-wider mb-1">Critical Open</p>
                    <p className="text-4xl font-black text-red-400">{criticalCount}</p>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4">
                    <p className="text-xs text-amber-400 uppercase font-black tracking-wider mb-1">Total Open</p>
                    <p className="text-4xl font-black text-amber-400">{openCount}</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4">
                    <p className="text-xs text-emerald-400 uppercase font-black tracking-wider mb-1">Resolved</p>
                    <p className="text-4xl font-black text-emerald-400">{resolvedCount}</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 uppercase font-black tracking-wider mb-1">Financial Impact</p>
                    <p className="text-2xl font-black text-red-400">-₨{totalImpact.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm focus:border-blue-500 outline-none text-white"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                    {(['ALL', 'OPEN', 'RESOLVED', 'FALSE_ALARM'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-2.5 text-xs font-black uppercase transition-all ${
                                filterStatus === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}>
                            {s === 'FALSE_ALARM' ? 'FALSE' : s}
                        </button>
                    ))}
                </div>

                {/* Severity Filter */}
                <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
                    {(['ALL', 'CRITICAL', 'WARNING'] as const).map(s => (
                        <button key={s} onClick={() => setFilterSeverity(s)}
                            className={`px-3 py-2.5 text-xs font-black uppercase transition-all ${
                                filterSeverity === s ? 'bg-blue-600 text-white' :
                                s === 'CRITICAL' ? 'text-red-400 hover:text-red-300' :
                                s === 'WARNING' ? 'text-amber-400 hover:text-amber-300' :
                                'text-slate-400 hover:text-white'
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 font-bold text-lg">No alerts match your filters</p>
                        <p className="text-slate-600 text-sm mt-1">The system is continuously monitoring all 3 stations</p>
                    </div>
                ) : (
                    filtered.map(alert => {
                        const isExpanded = expandedId === alert.alertId;
                        const statusCfg = STATUS_CONFIG[alert.status];
                        return (
                            <div key={alert.alertId}
                                className={`rounded-2xl border transition-all overflow-hidden ${
                                    alert.severity === 'CRITICAL' && alert.status === 'OPEN'
                                        ? 'bg-red-900/20 border-red-500/40'
                                        : alert.status === 'OPEN'
                                        ? 'bg-amber-900/10 border-amber-500/30'
                                        : 'bg-slate-800/40 border-slate-700/40'
                                }`}>
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : alert.alertId)}
                                    className="w-full text-left p-4 flex items-start gap-3"
                                >
                                    {/* Severity Icon */}
                                    <div className="shrink-0 mt-0.5">
                                        {alert.severity === 'CRITICAL' ? (
                                            <ShieldAlert size={20} className="text-red-400" />
                                        ) : (
                                            <AlertTriangle size={20} className="text-amber-400" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                                                alert.severity === 'CRITICAL'
                                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                                {alert.severity}
                                            </span>
                                            <span className="text-xs font-black text-slate-500">{alert.ruleId}</span>
                                            {alert.stationId && (
                                                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                                                    {STATION_NAMES[alert.stationId] || alert.stationId}
                                                </span>
                                            )}
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                                                {statusCfg.label}
                                            </span>
                                        </div>
                                        <p className="font-bold text-sm leading-tight">
                                            {RULE_LABELS[alert.ruleId] || alert.ruleId}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 truncate">{alert.details}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(alert.triggeredAt).toLocaleString('en-PK')}
                                            </span>
                                            {alert.financialImpact > 0 && (
                                                <span className="text-red-400 font-bold">
                                                    Impact: -₨{alert.financialImpact.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expand icon */}
                                    <div className="shrink-0 text-slate-500">
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="border-t border-slate-700/40 p-4 space-y-4">
                                        {/* Values */}
                                        {(alert.expectedValue !== undefined || alert.actualValue !== undefined) && (
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Expected</p>
                                                    <p className="font-black text-blue-400">{alert.expectedValue?.toLocaleString() ?? '—'}</p>
                                                </div>
                                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Actual</p>
                                                    <p className="font-black text-white">{alert.actualValue?.toLocaleString() ?? '—'}</p>
                                                </div>
                                                <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Variance</p>
                                                    <p className={`font-black ${(alert.variance ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {alert.variance?.toLocaleString() ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Linked record */}
                                        {alert.triggeredByRecord && (
                                            <p className="text-xs text-slate-500">
                                                <span className="font-bold text-slate-400">Linked Record:</span> {alert.triggeredByRecord}
                                            </p>
                                        )}

                                        {/* Resolution (if already resolved) */}
                                        {(alert.status === 'RESOLVED' || alert.status === 'FALSE_ALARM') && alert.resolutionNote && (
                                            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3">
                                                <p className="text-xs text-emerald-400 font-black uppercase mb-1">Resolution Note</p>
                                                <p className="text-sm text-slate-300">{alert.resolutionNote}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Resolved by {alert.resolvedBy} at {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString('en-PK') : ''}
                                                </p>
                                            </div>
                                        )}

                                        {/* Resolution Form (only for OPEN) */}
                                        {alert.status === 'OPEN' && (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setResolveStatus('RESOLVED')}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                                                            resolveStatus === 'RESOLVED'
                                                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                                                : 'border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
                                                        }`}>
                                                        <CheckCircle2 size={12} className="inline mr-1" /> Mark Resolved
                                                    </button>
                                                    <button
                                                        onClick={() => setResolveStatus('FALSE_ALARM')}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                                                            resolveStatus === 'FALSE_ALARM'
                                                                ? 'bg-slate-600 border-slate-500 text-white'
                                                                : 'border-slate-600 text-slate-400 hover:border-slate-400'
                                                        }`}>
                                                        False Alarm
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={resolveNote}
                                                    onChange={e => setResolveNote(e.target.value)}
                                                    placeholder="Enter resolution note (required)..."
                                                    rows={3}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none resize-none"
                                                />
                                                <button
                                                    onClick={() => handleResolve(alert.alertId)}
                                                    disabled={!resolveNote.trim()}
                                                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all font-black text-sm"
                                                >
                                                    Confirm Resolution
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
