import { Button, Card, Input, PageHeader } from '@/components/ui';
import { useSettingsStore } from '@/stores/authStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    CheckCircle,
    Database,
    Gauge,
    Info,
    MapPin,
    Percent,
    Phone,
    Plus,
    Receipt,
    Save,
    ShieldCheck,
    Smartphone,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

export const CNGSettingsPage: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettingsStore();

    // Meter Management State
    const [meterIds, setMeterIds] = useState<string[]>((settings as any).cngMeterIds || ['M1', 'M2', 'M3']);
    const [newMeterId, setNewMeterId] = useState('');

    const handleAddMeter = () => {
        if (newMeterId && !meterIds.includes(newMeterId)) {
            const updated = [...meterIds, newMeterId];
            setMeterIds(updated);
            updateSettings({ cngMeterIds: updated });
            setNewMeterId('');
        }
    };

    const handleRemoveMeter = (id: string) => {
        const updated = meterIds.filter(m => m !== id);
        setMeterIds(updated);
        updateSettings({ cngMeterIds: updated });
    };

    const handleTaxToggle = (enabled: boolean) => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, enabled },
        });
    };

    const handleTaxModeChange = (mode: 'INCLUSIVE' | 'EXCLUSIVE') => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, mode },
        });
    };

    const handleDefaultTaxRateChange = (rate: number) => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, defaultRate: rate },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <PageHeader
                    title="CNG Operational Hub"
                    subtitle="Strategic configuration for fiscal controls and dispensing units"
                />
                <div className="flex items-center gap-3 p-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-blue-500/5">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            System Status
                        </p>
                        <p className="text-xs font-bold text-slate-800">Verified & Secure</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Fiscal Control Hub (Tax Configuration) */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700 blur-2xl" />

                    <div className="flex items-center gap-5 mb-8 relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Receipt size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Fiscal Control Center
                            </h3>
                            <p className="text-xs font-medium text-slate-500">
                                Automated CNG taxation & pricing compliance
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Taxation Toggle */}
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between transition-all hover:shadow-lg hover:shadow-slate-200/50">
                            <div>
                                <p className="text-base font-bold text-slate-800 mb-1">
                                    Tax Calculation Engine
                                </p>
                                <p className="text-[10px] font-medium text-slate-500">
                                    Global toggle for CNG transactional tax processing
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    handleTaxToggle(!(settings?.taxConfig?.enabled ?? true))
                                }
                                className={clsx(
                                    'w-16 h-8 rounded-full transition-all relative p-1 duration-500',
                                    (settings?.taxConfig?.enabled ?? true)
                                        ? 'bg-blue-600'
                                        : 'bg-slate-300'
                                )}
                            >
                                <motion.div
                                    animate={{ x: (settings?.taxConfig?.enabled ?? true) ? 32 : 0 }}
                                    className="w-6 h-6 bg-white rounded-full shadow-md transition-transform"
                                />
                            </button>
                        </div>

                        <AnimatePresence>
                            {(settings?.taxConfig?.enabled ?? true) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                            Taxation Architecture
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                {
                                                    id: 'EXCLUSIVE',
                                                    label: 'Exclusive Strategy',
                                                    sub: 'Tax added to base rate',
                                                },
                                                {
                                                    id: 'INCLUSIVE',
                                                    label: 'Inclusive Strategy',
                                                    sub: 'Tax built into base rate',
                                                },
                                            ].map(mode => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() =>
                                                        handleTaxModeChange(
                                                            mode.id as 'INCLUSIVE' | 'EXCLUSIVE'
                                                        )
                                                    }
                                                    className={clsx(
                                                        'p-5 rounded-[1.5rem] border-2 transition-all duration-300 text-left relative overflow-hidden',
                                                        (settings?.taxConfig?.mode ??
                                                            'EXCLUSIVE') === mode.id
                                                            ? 'border-blue-600 bg-blue-600/5 shadow-xl shadow-blue-500/10'
                                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                                    )}
                                                >
                                                    {(settings?.taxConfig?.mode ?? 'EXCLUSIVE') ===
                                                        mode.id && (
                                                        <motion.div
                                                            layoutId="taxMode"
                                                            className="absolute top-3 right-3"
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                                className="text-blue-600"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <p
                                                        className={clsx(
                                                            'font-bold text-sm mb-1',
                                                            (settings?.taxConfig?.mode ??
                                                                'EXCLUSIVE') === mode.id
                                                                ? 'text-blue-700'
                                                                : 'text-slate-800'
                                                        )}
                                                    >
                                                        {mode.label}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-500 leading-tight">
                                                        {mode.sub}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-1.5 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                                        <Input
                                            label="Standard Fiscal Rate (%)"
                                            type="number"
                                            value={settings?.taxConfig?.defaultRate ?? 17}
                                            onChange={e =>
                                                handleDefaultTaxRateChange(
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="border-none bg-transparent shadow-none"
                                            icon={<Percent size={18} className="text-blue-500" />}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* 2. Unit Profile (Business Information) */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-8 relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Building2 size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Business Identity
                            </h3>
                            <p className="text-xs font-medium text-slate-500">
                                Legal profile for CNG operations & receipts
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="p-1 px-4 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                            <Input
                                label="Commercial Name"
                                placeholder="Motorway CNG Enterprise"
                                value={settings.businessName || ''}
                                onChange={e => updateSettings({ businessName: e.target.value })}
                                className="border-none bg-transparent shadow-none"
                                icon={<ShieldCheck size={18} className="text-amber-500" />}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-1 px-4 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                                <Input
                                    label="Direct Contact"
                                    placeholder="+92 3XX XXXXXXX"
                                    value={settings.businessPhone || ''}
                                    onChange={e =>
                                        updateSettings({ businessPhone: e.target.value })
                                    }
                                    className="border-none bg-transparent shadow-none"
                                    icon={<Phone size={18} className="text-amber-500" />}
                                />
                            </div>
                            <div className="p-1 px-4 bg-slate-100/50 rounded-[1.8rem] border border-slate-200">
                                <Input
                                    label="Regulatory ID"
                                    value="STN-001-CNG"
                                    disabled
                                    className="border-none bg-transparent shadow-none opacity-60"
                                    icon={<MapPin size={18} className="text-slate-400" />}
                                />
                            </div>
                        </div>

                        <div className="p-1 px-4 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                            <Input
                                label="Operational Location"
                                placeholder="Strategic site address..."
                                value={settings.businessLocation || ''}
                                onChange={e => updateSettings({ businessLocation: e.target.value })}
                                className="border-none bg-transparent shadow-none"
                                icon={<MapPin size={18} className="text-amber-500" />}
                            />
                        </div>
                    </div>
                </Card>

                {/* 3. Digital Treasury (Payment Accounts) */}
                <Card className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                    <div className="flex items-center gap-5 mb-8 relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Smartphone size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                Fintech Accounts
                            </h3>
                            <p className="text-xs font-medium text-slate-400">
                                Mobile payment gateway synchronization
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 space-y-4">
                            <Input
                                label="EasyPaisa Gateway"
                                placeholder="03XX-XXXXXXX"
                                value={(settings as any).easyPaisaAccount || ''}
                                onChange={e => updateSettings({ easyPaisaAccount: e.target.value })}
                                className="bg-transparent border-white/10 text-white placeholder:text-white/20 font-mono tracking-wider"
                            />
                            <Input
                                label="JazzCash Gateway"
                                placeholder="03XX-XXXXXXX"
                                value={(settings as any).jazzCashAccount || ''}
                                onChange={e => updateSettings({ jazzCashAccount: e.target.value })}
                                className="bg-transparent border-white/10 text-white placeholder:text-white/20 font-mono tracking-wider"
                            />
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl flex gap-4 items-start border border-white/5">
                            <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                                <Info size={16} className="text-purple-400" />
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                Integrated accounts enable real-time digital liquidity tracking in
                                the CNG Shift Closure flow.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 4. Dispenser Intelligence (CNG Meters) */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-8 relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Database size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                Dispenser Array
                            </h3>
                            <p className="text-xs font-medium text-slate-500">
                                Managing {meterIds.length} high-precision dispensing units
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input
                                placeholder="Unit ID (e.g. M4)"
                                value={newMeterId}
                                onChange={e => setNewMeterId(e.target.value.toUpperCase())}
                                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-sm font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                            />
                            <Button
                                onClick={handleAddMeter}
                                variant="primary"
                                className="rounded-2xl px-8 h-[58px] bg-emerald-600 border-none hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                            >
                                <Plus size={20} className="mr-2" /> Deploy
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {meterIds.map((id, index) => (
                                    <motion.div
                                        key={id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group p-5 rounded-[1.8rem] bg-white border border-slate-100 flex items-center justify-between hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform blur-xl" />

                                        <div className="flex items-center gap-4 relative">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                <Gauge size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    Dispenser
                                                </p>
                                                <p className="text-lg font-black text-slate-800">
                                                    {id}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveMeter(id)}
                                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </Card>

                {/* Elite Operational Summary */}
                <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full -ml-48 -mb-48 blur-3xl" />

                    <div className="flex items-center gap-6 relative mb-6 md:mb-0">
                        <div className="p-4 bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl">
                            <Info size={28} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white tracking-tight">
                                System Integrity Protocol
                            </h4>
                            <p className="text-sm font-medium text-white/70">
                                Settings are globally replicated across CNG operational nodes.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 relative">
                        <Button
                            variant="secondary"
                            onClick={resetSettings}
                            className="rounded-2xl px-10 h-16 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all font-bold backdrop-blur-md"
                        >
                            Reset Architecture
                        </Button>
                        <Button
                            variant="primary"
                            className="rounded-2xl px-10 h-16 bg-white text-blue-700 border-none hover:bg-blue-50 transition-all font-black text-base shadow-2xl shadow-blue-500/20"
                        >
                            <Save size={20} className="mr-2" /> Verify & Authorize
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
