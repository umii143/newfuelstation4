import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useCNGStore } from '@/stores/cngStore';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    Gauge,
    Info,
    RefreshCw,
} from 'lucide-react';
import React from 'react';

export const CNGBanksPage: React.FC = () => {
    const { cascades, compressors } = useCNGStore();

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Cascades & Banks"
                subtitle="Real-time pressure monitoring and storage management for CNG"
                actions={
                    <Button variant="secondary" className="gap-2">
                        <RefreshCw size={18} /> Refresh Data
                    </Button>
                }
            />

            {/* Compressor Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {compressors.map(comp => (
                    <Card
                        key={comp.compressorId}
                        className="md:col-span-3 p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-primary shadow-2xl border border-white/10 ring-1 ring-white/20">
                                    <Activity size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-1">{comp.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <Badge color="emerald" className="animate-pulse">
                                            {comp.status}
                                        </Badge>
                                        <span className="text-sm text-white/50 font-medium">
                                            ID: {comp.compressorId}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-12 items-center">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                        Operating Hours
                                    </p>
                                    <p className="text-2xl font-black">{comp.operatingHours}h</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                        Temperature
                                    </p>
                                    <p className="text-2xl font-black text-rose-400">
                                        {comp.temperature}°C
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                        Next Service
                                    </p>
                                    <p className="text-2xl font-black text-amber-400">
                                        {comp.nextMaintenanceHours - comp.operatingHours}h
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Cascade Banks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {cascades.map((bank, index) => (
                    <motion.div
                        key={bank.bankId}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="group p-8 bg-white/40 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                            {/* Visual Progress Background */}
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-all duration-1000"
                                style={{ width: `${(bank.pressure / bank.maxPressure) * 100}%` }}
                            />

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/50 border border-white/50 shadow-inner flex items-center justify-center text-primary">
                                        <Database size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{bank.name}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                                            Bank ID: {bank.bankId}
                                        </p>
                                    </div>
                                </div>
                                <Badge color={bank.status === 'DISPENSING' ? 'blue' : ('slate' as any)}>
                                    {bank.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {/* Pressure Gauge Visual */}
                                <div className="relative flex justify-center py-4">
                                    <div className="w-40 h-40 rounded-full border-[12px] border-slate-100 flex items-center justify-center relative">
                                        {/* Dynamic Pressure Arc (CSS based) */}
                                        <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
                                            <circle
                                                cx="50%"
                                                cy="50%"
                                                r="45%"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                strokeDasharray="283"
                                                strokeDashoffset={
                                                    283 -
                                                    (283 *
                                                        ((bank.pressure / bank.maxPressure) *
                                                            100)) /
                                                        100
                                                }
                                                className="text-primary opacity-20"
                                            />
                                        </svg>
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-primary leading-none">
                                                {bank.pressure}
                                            </p>
                                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">
                                                Bar
                                            </p>
                                        </div>
                                    </div>
                                    <Gauge
                                        className="absolute bottom-0 right-4 text-primary opacity-20"
                                        size={48}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                                            <span>STORAGE CAPACITY</span>
                                            <span>
                                                {((bank.pressure / bank.maxPressure) * 100).toFixed(
                                                    1
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(bank.pressure / bank.maxPressure) * 100}%`,
                                                }}
                                                className="h-full bg-gradient-to-r from-primary to-blue-400"
                                            />
                                        </div>
                                        <p className="text-[10px] text-center opacity-40">
                                            Max Pressure: {bank.maxPressure} Bar
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            className="flex-1 h-12 shadow-lg shadow-primary/20"
                                        >
                                            Select Bank
                                        </Button>
                                        <Button variant="secondary" className="h-12 w-12 p-0">
                                            <Info size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Safety Alerts */}
            <Card className="p-6 bg-rose-500/5 border-rose-500/20 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-rose-700 mb-1">
                            Safety Protocols & Pressure Thresholds
                        </h4>
                        <p className="text-sm text-rose-600/80 leading-relaxed max-w-3xl">
                            All cascade banks must be manually verified every 4 hours. If pressure
                            exceeds 250 Bar, the safety release valves should trigger automatically.
                            Always ensure the compressor temperature remains below 60°C during
                            active filling periods.
                        </p>
                        <div className="mt-4 flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                                <CheckCircle2 size={14} /> System Verified: 20 min ago
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                                <Info size={14} /> Last Calibration: Feb 01
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
