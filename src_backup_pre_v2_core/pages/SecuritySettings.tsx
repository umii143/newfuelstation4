import { Button, Card, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    ExternalLink,
    Filter,
    Globe,
    Lock,
    Monitor,
    Search,
    Shield,
    Smartphone,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const SecuritySettings: React.FC = () => {
    const { user, sessions, auditLogs, fetchSessions, fetchAuditLogs, terminateSession, isAdmin } =
        useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction] = useState('ALL');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchSessions(), fetchAuditLogs()]);
            setIsLoading(false);
        };
        loadData();
    }, [fetchSessions, fetchAuditLogs]);

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return <Monitor className="w-5 h-5" />;
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return <Smartphone className="w-5 h-5 text-blue-500" />;
        }
        return <Monitor className="w-5 h-5 text-indigo-500" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'FAILURE':
                return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default:
                return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch =
            log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    if (isLoading) {
        return (
            <div className="p-6 text-center text-[var(--text-secondary)] font-bold italic">
                Loading secure data vault...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Security & Access Control"
                subtitle="Manage your active sessions and monitor account activity"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account Protection & Active Sessions */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Security Health Card */}
                    <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Lock size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Security Status
                            </h3>
                            <p className="text-blue-100 text-sm mb-6">
                                Your account is protected by enterprise-grade security.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-80 text-xs uppercase font-bold tracking-wider">
                                        Auth Method
                                    </span>
                                    <span className="font-mono bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest text-[10px]">
                                        {user?.authMethod || 'EMAIL'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="opacity-80 text-xs uppercase tracking-wider">
                                        Active Sessions
                                    </span>
                                    <span className="bg-white text-blue-700 px-3 py-0.5 rounded-full text-xs">
                                        {sessions.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Active Sessions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Active Devices
                        </h3>
                        <div className="space-y-3">
                            {sessions.map(session => (
                                <Card
                                    key={session.id}
                                    className="p-4 bg-white/50 backdrop-blur-xl border-white/20 hover:border-blue-400/50 transition-all group overflow-hidden relative"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                            {getDeviceIcon(session.userAgent)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                                    {session.userAgent
                                                        ?.split(')')[0]
                                                        ?.split('(')[1] || 'Current Browser'}
                                                </h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
                                                    onClick={() => terminateSession(session.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {session.ipAddress || 'Unknown IP'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(
                                                        new Date(session.lastActiveAt),
                                                        'HH:mm'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {session.isActive && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border-none shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                                                Live
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full py-6 rounded-2xl border-dashed opacity-70 hover:opacity-100 hover:bg-white transition-all text-gray-500 font-bold text-sm"
                        >
                            Show All Session History
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Right Column: Audit Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Activity Logs
                            {isAdmin() && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-white uppercase tracking-widest ml-2 italic">
                                    System Admin Mode
                                </span>
                            )}
                        </h3>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by user or action..."
                                    className="pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-64"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                className="rounded-xl px-3 border border-gray-200 bg-white"
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden hover:shadow-blue-500/5 transition-all">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Event
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLogs.map(log => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-blue-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`p-2 rounded-lg border flex-shrink-0 ${getStatusColor(log.status)}`}
                                                    >
                                                        {log.status === 'SUCCESS' ? (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[var(--text-primary)]">
                                                            {log.action?.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold italic uppercase tracking-tighter">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {format(
                                                                new Date(log.createdAt),
                                                                'dd MMM, HH:mm:ss'
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white uppercase bg-blue-500">
                                                        {log.email?.substring(0, 2) || '??'}
                                                    </div>
                                                    <div className="text-sm text-[var(--text-secondary)] font-medium">
                                                        {log.email || 'System'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {log.ipAddress || '::1'}
                                                </div>
                                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1 justify-end ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Raw Data
                                                    <ExternalLink size={10} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4 opacity-50" />
                                                <p className="text-gray-400 font-bold italic tracking-wider">
                                                    No security events found in our immutable logs
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {auditLogs.length > 50 && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 font-bold text-xs uppercase tracking-widest"
                                >
                                    Load More Historical Events
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
