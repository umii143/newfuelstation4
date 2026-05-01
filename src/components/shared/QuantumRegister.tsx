import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, ArrowUp, ArrowDown, 
    ShieldCheck, Activity, Printer, FileSpreadsheet,
    ChevronLeft, ChevronRight, Columns3, Eye, EyeOff
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export interface QuantumColumn<T> {
    key: string;
    label: string;
    type: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'badge' | 'user';
    align?: 'left' | 'right' | 'center';
    width?: string;
    formatValue?: (value: any, item: T) => React.ReactNode;
    calculateTotal?: boolean;
    sortable?: boolean;
}

export interface QuantumRegisterProps<T> {
    title: string;
    subtitle?: string;
    data: T[];
    columns: QuantumColumn<T>[];
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    enableSignatures?: boolean;
    heightClass?: string;
    onRowClick?: (row: T) => void;
}

const ROWS_PER_PAGE = 50;

export function QuantumRegister<T extends { id?: string | number }>({
    title,
    subtitle,
    data,
    columns,
    onExportExcel,
    onExportPDF,
    enableSignatures = true,
    heightClass = 'min-h-[500px] max-h-[70vh]',
    onRowClick,
}: QuantumRegisterProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const [showColumnPicker, setShowColumnPicker] = useState(false);

    // Visible columns
    const visibleColumns = useMemo(() => 
        columns.filter(col => !hiddenColumns.has(col.key)),
        [columns, hiddenColumns]
    );

    const toggleColumn = useCallback((key: string) => {
        setHiddenColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                // Don't allow hiding ALL columns
                if (next.size < columns.length - 1) {
                    next.add(key);
                }
            }
            return next;
        });
    }, [columns.length]);

    // Dynamic Data Processing
    const processedData = useMemo(() => {
        let filtered = [...data];

        // 1. Global Text Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                Object.values(item as object).some(val => 
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        // 2. Sorting
        if (sortConfig) {
            filtered.sort((a: any, b: any) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(processedData.length / ROWS_PER_PAGE));
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return processedData.slice(start, start + ROWS_PER_PAGE);
    }, [processedData, currentPage]);

    // Reset page on search/sort change
    React.useEffect(() => { setCurrentPage(1); }, [searchTerm, sortConfig]);

    // Footer Totals Calculation (on ALL filtered data, not just current page)
    const totals = useMemo(() => {
        const sums: Record<string, number> = {};
        visibleColumns.forEach(col => {
            if (col.calculateTotal || col.type === 'currency') {
                sums[col.key] = processedData.reduce((acc, item: any) => {
                    const val = parseFloat(item[col.key]) || 0;
                    return acc + val;
                }, 0);
            }
        });
        return sums;
    }, [processedData, visibleColumns]);

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    // Advanced Cell Renderer — FULLY THEME-RESPONSIVE
    const renderCell = (item: any, col: QuantumColumn<T>) => {
        if (col.formatValue) return col.formatValue(item[col.key], item);
        const val = item[col.key];

        switch (col.type) {
            case 'currency':
                return (
                    <span className={clsx(
                        "font-mono font-black tracking-tighter",
                        val < 0 
                            ? "text-rose-600 dark:text-rose-400" 
                            : "text-emerald-600 dark:text-emerald-400"
                    )}>
                        {val < 0 ? '-' : ''}₨{Math.abs(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                );
            case 'number':
                return <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{Number(val || 0).toLocaleString()}</span>;
            case 'date':
                return <span className="text-slate-500 dark:text-slate-400 font-medium text-xs tracking-wider">{val ? format(new Date(val), 'dd MMM yyyy') : '-'}</span>;
            case 'datetime':
                return <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{val ? format(new Date(val), 'dd MMM yyyy HH:mm') : '-'}</span>;
            case 'badge': {
                // Auto-coloring logic for forensics
                const isWarning = /variance|shortage|loss|fail|suspended|critical|review|low|high|payable/i.test(String(val));
                const isGood = /profit|recovery|success|active|balanced|good|clear|ok|excellent|present/i.test(String(val));
                return (
                    <span className={clsx(
                        "px-2.5 py-1 text-[9px] font-black uppercase rounded-md tracking-[.1em] border",
                        isWarning 
                            ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" 
                            : isGood 
                                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                                : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                    )}>
                        {String(val || 'N/A').replace(/[_-]/g, ' ')}
                    </span>
                );
            }
            case 'user':
                return (
                    <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-[9px] font-black text-blue-600 dark:text-blue-400 shrink-0">
                            {String(val || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{val}</span>
                    </span>
                );
            default:
                return <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{val ?? '-'}</span>;
        }
    };

    return (
        <div className="flex flex-col w-full bg-white dark:bg-[#0a0f1c] bloomberg:bg-black border border-slate-200 dark:border-white/10 bloomberg:border-[#2A2A2A] rounded-2xl bloomberg:rounded-sm shadow-lg dark:shadow-2xl bloomberg:shadow-none overflow-hidden ring-1 ring-slate-200/50 dark:ring-black/50 bloomberg:ring-0 transition-colors">
            {/* ═══ Command Header ═══ */}
            <div className="p-5 md:p-6 bg-gradient-to-b from-slate-50 dark:from-slate-900/80 bloomberg:from-[#0D0D0D] to-transparent bloomberg:to-[#000000] border-b border-slate-200 dark:border-white/5 bloomberg:border-[#2A2A2A] flex flex-col xl:flex-row xl:items-end justify-between gap-5">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-3">
                        <Activity className="text-blue-600 dark:text-blue-500" size={22} />
                        {title}
                    </h2>
                    {subtitle && <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-widest text-[10px]">{subtitle}</p>}
                    {/* Row Count Badge */}
                    <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            Showing {paginatedData.length} of {processedData.length} records
                        </span>
                        {searchTerm && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-700">
                                Filtered from {data.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative group min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search all columns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>
                    
                    {/* Actions Bar */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        {onExportExcel && (
                            <button onClick={onExportExcel} className="p-2 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 rounded-lg transition-colors group" title="Export Excel">
                                <FileSpreadsheet className="w-4.5 h-4.5 group-active:scale-95 transition-transform" />
                            </button>
                        )}
                        {onExportPDF && (
                            <button onClick={onExportPDF} className="p-2 text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-lg transition-colors group" title="Print Register">
                                <Printer className="w-4.5 h-4.5 group-active:scale-95 transition-transform" />
                            </button>
                        )}
                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />
                        {/* Column Visibility Toggle */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowColumnPicker(!showColumnPicker)}
                                className={clsx(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors",
                                    showColumnPicker 
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" 
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                )}
                            >
                                <Columns3 className="w-3.5 h-3.5" /> Columns
                            </button>
                            {/* Column Picker Dropdown */}
                            <AnimatePresence>
                                {showColumnPicker && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -8 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: -8 }}
                                        className="absolute right-0 top-full mt-2 z-50 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl dark:shadow-2xl p-3 space-y-1"
                                    >
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-2">Toggle Columns</p>
                                        {columns.map(col => (
                                            <button 
                                                key={col.key}
                                                onClick={() => toggleColumn(col.key)}
                                                className={clsx(
                                                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors text-left",
                                                    hiddenColumns.has(col.key)
                                                        ? "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        : "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800"
                                                )}
                                            >
                                                {hiddenColumns.has(col.key) 
                                                    ? <EyeOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" /> 
                                                    : <Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                }
                                                {col.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ The Quantum Grid (Excel Freeze-Pane Architecture) ═══ */}
            <div className={clsx("w-full overflow-auto custom-scrollbar relative bg-white dark:bg-[#060a14] bloomberg:bg-[#000000] transition-colors", heightClass)}>
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-50 dark:bg-[#0f172a] bloomberg:bg-[#0D0D0D] shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] bloomberg:shadow-[0_1px_0_#2A2A2A]">
                            {visibleColumns.map((col) => (
                                <th 
                                    key={col.key}
                                    style={{ width: col.width }}
                                    className={clsx(
                                        "px-5 py-3.5 text-[10px] font-black uppercase tracking-[.15em] border-b select-none",
                                        "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 bloomberg:border-[#2A2A2A] bloomberg:text-[#888]",
                                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                                        (col.sortable !== false) && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 bloomberg:hover:bg-[#1A1A1A] hover:text-slate-700 dark:hover:text-slate-200 bloomberg:hover:text-white transition-colors",
                                        sortConfig?.key === col.key && "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 bloomberg:text-[#F5A623] bloomberg:bg-[#1A1A1A]"
                                    )}
                                    onClick={() => (col.sortable !== false) && handleSort(col.key)}
                                >
                                    <div className={clsx(
                                        "flex items-center gap-1.5",
                                        col.align === 'right' && "justify-end",
                                        col.align === 'center' && "justify-center"
                                    )}>
                                        {col.label}
                                        {sortConfig?.key === col.key && (
                                            <span className="text-blue-600 dark:text-blue-500">
                                                {sortConfig.direction === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bloomberg:divide-[#2A2A2A]/40">
                        <AnimatePresence>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIdx) => (
                                    <motion.tr 
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={item.id || rowIdx}
                                        onClick={() => onRowClick && onRowClick(item)}
                                        className={clsx(
                                            "group transition-colors",
                                            onRowClick && "cursor-pointer",
                                            rowIdx % 2 === 0
                                                ? "bg-transparent hover:bg-blue-50/50 dark:hover:bg-white/[0.03] bloomberg:hover:bg-[#111111]"
                                                : "bg-slate-50/50 dark:bg-white/[0.015] bloomberg:bg-[#0A0A0A] hover:bg-blue-50/50 dark:hover:bg-white/[0.04] bloomberg:hover:bg-[#111111]"
                                        )}
                                    >
                                        {visibleColumns.map((col, colIdx) => (
                                            <td 
                                                key={col.key} 
                                                className={clsx(
                                                    "px-5 py-3 transition-colors",
                                                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                                                    colIdx === 0 && "bg-white dark:bg-[#060a14] bloomberg:bg-black group-hover:bg-blue-50/50 dark:group-hover:bg-[#0f172a] bloomberg:group-hover:bg-[#111] sticky left-0 z-10 border-r border-slate-100 dark:border-slate-800/50 bloomberg:border-[#2A2A2A] shadow-[2px_0_8px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.2)] bloomberg:shadow-[4px_0_12px_rgba(0,0,0,0.6)]"
                                                )}
                                            >
                                                {renderCell(item, col)}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <ShieldCheck size={44} className="text-slate-300 dark:text-slate-800 mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No entries found matching filters</p>
                                            {searchTerm && (
                                                <button 
                                                    onClick={() => setSearchTerm('')}
                                                    className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Clear search filter
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                    
                    {/* ═══ Live Forensic Footer ═══ */}
                    {processedData.length > 0 && Object.keys(totals).length > 0 && (
                        <tfoot className="sticky bottom-0 z-20 bg-slate-50 dark:bg-slate-900 bloomberg:bg-[#0D0D0D] border-t-2 border-blue-500/20 dark:border-blue-500/30 bloomberg:border-[#2A2A2A] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bloomberg:shadow-[0_-1px_0_#2A2A2A]">
                            <tr>
                                {visibleColumns.map((col, idx) => (
                                    <td 
                                        key={idx} 
                                        className={clsx(
                                            "px-5 py-4 border-t border-slate-200 dark:border-slate-800",
                                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                                            idx === 0 && "sticky left-0 bg-slate-50 dark:bg-slate-900"
                                        )}
                                    >
                                        {idx === 0 ? (
                                            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-[.25em]">Aggregate Totals</span>
                                        ) : totals[col.key] !== undefined ? (
                                            <span className={clsx(
                                                "font-mono font-black text-base md:text-lg tracking-tighter",
                                                col.type === 'currency' ? (totals[col.key] < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-900 dark:text-white'
                                            )}>
                                                {col.type === 'currency' ? '₨' : ''}
                                                {Math.abs(totals[col.key]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                {totals[col.key] < 0 ? ' (DR)' : ''}
                                            </span>
                                        ) : null}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* ═══ Pagination Bar ═══ */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={clsx(
                                        "w-8 h-8 rounded-lg text-xs font-black transition-colors",
                                        currentPage === page
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ Signature Block (Print Mode Only) ═══ */}
            {enableSignatures && (
                <div className="hidden print:flex flex-row justify-between items-end p-12 pt-24 bg-white text-black border-t-2 border-black mt-8 break-inside-avoid">
                    <div className="flex flex-col items-center">
                        <div className="w-64 border-b border-black mb-2"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Prepared By (System Performer)</span>
                        <span className="text-[10px] text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-red-800 flex items-center justify-center opacity-70 mb-4 transform -rotate-12">
                            <span className="text-red-800 font-bold text-[8px] uppercase tracking-tighter text-center leading-tight">AUDITED<br/>& VERIFIED</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer">
                        <div className="w-64 border-b border-black mb-2"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Approved By (Station Master)</span>
                        <span className="text-[10px] text-gray-500 mt-1">Signature / Stamp</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuantumRegister;
