import { useAuditStore } from '@/stores/ledgerStore';
import { format } from 'date-fns';
import { Download, Filter, Search, Shield } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const AuditVault: React.FC = () => {
    const { logs } = useAuditStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        return logs.filter(
            log =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const totalEvents = logs.length;
    const securityAlerts = logs.filter(l => l.severity === 'WARNING').length;
    const criticalErrors = logs.filter(l => l.severity === 'CRITICAL').length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Audit Vault
                    </h1>
                    <p className="text-gray-500 mt-1">Immutable record of all system operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
                        <Filter size={18} />
                        Filter Logs
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm font-semibold">
                        <Download size={18} />
                        Export Audit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Events', value: totalEvents, icon: Shield, color: 'blue' },
                    {
                        label: 'Security Alerts',
                        value: securityAlerts,
                        icon: Shield,
                        color: 'emerald',
                    },
                    {
                        label: 'Critical Errors',
                        value: criticalErrors,
                        icon: Shield,
                        color: 'rose',
                    },
                ].map((kpi, i) => (
                    <div
                        key={i}
                        className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-xl overflow-hidden relative group"
                    >
                        <div
                            className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${kpi.color}-500`}
                        >
                            <kpi.icon size={80} />
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            {kpi.label}
                        </p>
                        <p className="text-3xl font-black text-gray-900 mt-2">
                            {kpi.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Operation Logs</h2>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Module
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-blue-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {log.userName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p className="font-medium text-gray-900">
                                                {log.action}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                {log.details}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                                    log.severity === 'INFO'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : log.severity === 'WARNING'
                                                          ? 'bg-amber-100 text-amber-700'
                                                          : 'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {log.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditVault;
