import { Badge, Button, Card, Input, PageHeader } from '@/components/ui';
import { useCNGStore } from '@/stores/cngStore';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    History,
    Plus,
    Save,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';

export const CNGRatesPage: React.FC = () => {
    const { nozzles } = useCNGStore();
    const currentRate = nozzles[0]?.rate || 220;
    const [newRate, setNewRate] = useState(currentRate.toString());
    const [reason, setReason] = useState('');

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);

    // Mock history based on shifts and some manual entries
    const rateHistory = [
        {
            id: 'RH-001',
            date: '2026-02-05',
            oldRate: 215,
            newRate: 220,
            changedBy: 'Usman Manager',
            reason: 'Market Adjustment',
        },
        {
            id: 'RH-002',
            date: '2026-01-28',
            oldRate: 210,
            newRate: 215,
            changedBy: 'Usman Manager',
            reason: 'Inflation Sync',
        },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Rate Management"
                subtitle="Manage CNG prices and view historical rate changes"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Rate Card */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="p-8 bg-gradient-to-br from-primary to-primary-focus text-white shadow-2xl relative overflow-hidden border-none text-center">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">
                                    Current Market Rate
                                </p>
                                <h2 className="text-6xl font-black mb-4">
                                    {formatCurrency(currentRate)}
                                    <span className="text-2xl font-normal opacity-70 ml-1">
                                        /KG
                                    </span>
                                </h2>
                                <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold">
                                    <TrendingUp size={20} />
                                    <span>+2.3% from last week</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <Card className="mt-8 p-6 bg-white/40 backdrop-blur-xl border-white/20 shadow-xl space-y-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Plus size={18} className="text-primary" /> Update Price
                        </h3>
                        <div className="space-y-4">
                            <Input
                                label="New Rate per KG"
                                type="number"
                                value={newRate}
                                onChange={e => setNewRate(e.target.value)}
                                className="text-2xl font-bold h-14"
                            />
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Reason for Change
                                </label>
                                <textarea
                                    className="w-full p-4 rounded-2xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm min-h-[100px]"
                                    placeholder="e.g., OGRA Notification #1234..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="primary"
                                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                                onClick={() => {
                                    // Handle rate update
                                    setReason('');
                                }}
                            >
                                <Save className="mr-2" /> Apply New Rate
                            </Button>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                            <AlertCircle className="text-amber-600 shrink-0" size={20} />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                Changing the rate will affect all active shifts and will be recorded
                                in the audit log for regulatory compliance.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* History Column */}
                <div className="lg:col-span-2">
                    <Card className="h-full bg-white/40 backdrop-blur-xl border-white/20 shadow-xl flex flex-col p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/30 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-primary">
                                <History size={20} /> Change History
                            </h3>
                            <Button variant="secondary" className="h-8 text-xs">
                                View Full Log
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[var(--bg-active)] text-[10px] uppercase font-bold text-[var(--text-secondary)] sticky top-0">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4 text-center">Price Action</th>
                                        <th className="p-4">Authorized By</th>
                                        <th className="p-4">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/20">
                                    {rateHistory.map((h, index) => (
                                        <motion.tr
                                            key={h.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="hover:bg-white/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <p className="font-bold text-sm">{h.date}</p>
                                                <p className="text-[10px] text-[var(--text-secondary)]">
                                                    10:45 AM
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-xs font-mono opacity-50">
                                                        {h.oldRate}
                                                    </span>
                                                    <ArrowRight size={14} className="opacity-30" />
                                                    <span className="font-black text-primary">
                                                        {h.newRate}
                                                    </span>
                                                    <Badge
                                                        color={
                                                            h.newRate > h.oldRate
                                                                ? 'rose'
                                                                : 'emerald'
                                                        }
                                                        className="text-[8px] px-1 h-4"
                                                    >
                                                        {h.newRate > h.oldRate ? (
                                                            <TrendingUp size={10} />
                                                        ) : (
                                                            <TrendingDown size={10} />
                                                        )}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {h.changedBy.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-bold whitespace-nowrap">
                                                        {h.changedBy}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs opacity-70 line-clamp-1 italic">
                                                    "{h.reason}"
                                                </p>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
