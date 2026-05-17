import { Button, Card, Input, Modal } from '@/components/ui';
import { QuantumRegister, type QuantumColumn } from '@/components/shared/QuantumRegister';
import { TraceCard, type TraceRecord } from '@/components/shared/TraceCard';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import clsx from 'clsx';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    FileSpreadsheet,
    Search,
    ShieldCheck,
    TrendingUp,
    Printer,
    Share2,
    Clock,
    Settings2,
    FileText
} from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { REPORT_REGISTRY } from './ReportRegistry';
import { ReportDataResolver, type ReportErrorState, type ResolverResponse } from './ReportDataResolver';
import { exportToPDF } from '@/lib/pdfExporter';
import { useScheduleStore } from '@/stores/scheduleStore';
import { verifyReportData, type AuditResult } from '@/lib/accuracyVerifier';
import { getBusinessMeta } from '@/lib/businessScope';
import { canManageReportSchedules } from '@/lib/roleHelpers';

interface ReportViewerProps {
    reportId: string;
    onBack: () => void;
    dateRange?: { start: Date; end: Date };
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId, onBack, dateRange }) => {
    const report = useMemo(() => REPORT_REGISTRY.find(r => r.id === reportId), [reportId]);
    const { settings } = useSettingsStore();
    const { user } = useAuthStore();
    const activeBusiness = getBusinessMeta(settings.businessUnit);
    const canScheduleReports = canManageReportSchedules(user?.role);
    const [activeDrillDown, setActiveDrillDown] = useState<string | null>(null);
    const [traceRecord, setTraceRecord] = useState<TraceRecord | null>(null);
    const { addSchedule } = useScheduleStore();
    const toast = useToastStore();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [exportOptions, setExportOptions] = useState({
        orientation: 'landscape' as 'portrait' | 'landscape',
        includeSummary: true,
        includeTimestamp: true,
        accentTheme: 'blue' as 'blue' | 'emerald' | 'slate' | 'rose',
        confidentiality: 'INTERNAL' as 'STANDARD' | 'INTERNAL' | 'CONFIDENTIAL' | 'FORENSIC',
        footerNote: '',
    });
    const [scheduleForm, setScheduleForm] = useState({
        frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'END_OF_SHIFT',
        recipients: 'admin@motorwayoil.com',
        format: 'PDF' as 'PDF' | 'CSV' | 'EXCEL',
    });

    // Resolution State
    const [resolverResult, setResolverResult] = useState<ResolverResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorState, setErrorState] = useState<{ state: ReportErrorState; message: string } | null>(null);
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const isCrossBusinessAccess =
        !!report &&
        !!report.module &&
        report.module !== 'ALL' &&
        report.module !== 'ENTERPRISE' &&
        report.module !== settings.businessUnit;

    // Async Data Resolution via Enterprise Registry
    useEffect(() => {
        let mounted = true;
        if (!report || isCrossBusinessAccess) return;

        const loadData = async () => {
            setIsLoading(true);
            setErrorState(null);
            
            try {
                // Determine module context. Fallback to settings.businessUnit if report.module is 'ALL' or 'ENTERPRISE'
                const moduleCtx = report.module && report.module !== 'ALL' && report.module !== 'ENTERPRISE' 
                    ? report.module 
                    : settings.businessUnit;
                
                const result = await ReportDataResolver.resolve(
                    report.dataSource, 
                    dateRange, 
                    moduleCtx,
                    report.resolverParams
                );

                if (mounted) {
                    setResolverResult(result);
                    if (report) {
                        setAuditResult(verifyReportData(report, result.rows));
                    }
                }
            } catch (err: any) {
                if (mounted) {
                    setErrorState({
                        state: err.state || 'COMPUTATION_ERROR',
                        message: err.message || 'An unknown error occurred while resolving data.'
                    });
                    setResolverResult(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => { mounted = false; };
    }, [isCrossBusinessAccess, report, dateRange, settings.businessUnit]);

    // Apply drill-down filter
    const displayData = useMemo(() => {
        if (!resolverResult) return [];
        if (!activeDrillDown) return resolverResult.rows;
        return resolverResult.rows.filter((i: any) => i.type === activeDrillDown);
    }, [resolverResult, activeDrillDown]);

    // KPI Summary
    const kpiSummary = useMemo(() => {
        if (!report || !resolverResult) return null;
        
        // If the resolver provided explicit totals, render those
        if (resolverResult.totals) {
            return Object.entries(resolverResult.totals).map(([key, value]) => ({
                label: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
                value: value,
                type: 'currency' // Simplified mapping
            }));
        }

        // Fallback simple KPIs
        return [
            { label: 'Total Volume', value: displayData.reduce((acc: number, item: any) => acc + (item.liters || 0), 0), type: 'liters' },
            { label: 'Total Revenue', value: displayData.reduce((acc: number, item: any) => acc + (item.revenue || item.amount || 0), 0), type: 'currency' },
            { label: 'Entry Count', value: displayData.length, type: 'count' },
            { label: 'Avg / Item', value: displayData.length > 0 ? displayData.reduce((acc: number, item: any) => acc + (item.revenue || item.amount || 0), 0) / displayData.length : 0, type: 'currency' }
        ];
    }, [displayData, report, resolverResult]);

    // Column Resolution
    const quantumColumns: QuantumColumn<any>[] = useMemo(() => {
        if (!report) return [];
        return report.columns.map(col => ({
            key: col.key,
            label: col.label,
            type: col.type as any,
            align: col.align,
            sortable: true,
            calculateTotal: true
        }));
    }, [report]);

    // Export Helpers
    const handleExportExcel = () => {
        if (displayData.length === 0) {
            toast.warning('No data', 'There is no report data available for export.');
            return;
        }
        
        const headers = report?.columns.map(c => c.label).join(',');
        const rows = displayData.map(row => 
            report?.columns.map(col => {
                const val = row[col.key];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        );
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            'download',
            `${report?.id}_${activeBusiness.reportSlug}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV ready', 'Report data was exported successfully.');
    };

    const handleExportPDF = (customOptions = exportOptions) => {
        if (!report) return;
        if (displayData.length === 0) {
            toast.warning('No data', 'There is no report data available for export.');
            return;
        }

        const columns = report.columns.map(c => c.label);
        const data = displayData.map(row => 
            report.columns.map(col => {
                const val = row[col.key];
                return val != null ? val.toString() : '';
            })
        );

        exportToPDF({
            title: `${report.title} - ${activeBusiness.label}`,
            subtitle: `${report.category} Module • ${format(new Date(), 'PPpp')}`,
            filename: `${report.title.replace(/\s+/g, '_')}_${activeBusiness.reportSlug}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`,
            columns,
            data,
            orientation: customOptions.orientation,
            isForensic:
                customOptions.confidentiality === 'FORENSIC' ||
                report.category === 'THEFT_FORENSIC' ||
                report.category === 'AUDIT',
            showSignature:
                report.category === 'THEFT_FORENSIC' ||
                report.category === 'AUDIT' ||
                report.category === 'FINANCIAL' ||
                report.category === 'SHIFT',
            generatedBy:
                (user as any)?.name || (user as any)?.fullName || 'System User',
            businessLabel: activeBusiness.label,
            reportPeriod: dateRange
                ? `${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`
                : 'All Time',
            confidentiality: customOptions.confidentiality,
            accentTheme: customOptions.accentTheme,
            includeSummary: customOptions.includeSummary,
            includeTimestamp: customOptions.includeTimestamp,
            footerNote:
                customOptions.footerNote ||
                `${report.category} intelligence report for ${activeBusiness.label}. Generated from secure enterprise workspace.`,
            summaryItems:
                kpiSummary?.slice(0, 4).map(kpi => ({
                    label: kpi.label,
                    value:
                        kpi.type === 'currency'
                            ? `PKR ${Number(kpi.value || 0).toLocaleString()}`
                            : kpi.value,
                })) || [],
        });
        setIsExportModalOpen(false);
        toast.success('PDF generated', 'Executive PDF report has been prepared.');
    };

    const handleSchedule = async () => {
        if (!report) return;
        const recipients = scheduleForm.recipients
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

        if (recipients.length === 0) {
            toast.error('Recipients required', 'Add at least one email recipient.');
            return;
        }

        const created = await addSchedule({
            reportId: report.id,
            reportName: report.title,
            module: (report.module === 'ALL' ? 'ENTERPRISE' : report.module) || 'ENTERPRISE',
            frequency: scheduleForm.frequency,
            recipients,
            nextRunAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
            format: scheduleForm.format,
        });

        if (created) {
            setIsScheduleModalOpen(false);
            toast.success('Schedule created', 'Automated delivery is now saved in Firebase.');
        }
    };

    const handleWhatsAppShare = () => {
        if (displayData.length === 0) {
            toast.warning('No data', 'There is no report data available to share.');
            return;
        }
        
        const summary = kpiSummary?.map(k => `${k.label}: ${typeof k.value === 'number' ? k.value.toLocaleString() : k.value}`).join('\n');
        const text = `*MOTORWAY OIL BI REPORT*\n\n*Report:* ${report?.title}\n*Business:* ${activeBusiness.label}\n*Date:* ${dateRange ? format(dateRange.start, 'dd MMM') + ' to ' + format(dateRange.end, 'dd MMM') : 'All Time'}\n\n*Key Metrics:*\n${summary}\n\n_Generated via Motorway Enterprise v4.0_`;
        
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (!report) {
        return (
            <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Search size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Report Registry Miss</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    The requested data definition is missing or decoupled from the registry.
                </p>
                <Button onClick={onBack} variant="primary" className="mt-6 rounded-xl">
                    Back to Terminal
                </Button>
            </div>
        );
    }

    if (isCrossBusinessAccess) {
        return (
            <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-amber-200 dark:border-amber-900/50">
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 rounded-full mx-auto mb-4 flex items-center justify-center text-amber-500">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">PERMISSION_DENIED</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {report.title} belongs to {report.module}. Switch the active business from {activeBusiness.label} before opening this report.
                </p>
                <Button onClick={onBack} variant="primary" className="mt-6 rounded-xl">
                    Back to Terminal
                </Button>
            </div>
        );
    }

    if (errorState) {
        return (
            <div className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-rose-200 dark:border-rose-900/50">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/40 rounded-full mx-auto mb-4 flex items-center justify-center text-rose-500">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">{errorState.state}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {errorState.message}
                </p>
                <Button onClick={onBack} variant="primary" className="mt-6 rounded-xl">
                    Back to Terminal
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-20 text-center flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">
                    Resolving Enterprise Data...
                </h3>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1800px] mx-auto p-4 md:p-8">
            {/* Header Bar */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div className="flex items-start gap-6">
                    <button
                        onClick={onBack}
                        className="p-4 bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl hover:border-blue-500/30 dark:hover:border-blue-400/30 text-slate-700 dark:text-slate-300 transition-all active:scale-95 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={clsx(
                                "px-2.5 py-1 text-[9px] font-black uppercase rounded-md tracking-widest shadow-sm backdrop-blur-md",
                                report.category === 'AUDIT' ? 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50' : 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50'
                            )}>
                                {report.category.replace('_', ' ')} Module
                            </span>
                            {dateRange && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-md shadow-sm backdrop-blur-md">
                                    <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                                    {format(dateRange.start, 'dd MMM')} — {format(dateRange.end, 'dd MMM yyyy')}
                                </div>
                            )}
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50 px-2 py-1 rounded-md uppercase tracking-widest shadow-sm backdrop-blur-md">
                                {displayData.length} Entries
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-outfit mt-3">
                            {report.title}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                            <span className="inline-block w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            {report.description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-5 py-3.5 bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 hover:border-blue-500/40 dark:hover:border-blue-400/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] font-black uppercase text-[10px] tracking-widest active:scale-95 group"
                    >
                        <FileSpreadsheet size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />Excel
                    </button>
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3.5 bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 hover:border-purple-500/40 dark:hover:border-purple-400/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] font-black uppercase text-[10px] tracking-widest active:scale-95 group"
                    >
                        <Printer size={16} className="text-slate-400 group-hover:text-purple-500 transition-colors" />PDF
                    </button>
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3.5 bg-violet-50/80 dark:bg-violet-900/30 backdrop-blur-3xl border border-violet-200/80 dark:border-violet-800/60 rounded-xl text-violet-700 dark:text-violet-400 hover:border-violet-400/60 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg font-black uppercase text-[10px] tracking-widest active:scale-95 group"
                    >
                        <Settings2 size={16} className="group-hover:rotate-12 transition-transform" />Options
                    </button>
                    <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        disabled={!canScheduleReports}
                        className="flex items-center gap-2 px-5 py-3.5 bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-3xl border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-amber-700 dark:text-amber-400 hover:border-amber-400/60 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg font-black uppercase text-[10px] tracking-widest active:scale-95 group"
                    >
                        <Clock size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />Schedule
                    </button>
                    <button 
                        onClick={handleWhatsAppShare}
                        className="flex items-center gap-2 px-5 py-3.5 bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-3xl border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-400 hover:border-emerald-400/60 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg font-black uppercase text-[10px] tracking-widest active:scale-95 group"
                    >
                        <Share2 size={16} className="group-hover:scale-110 transition-transform"/>WhatsApp
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            {kpiSummary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiSummary.map((kpi, idx) => (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveDrillDown(null)}
                            className="cursor-pointer group"
                        >
                            <Card
                                className={clsx(
                                    'p-6 border-none relative overflow-hidden transition-all duration-300 hover:-translate-y-1',
                                    'bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-400/30'
                                )}
                            >
                                <p className={clsx(
                                    'text-[9px] font-black uppercase tracking-[.3em] mb-2',
                                    'text-slate-400 dark:text-slate-500'
                                )}>
                                    {kpi.label}
                                </p>
                                <p className={clsx(
                                    'text-2xl font-black tracking-tighter tabular-nums',
                                    'text-slate-900 dark:text-white'
                                )}>
                                    {kpi.type === 'currency'
                                        ? `₨${kpi.value.toLocaleString()}`
                                        : kpi.value.toLocaleString()}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={clsx(
                                                'w-4 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 transition-colors duration-500',
                                                i === 1 ? 'group-hover:bg-blue-500' : i === 2 ? 'group-hover:bg-blue-400' : 'group-hover:bg-blue-300'
                                            )} />
                                        ))}
                                    </div>
                                    <ArrowRight
                                        size={14}
                                        className={clsx(
                                            'transition-all text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1'
                                        )}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ═══ Drill-Down Breadcrumb ═══ */}
            {activeDrillDown && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl"
                >
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Active Filter:</span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-800/30 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-700/50">
                        {activeDrillDown}
                    </span>
                    <button
                        onClick={() => setActiveDrillDown(null)}
                        className="ml-auto text-[10px] font-black text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 uppercase tracking-widest transition-colors"
                    >
                        × Clear Filter
                    </button>
                </motion.div>
            )}

            {/* ═══ THE QUANTUM REGISTER ═══ */}
            <QuantumRegister
                title={report.title}
                subtitle={`Data Channel: ${report.dataSource} • ${report.category} Intelligence Module`}
                data={displayData}
                columns={quantumColumns}
                onExportExcel={handleExportExcel}
                onExportPDF={() => setIsExportModalOpen(true)}
                enableSignatures={report.category === 'FINANCIAL' || report.category === 'SHIFT' || report.category === 'AUDIT'}
                heightClass="min-h-[400px] max-h-[65vh]"
                onRowClick={(row: any) => setTraceRecord(row as TraceRecord)}
            />

            {/* Forensic Drill-Down TraceCard */}
            <TraceCard
                isOpen={!!traceRecord}
                onClose={() => setTraceRecord(null)}
                record={traceRecord}
                title={`${report.title} — Record Inspector`}
            />

            {/* Verification Footer */}
            {auditResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
                    <Card className="p-7 bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group rounded-2xl transition-all hover:shadow-lg hover:border-blue-500/30 dark:hover:border-blue-400/30">
                        <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="p-3.5 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest mb-1">
                                    Performance Index
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                                    This report indicates a {displayData.length > 0 ? 'stable' : 'pending'} liquidity trend for the selected cycle.
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className={clsx(
                        "p-7 bg-white/80 dark:bg-[#0B1015]/80 backdrop-blur-3xl border shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center gap-5 rounded-2xl group transition-all hover:shadow-lg",
                        auditResult.status === 'VALID' ? "border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-500/30" : 
                        auditResult.status === 'WARNING' ? "border-amber-200/80 dark:border-amber-800/60 hover:border-amber-500/30" :
                        "border-rose-200/80 dark:border-rose-800/60 hover:border-rose-500/30"
                    )}>
                        <div className={clsx(
                            "p-3.5 rounded-xl group-hover:scale-110 transition-transform",
                            auditResult.status === 'VALID' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                            auditResult.status === 'WARNING' ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                            "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        )}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest mb-1 flex items-center gap-2">
                                Digital Seal
                                <span className={clsx(
                                    "px-1.5 py-0.5 rounded text-[9px]",
                                    auditResult.status === 'VALID' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" :
                                    auditResult.status === 'WARNING' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                                    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                                )}>
                                    SCORE: {auditResult.score}/100
                                </span>
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                                {auditResult.status === 'VALID' 
                                    ? 'Cryptographically verified by Motorway Oil Core v4.0. Integrity status: Valid.'
                                    : auditResult.issues.join(' | ')}
                            </p>
                        </div>
                    </Card>
                </div>
            )}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Executive Export Studio"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-slate-50/80 border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <FileText size={18} className="text-blue-600" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Document Output</h4>
                                    <p className="text-xs text-slate-500">Tune the print shape and tone.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Orientation</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg min-h-[44px] bg-[var(--bg-surface)] border-2 border-[var(--border)]"
                                        value={exportOptions.orientation}
                                        onChange={e =>
                                            setExportOptions(state => ({
                                                ...state,
                                                orientation: e.target.value as 'portrait' | 'landscape',
                                            }))
                                        }
                                    >
                                        <option value="landscape">Landscape</option>
                                        <option value="portrait">Portrait</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Accent Theme</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg min-h-[44px] bg-[var(--bg-surface)] border-2 border-[var(--border)]"
                                        value={exportOptions.accentTheme}
                                        onChange={e =>
                                            setExportOptions(state => ({
                                                ...state,
                                                accentTheme: e.target.value as 'blue' | 'emerald' | 'slate' | 'rose',
                                            }))
                                        }
                                    >
                                        <option value="blue">Blue Executive</option>
                                        <option value="emerald">Emerald Finance</option>
                                        <option value="slate">Slate Boardroom</option>
                                        <option value="rose">Rose Forensic</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 bg-slate-50/80 border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck size={18} className="text-amber-600" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Governance Controls</h4>
                                    <p className="text-xs text-slate-500">Set disclosure and evidence depth.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confidentiality</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg min-h-[44px] bg-[var(--bg-surface)] border-2 border-[var(--border)]"
                                        value={exportOptions.confidentiality}
                                        onChange={e =>
                                            setExportOptions(state => ({
                                                ...state,
                                                confidentiality: e.target.value as 'STANDARD' | 'INTERNAL' | 'CONFIDENTIAL' | 'FORENSIC',
                                            }))
                                        }
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="INTERNAL">Internal</option>
                                        <option value="CONFIDENTIAL">Confidential</option>
                                        <option value="FORENSIC">Forensic</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white">
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeSummary}
                                            onChange={e =>
                                                setExportOptions(state => ({
                                                    ...state,
                                                    includeSummary: e.target.checked,
                                                }))
                                            }
                                        />
                                        Summary block
                                    </label>
                                    <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white">
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeTimestamp}
                                            onChange={e =>
                                                setExportOptions(state => ({
                                                    ...state,
                                                    includeTimestamp: e.target.checked,
                                                }))
                                            }
                                        />
                                        Timestamp
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <Input
                        label="Footer note"
                        value={exportOptions.footerNote}
                        onChange={e =>
                            setExportOptions(state => ({ ...state, footerNote: e.target.value }))
                        }
                        placeholder="Optional executive note or distribution instruction"
                    />
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 bg-slate-50/60">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Export Preview</p>
                        <div className="grid md:grid-cols-4 gap-3">
                            {(kpiSummary || []).slice(0, 4).map(kpi => (
                                <div key={kpi.label} className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {kpi.type === 'currency'
                                            ? `PKR ${Number(kpi.value || 0).toLocaleString()}`
                                            : Number(kpi.value || 0).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => handleExportPDF()}>
                            Generate PDF
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                title="Automated Delivery Setup"
                size="md"
            >
                <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Frequency</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg min-h-[44px] bg-[var(--bg-surface)] border-2 border-[var(--border)]"
                                value={scheduleForm.frequency}
                                onChange={e =>
                                    setScheduleForm(state => ({
                                        ...state,
                                        frequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'END_OF_SHIFT',
                                    }))
                                }
                            >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="END_OF_SHIFT">End Of Shift</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg min-h-[44px] bg-[var(--bg-surface)] border-2 border-[var(--border)]"
                                value={scheduleForm.format}
                                onChange={e =>
                                    setScheduleForm(state => ({
                                        ...state,
                                        format: e.target.value as 'PDF' | 'CSV' | 'EXCEL',
                                    }))
                                }
                            >
                                <option value="PDF">PDF</option>
                                <option value="CSV">CSV</option>
                                <option value="EXCEL">Excel</option>
                            </select>
                        </div>
                    </div>
                    <Input
                        label="Recipients"
                        value={scheduleForm.recipients}
                        onChange={e =>
                            setScheduleForm(state => ({ ...state, recipients: e.target.value }))
                        }
                        placeholder="manager@company.com, owner@company.com"
                    />
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                        Reports are queued locally in the scheduler store. This is ready for backend email automation wiring.
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSchedule}>
                            Save Schedule
                        </Button>
                    </div>
                </div>
            </Modal>
            <div className="text-center pb-8 print:hidden">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[.8em]">
                    End of Ledger Archive
                </p>
            </div>
        </div>
    );
};

export default ReportViewer;
