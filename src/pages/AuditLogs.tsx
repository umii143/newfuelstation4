import { Button, Card, PageHeader } from '@/components/ui';
import { useAuditStore } from '@/stores/ledgerStore';
import { format } from 'date-fns';
import {
    AlertCircle,
    AlertTriangle,
    Clock,
    Download,
    Filter,
    Info,
    Search,
    Shield,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';

const AuditLogs: React.FC = () => {
    const { logs, clearLogs } = useAuditStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>(
        'ALL'
    );

    const filteredLogs = (logs || []).filter(log => {
        if (!log) return false;
        const matchesSearch =
            (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.module || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'WARNING':
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'WARNING':
                return 'bg-orange-50 text-orange-700 border-orange-100';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="System Audit Logs"
                subtitle="Track all critical activities and system modifications"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => {}}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button variant="danger" onClick={clearLogs}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Logs
                        </Button>
                    </div>
                }
            />

            {/* Simple Search and Filters */}
            <Card className="p-4 flex flex-col md:row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs by user, action or module..."
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value as any)}
                    >
                        <option value="ALL">All Severities</option>
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
            </Card>

            {/* Logs List */}
            <div className="space-y-3">
                {(filteredLogs || []).map(log => {
                    if (!log) return null;
                    const logDate = log.timestamp ? new Date(log.timestamp) : new Date();
                    const isValidDate = !isNaN(logDate.getTime());

                    return (
                        <Card
                            key={log.id}
                            className="p-4 hover:border-blue-400/50 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`p-2 rounded-xl border ${getSeverityStyles(log.severity || 'INFO')}`}
                                >
                                    {getSeverityIcon(log.severity || 'INFO')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--text-primary)]">
                                                {log.action || 'Unknown Action'}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                                                {log.module || 'System'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                                            <Clock className="w-3 h-3" />
                                            {isValidDate
                                                ? format(logDate, 'dd MMM HH:mm:ss')
                                                : 'Invalid Date'}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                                        {log.details || 'No details available'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-1.5 text-blue-600">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            {log.userName || 'System'}
                                        </div>
                                        <div className="text-[var(--text-secondary)] opacity-50">
                                            ID: {log.id || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredLogs.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto opacity-20" />
                        <p className="text-gray-400 font-medium italic">
                            No audit records found matching your criteria
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
