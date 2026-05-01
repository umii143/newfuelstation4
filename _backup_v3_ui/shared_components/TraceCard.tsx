import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Activity, Clock, User, Fingerprint, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export interface TraceRecord {
    id: string | number;
    timestamp?: string;
    performer?: string;
    action?: string;
    module?: string;
    details?: string;
    [key: string]: any; // Catch-all for extra data
}

interface TraceCardProps {
    isOpen: boolean;
    onClose: () => void;
    record: TraceRecord | null;
    title?: string;
}

export const TraceCard: React.FC<TraceCardProps> = ({ 
    isOpen, 
    onClose, 
    record,
    title = 'Forensic Record Inspector' 
}) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !record) return null;

    // Filter out complex objects for simple display
    const primitiveKeys = Object.keys(record).filter(key => 
        typeof record[key] !== 'object' && 
        key !== 'id' && 
        key !== 'timestamp' &&
        key !== 'action' &&
        key !== 'module' &&
        key !== 'details'
    );

    const handleCopyId = () => {
        navigator.clipboard.writeText(String(record.id));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatValue = (key: string, value: any): string => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'number') {
            // Detect currency-like values
            if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue') || 
                key.toLowerCase().includes('cost') || key.toLowerCase().includes('balance') ||
                key.toLowerCase().includes('salary') || key.toLowerCase().includes('price') ||
                key.toLowerCase().includes('debit') || key.toLowerCase().includes('credit') ||
                key.toLowerCase().includes('profit') || key.toLowerCase().includes('expense')) {
                return `₨${value.toLocaleString()}`;
            }
            return value.toLocaleString();
        }
        return String(value);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 lg:pl-72">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 dark:bg-[#06080f]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                    <Fingerprint className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-widest uppercase">{title}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold">Immutable Read-Only Frame</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleCopyId}
                                    className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-blue-200 dark:border-transparent"
                                    title="Copy Reference ID"
                                >
                                    {copied 
                                        ? <><CheckCircle2 className="w-3 h-3" /><span>Copied!</span></>
                                        : <><Copy className="w-3 h-3" /><span>Copy ID</span></>
                                    }
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto p-5 md:p-6 space-y-5">
                            
                            {/* Key Indicators */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2.5 mb-2 text-slate-400 dark:text-white/40">
                                        <Activity className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Action / Event</span>
                                    </div>
                                    <p className="text-base md:text-lg font-black text-slate-900 dark:text-white/90 uppercase tracking-widest">
                                        {record.action?.replace(/_/g, ' ') || 'SYSTEM_EVENT'}
                                    </p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 uppercase font-bold tracking-widest">{record.module || 'CORE_SYSTEM'}</p>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2.5 mb-2 text-slate-400 dark:text-white/40">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Timestamp</span>
                                    </div>
                                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white/90">
                                        {record.timestamp ? format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm:ss') : 'N/A'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 uppercase font-bold tracking-widest">Time-Synchronous</p>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                                    <div className="flex items-center gap-2.5 mb-2 text-slate-400 dark:text-white/40">
                                        <User className="w-4 h-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Performer</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white/90">
                                        {record.performer || (record as any).userName || (record as any).staffName || 'System Auto-execution'}
                                    </p>
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 uppercase font-bold tracking-widest">Verified Identity</p>
                                </div>
                            </div>

                            {/* Details Blob */}
                            {record.details && (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                    <h4 className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mb-2">Narrative Details</h4>
                                    <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed font-mono">
                                        {record.details}
                                    </p>
                                </div>
                            )}

                            {/* Metadata Grid */}
                            {primitiveKeys.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-white/60 font-bold uppercase tracking-widest">
                                        <Search className="w-3 h-3" />
                                        Raw Telemetry Data
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {primitiveKeys.map(key => (
                                            <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <span className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="text-xs font-mono font-bold text-slate-800 dark:text-white/90 max-w-[60%] truncate" title={String(record[key])}>
                                                    {formatValue(key, record[key])}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Read-Only Terminal Block */}
                            <div className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 overflow-hidden">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                    <span className="ml-2 text-[9px] font-mono text-slate-400 dark:text-white/30 tracking-widest">DATA_DUMP.JSON</span>
                                </div>
                                <pre className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(record, null, 2)}
                                </pre>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
