import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Droplets,
    Flame,
    Lock,
    Receipt,
    RotateCcw,
    Share2,
    ShieldCheck,
    Smartphone,
    TrendingDown,
    TrendingUp,
    Zap,
} from 'lucide-react';
import React, { useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';

const item = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 240, damping: 26 },
    },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function fmt(n: number, dec = 2) {
    return n.toLocaleString('en-PK', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtShort(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return fmt(n, 0);
}

const FUEL_LABELS: Record<string, string> = {
    PETROL_92: 'Petrol 92',
    PETROL_95: 'Petrol 95',
    DIESEL: 'Diesel',
    HSD: 'HSD',
    CNG: 'CNG',
};
const FUEL_COLORS: Record<string, string> = {
    PETROL_92: '#f59e0b',
    PETROL_95: '#f97316',
    DIESEL: '#22d3ee',
    HSD: '#a78bfa',
    CNG: '#34d399',
};

export const StepAudit: React.FC<StepProps> = ({ data, mode }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const readings = data?.readings || [];
    const transactions = data?.transactions || [];

    const totalRevenue = readings.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalLiters = readings.reduce((s, r) => s + (r.netLiters || 0), 0);
    const totalCost = readings.reduce((s, r) => s + (r.costPrice || 0) * (r.netLiters || 0), 0);
    const grossProfit = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const credits = transactions
        .filter((t: any) => t.type === 'CREDIT_SALE')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const recoveries = transactions
        .filter((t: any) => t.type === 'RECOVERY')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const expenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const digital = transactions
        .filter((t: any) => t.type === 'DIGITAL_PAYMENT')
        .reduce((s: number, t: any) => s + t.amount, 0);

    const expectedCash = totalRevenue - credits + recoveries - expenses - digital;
    const actualCash = data?.actualCash ?? 0;
    const variance = actualCash - expectedCash;
    const isBalanced = Math.abs(variance) < 100;

    const shiftId = `SHF-${mode}-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Group readings by fuel type for bar chart section
    const byFuel = readings.reduce<
        Record<string, { liters: number; revenue: number; nozzles: number }>
    >((acc, r) => {
        if (!acc[r.fuelType]) acc[r.fuelType] = { liters: 0, revenue: 0, nozzles: 0 };
        acc[r.fuelType].liters += r.netLiters || 0;
        acc[r.fuelType].revenue += r.revenue || 0;
        acc[r.fuelType].nozzles += 1;
        return acc;
    }, {});

    const maxLiters = Math.max(...Object.values(byFuel).map(v => v.liters), 1);
    const maxRevenue = Math.max(...Object.values(byFuel).map(v => v.revenue), 1);

    // ── PDF / Print ────────────────────────────────────────────────────────────
    const handlePrint = () => {
        const el = printRef.current;
        if (!el) return;
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head>
            <title>Shift Report — ${shiftId}</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family: system-ui, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 32px; }
                h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
                h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin: 20px 0 8px; color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; }
                table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
                th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
                td { padding: 6px 8px; border-bottom: 1px solid #f9fafb; font-weight: 600; }
                .badge { display:inline-block; padding: 2px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
                .badge-green { background: #d1fae5; color: #059669; }
                .badge-red { background: #fee2e2; color: #dc2626; }
                .badge-blue { background: #e0e7ff; color: #4f46e5; }
                .kpi { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0; }
                .kpi-card { flex: 1; min-width: 120px; background: #f9fafb; border-radius: 10px; padding: 14px; }
                .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 4px; }
                .kpi-value { font-size: 20px; font-weight: 900; color: #111; }
                .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 12px; display: flex; justify-content: space-between; }
            </style>
        </head><body>
            <h1>Shift Closing Report</h1>
            <p style="color:#6b7280; font-size:11px">${mode} Protocol &nbsp;|&nbsp; ${shiftId} &nbsp;|&nbsp; ${data?.staffName || '—'} &nbsp;|&nbsp; ${data?.shiftType || '—'} &nbsp;|&nbsp; ${data?.startTime ? new Date(data.startTime).toLocaleString() : '—'}</p>
            <div class="kpi">
                <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value">&#8360; ${fmt(totalRevenue)}</div></div>
                <div class="kpi-card"><div class="kpi-label">Volume Sold</div><div class="kpi-value">${fmt(totalLiters)} L</div></div>
                <div class="kpi-card"><div class="kpi-label">Gross Profit</div><div class="kpi-value">&#8360; ${fmt(grossProfit)}</div></div>
                <div class="kpi-card"><div class="kpi-label">Margin</div><div class="kpi-value">${marginPct.toFixed(1)}%</div></div>
                <div class="kpi-card"><div class="kpi-label">Cash Balance</div><div class="kpi-value"><span class="badge ${isBalanced ? 'badge-green' : 'badge-red'}">${isBalanced ? 'OK' : 'GAP'}</span></div></div>
            </div>
            <h2>Fuel Telemetry</h2>
            <table><thead><tr><th>Nozzle</th><th>Fuel Type</th><th>Opening</th><th>Closing</th><th>Net (L)</th><th>Rate</th><th>Revenue</th></tr></thead><tbody>
            ${readings.map(r => `<tr><td>${r.nozzleName}</td><td>${FUEL_LABELS[r.fuelType] || r.fuelType}</td><td>${fmt(r.opening)}</td><td>${fmt(r.closing || 0)}</td><td style="color:#059669;font-weight:900">${fmt(r.netLiters || 0)}</td><td>&#8360; ${r.rate}</td><td style="font-weight:900">&#8360; ${fmt(r.revenue || 0)}</td></tr>`).join('')}
            </tbody></table>
            <h2>Financial Summary</h2>
            <table><thead><tr><th>Category</th><th>Amount (&#8360;)</th></tr></thead><tbody>
                <tr><td>Credit Sales</td><td>&#8360; ${fmt(credits)}</td></tr>
                <tr><td>Recoveries</td><td>&#8360; ${fmt(recoveries)}</td></tr>
                <tr><td>Expenses</td><td>&#8360; ${fmt(expenses)}</td></tr>
                <tr><td>Digital Payments</td><td>&#8360; ${fmt(digital)}</td></tr>
            </tbody></table>
            <h2>Cash Reconciliation</h2>
            <table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>
                <tr><td>Expected Cash</td><td><strong>&#8360; ${fmt(expectedCash)}</strong></td></tr>
                <tr><td>Physical Count</td><td><strong>&#8360; ${fmt(actualCash)}</strong></td></tr>
                <tr><td>Variance</td><td><strong style="color:${isBalanced ? '#059669' : '#dc2626'}">&#8360; ${fmt(variance)}</strong></td></tr>
            </tbody></table>
            <div class="footer"><span>Generated: ${new Date().toLocaleString()}</span><span>Motorway Oil — Enterprise Edition</span></div>
        </body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => {
            w.print();
        }, 400);
    };

    // ── Share via navigator.share ────────────────────────────────────────────
    const handleShare = async () => {
        const text =
            `Shift Report — ${shiftId}\n` +
            `Operator: ${data?.staffName || '—'} | ${data?.shiftType} | ${mode}\n` +
            `Revenue: ₨ ${fmt(totalRevenue)} | Volume: ${fmt(totalLiters)} L\n` +
            `Profit: ₨ ${fmt(grossProfit)} (${marginPct.toFixed(1)}%)\n` +
            `Cash: ${isBalanced ? '✅ Balanced' : `⚠️ Variance ₨ ${fmt(variance)}`}`;
        if (navigator.share) {
            await navigator.share({ title: `Shift Report ${shiftId}`, text });
        } else {
            await navigator.clipboard.writeText(text);
            toast.success('Shift summary copied to clipboard!');
        }
    };

    return (
        <motion.div
            ref={printRef}
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4 py-3"
        >
            {/* ── HEADER CARD ── */}
            <motion.div
                variants={item}
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0891b2 100%)',
                }}
            >
                {/* Noise overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
                        backgroundSize: '120px',
                    }}
                />

                <div className="relative flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={16} className="text-white/70" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                Shift Audit Report
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                            {data?.staffName || 'Operator'}
                        </h2>
                        <p className="text-sm text-white/60 mt-1 font-medium">
                            {data?.shiftType} Shift &nbsp;·&nbsp;{' '}
                            {data?.startTime
                                ? new Date(data.startTime).toLocaleDateString('en-PK', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                  })
                                : '—'}
                        </p>
                        <p className="text-xs font-mono text-white/40 mt-2">{shiftId}</p>
                    </div>

                    {/* Status badge */}
                    <div
                        className={clsx(
                            'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm',
                            isBalanced
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-red-500/30 text-red-100 border border-red-400/40'
                        )}
                    >
                        {isBalanced ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {isBalanced ? 'Balanced' : 'Variance'}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="relative flex gap-2 mt-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-all backdrop-blur-sm"
                    >
                        <Download size={12} /> PDF / Print
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white/15 text-white hover:bg-white/25 border border-white/20 transition-all backdrop-blur-sm"
                    >
                        <Share2 size={12} /> Share
                    </button>
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white/50 bg-white/5 border border-white/10">
                        <Lock size={10} />
                        <span>{mode}</span>
                    </div>
                </div>
            </motion.div>

            {/* ── KPI ROW ── */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                    {
                        label: 'Revenue',
                        value: '₨ ' + fmtShort(totalRevenue),
                        fullValue: '₨ ' + fmt(totalRevenue),
                        icon: TrendingUp,
                        color: '#10b981',
                        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                        text: 'text-emerald-700 dark:text-emerald-400',
                        border: 'border-emerald-200 dark:border-emerald-500/20',
                    },
                    {
                        label: 'Volume',
                        value: fmtShort(totalLiters) + ' L',
                        fullValue: fmt(totalLiters) + ' L',
                        icon: Droplets,
                        color: '#22d3ee',
                        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
                        text: 'text-cyan-700 dark:text-cyan-400',
                        border: 'border-cyan-200 dark:border-cyan-500/20',
                    },
                    {
                        label: 'Profit',
                        value: '₨ ' + fmtShort(grossProfit),
                        fullValue: '₨ ' + fmt(grossProfit),
                        icon: Flame,
                        color: '#8b5cf6',
                        bg: 'bg-violet-50 dark:bg-violet-500/10',
                        text: 'text-violet-700 dark:text-violet-400',
                        border: 'border-violet-200 dark:border-violet-500/20',
                    },
                    {
                        label: 'Margin',
                        value: marginPct.toFixed(1) + '%',
                        fullValue: marginPct.toFixed(2) + '%',
                        icon: BarChart3,
                        color: '#f59e0b',
                        bg: 'bg-amber-50 dark:bg-amber-500/10',
                        text: 'text-amber-700 dark:text-amber-400',
                        border: 'border-amber-200 dark:border-amber-500/20',
                    },
                ].map(k => (
                    <motion.div
                        key={k.label}
                        whileHover={{ scale: 1.04, y: -3 }}
                        className={clsx(
                            'relative overflow-hidden rounded-2xl p-5 border group cursor-default',
                            k.bg,
                            k.border
                        )}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                            style={{ background: `${k.color}18` }}
                        >
                            <k.icon size={18} style={{ color: k.color }} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                            {k.label}
                        </p>
                        <p
                            className={clsx(
                                'text-2xl font-black font-mono tracking-tight mt-1',
                                k.text
                            )}
                            title={k.fullValue}
                        >
                            {k.value}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── FUEL BREAKDOWN (Visual bars) ── */}
            {Object.keys(byFuel).length > 0 && (
                <motion.div
                    variants={item}
                    className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]"
                >
                    <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                            <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Fuel Telemetry Breakdown
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                        {Object.entries(byFuel).map(([ft, vals]) => {
                            const color = FUEL_COLORS[ft] || '#6366f1';
                            const literPct = (vals.liters / maxLiters) * 100;
                            const revPct = (vals.revenue / maxRevenue) * 100;
                            return (
                                <div key={ft} className="px-4 py-3.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: color }}
                                            />
                                            <span className="text-base font-black text-gray-800 dark:text-white">
                                                {FUEL_LABELS[ft] || ft}
                                            </span>
                                            <span className="text-xs font-mono px-2 py-0.5 rounded-lg text-gray-400 dark:text-slate-600 bg-gray-100 dark:bg-white/[0.05] font-semibold">
                                                {vals.nozzles} nozzle{vals.nozzles > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black font-mono text-gray-800 dark:text-white">
                                                ₨ {fmt(vals.revenue, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Volume bar */}
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] text-gray-400 dark:text-slate-600 w-12 text-right font-mono shrink-0">
                                            {fmt(vals.liters, 0)} L
                                        </span>
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                                }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${literPct}%` }}
                                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 w-8 shrink-0">
                                            Vol.
                                        </span>
                                    </div>
                                    {/* Revenue bar */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-400 dark:text-slate-600 w-12 text-right font-mono shrink-0">
                                            {fmtShort(vals.revenue)}
                                        </span>
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{
                                                    background:
                                                        'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                                }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${revPct}%` }}
                                                transition={{
                                                    duration: 0.9,
                                                    ease: 'easeOut',
                                                    delay: 0.1,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 w-8 shrink-0">
                                            Rev.
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── NOZZLE TABLE ── */}
            {readings.length > 0 && (
                <motion.div
                    variants={item}
                    className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]"
                >
                    <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                            <Zap size={14} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                            Nozzle Detail
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/[0.07] bg-gray-50/80 dark:bg-white/[0.02]">
                                    {[
                                        'Nozzle',
                                        'Fuel',
                                        'Opening',
                                        'Closing',
                                        'Net (L)',
                                        'Rate',
                                        'Revenue',
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {readings.map((r, i) => {
                                    const color = FUEL_COLORS[r.fuelType] || '#6366f1';
                                    const net = r.netLiters || 0;
                                    return (
                                        <tr
                                            key={r.nozzleId}
                                            className={clsx(
                                                'border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors',
                                                i === readings.length - 1 && 'border-0'
                                            )}
                                        >
                                            <td className="px-5 py-4 text-base font-black text-gray-900 dark:text-white whitespace-nowrap">
                                                {r.nozzleName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase"
                                                    style={{
                                                        background: `${color}15`,
                                                        color,
                                                        border: `1px solid ${color}30`,
                                                    }}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ background: color }}
                                                    />
                                                    {FUEL_LABELS[r.fuelType] || r.fuelType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-500">
                                                {fmt(r.opening)}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-gray-700 dark:text-slate-300 font-black">
                                                {fmt(r.closing || 0)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={clsx(
                                                        'inline-block px-2 py-0.5 rounded-lg font-black font-mono text-[11px]',
                                                        net > 0
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-white/[0.05] dark:text-slate-600'
                                                    )}
                                                >
                                                    {fmt(net)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-400">
                                                ₨ {r.rate}
                                            </td>
                                            <td className="px-4 py-3 font-black font-mono text-indigo-600 dark:text-indigo-400">
                                                ₨ {fmt(r.revenue || 0, 0)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ── FINANCIALS SIDE BY SIDE ── */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Transactions */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                        <Receipt size={13} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
                            Financials
                        </span>
                    </div>
                    {[
                        {
                            label: 'Credit Sales',
                            value: credits,
                            icon: CreditCard,
                            color: '#f59e0b',
                            dir: 'out',
                        },
                        {
                            label: 'Recoveries',
                            value: recoveries,
                            icon: RotateCcw,
                            color: '#10b981',
                            dir: 'in',
                        },
                        {
                            label: 'Expenses',
                            value: expenses,
                            icon: Receipt,
                            color: '#f87171',
                            dir: 'out',
                        },
                        {
                            label: 'Digital Pay',
                            value: digital,
                            icon: Smartphone,
                            color: '#a78bfa',
                            dir: 'out',
                        },
                    ].map(row => (
                        <div
                            key={row.label}
                            className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                <row.icon size={12} style={{ color: row.color }} />
                                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                                    {row.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {row.dir === 'out' ? (
                                    <TrendingDown size={10} className="text-red-400" />
                                ) : (
                                    <TrendingUp size={10} className="text-emerald-400" />
                                )}
                                <span
                                    className="text-xs font-black font-mono"
                                    style={{ color: row.color }}
                                >
                                    ₨ {fmt(row.value, 0)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cash reconc */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/[0.06]">
                        <DollarSign size={13} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            Cash Recon
                        </span>
                    </div>
                    {[
                        { label: 'Expected Cash', value: expectedCash, color: '#6366f1' },
                        { label: 'Actual Physical', value: actualCash, color: '#10b981' },
                    ].map(row => (
                        <div
                            key={row.label}
                            className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-white/[0.04]"
                        >
                            <span className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                                {row.label}
                            </span>
                            <span
                                className="text-xs font-black font-mono"
                                style={{ color: row.color }}
                            >
                                ₨ {fmt(row.value, 0)}
                            </span>
                        </div>
                    ))}
                    {/* Variance big */}
                    <div
                        className={clsx(
                            'px-4 py-3 flex items-center justify-between',
                            isBalanced
                                ? 'bg-emerald-50 dark:bg-emerald-500/10'
                                : variance > 0
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'bg-red-50 dark:bg-red-500/10'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {isBalanced ? (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            ) : (
                                <AlertTriangle
                                    size={14}
                                    className={variance > 0 ? 'text-indigo-500' : 'text-red-500'}
                                />
                            )}
                            <span className="text-xs font-black text-gray-800 dark:text-white">
                                Variance
                            </span>
                        </div>
                        <div className="text-right">
                            <p
                                className={clsx(
                                    'text-base font-black font-mono',
                                    isBalanced
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : variance > 0
                                          ? 'text-indigo-600 dark:text-indigo-400'
                                          : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {variance > 0 ? '+' : ''}₨ {fmt(variance, 0)}
                            </p>
                            <p className="text-[9px] text-gray-400 dark:text-slate-600 font-mono">
                                {isBalanced
                                    ? '✓ Balanced'
                                    : `${((Math.abs(variance) / (expectedCash || 1)) * 100).toFixed(2)}% gap`}
                            </p>
                        </div>
                    </div>
                    {/* Variance bar */}
                    <div className="px-4 pb-3 pt-1">
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    background: isBalanced
                                        ? 'linear-gradient(90deg,#10b981,#34d399)'
                                        : variance > 0
                                          ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                          : 'linear-gradient(90deg,#ef4444,#f87171)',
                                }}
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(100, (Math.abs(variance) / (expectedCash || 1)) * 5 * 100)}%`,
                                }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── FOOTER INFO ── */}
            <motion.div
                variants={item}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02]"
            >
                <Clock size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600">
                        Shift Details
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mt-0.5 truncate">
                        {mode} &nbsp;·&nbsp; {data?.shiftType} &nbsp;·&nbsp; {data?.staffName}{' '}
                        &nbsp;·&nbsp;{' '}
                        {data?.startTime ? new Date(data.startTime).toLocaleString() : '—'}
                    </p>
                </div>
                <div className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <span className="text-[9px] font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {shiftId}
                    </span>
                </div>
            </motion.div>

            {/* ── COMMIT READY BANNER ── */}
            <motion.div
                variants={item}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
            >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                        Ready to Commit
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-600 font-medium mt-0.5">
                        Click "Commit Shift" to finalize, lock, and post this shift to all ledgers.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
