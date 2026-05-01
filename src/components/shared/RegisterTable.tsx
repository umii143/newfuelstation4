import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Download, ChevronRight, Clock, User } from 'lucide-react';

interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    align?: 'left' | 'right' | 'center';
    cell?: (item: T) => React.ReactNode;
    width?: string;
    isNumeric?: boolean;
}

interface RegisterTableProps<T> {
    title: string;
    subtitle?: string;
    data: T[];
    columns: Column<T>[];
    footerTotals?: Record<string, number | string>;
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    actions?: React.ReactNode;
}

export function RegisterTable<T extends { id: string; timestamp?: string; performer?: string }>({
    title,
    subtitle,
    data,
    columns,
    footerTotals,
    isLoading,
    onRowClick,
    actions
}: RegisterTableProps<T>) {
    return (
        <div className="relative flex flex-col w-full h-full overflow-hidden bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-2xl transition-colors">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 dark:text-white/50">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {actions}
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg transition-all text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table Body Container */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-50 dark:bg-[#0f172a]/90 backdrop-blur-md">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40 border-b border-slate-200 dark:border-white/10 ${
                                        col.align === 'right' ? 'text-right' : ''
                                    }`}
                                    style={{ width: col.width }}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {onRowClick && <th className="px-6 py-4 border-b border-slate-200 dark:border-white/10 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {data.length > 0 ? (
                            data.map((item, rowIdx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(rowIdx * 0.02, 0.5) }}
                                    key={item.id}
                                    onClick={() => onRowClick?.(item)}
                                    className={`group hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    } ${rowIdx % 2 === 1 ? 'bg-slate-50/50 dark:bg-transparent' : ''}`}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={`px-6 py-4 text-sm ${
                                                col.isNumeric ? 'font-mono' : ''
                                            } ${
                                                col.align === 'right' ? 'text-right text-slate-900 dark:text-white' : 'text-slate-700 dark:text-white/80'
                                            }`}
                                        >
                                            {col.cell ? (
                                                col.cell(item)
                                            ) : (
                                                String(item[col.accessorKey as keyof T] || '-')
                                            )}
                                        </td>
                                    ))}
                                    {onRowClick && (
                                        <td className="px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/40" />
                                        </td>
                                    )}
                                </motion.tr>
                            ))
                        ) : !isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (onRowClick ? 1 : 0)} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-white/30">
                                        <Filter className="w-12 h-12 stroke-[1]" />
                                        <p className="text-lg">No entries found for this period</p>
                                    </div>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>

                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-blue-600 dark:text-blue-400 font-medium animate-pulse text-sm">Synchronizing Master Register...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Totals Section */}
            {footerTotals && (
                <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10">
                    <div className="flex justify-end items-center gap-12">
                        {Object.entries(footerTotals).map(([label, value], idx) => (
                            <div key={idx} className="flex flex-col items-end">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-1">
                                    {label}
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">
                                    {typeof value === 'number' ? `₨${value.toLocaleString()}` : value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for small activity tags with time/user
export const MiniActivityStamp: React.FC<{ timestamp: string; user?: string }> = ({ timestamp, user }) => {
    return (
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-white/40">
            <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {user && (
                <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user}
                </span>
            )}
        </div>
    );
};
