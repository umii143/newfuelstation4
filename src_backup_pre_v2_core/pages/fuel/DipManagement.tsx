import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';

import { useSettingsStore } from '@/stores/authStore';
import { Ruler, Plus, AlertCircle, Save, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface DipReading {
    id: string;
    tankId: string;
    date: string;
    physicalLiters: number;
    systemLiters: number;
    variance: number;
    notes: string;
}

export const DipManagement: React.FC = () => {
    const { settings } = useSettingsStore();
    const { tankConfigs, updateTankLevel } = useConfigStore();
    // In a real app we'd save dip history to a store, here we'll keep it in state for demo
    const [dipHistory, setDipHistory] = useState<DipReading[]>([]);
    const [showNewReading, setShowNewReading] = useState(false);
    
    // Form state
    const [selectedTank, setSelectedTank] = useState('');
    const [physicalLiters, setPhysicalLiters] = useState('');
    const [notes, setNotes] = useState('');

    const businessTanks = tankConfigs.filter(t => t.businessUnit === settings.businessUnit && t.isActive);

    const handleSaveReading = () => {
        const tank = businessTanks.find(t => t.tankId === selectedTank);
        if (!tank || !physicalLiters) return;

        const pLiters = parseFloat(physicalLiters);
        const variance = pLiters - tank.currentLevel;

        const newReading: DipReading = {
            id: `DIP-${Date.now()}`,
            tankId: tank.tankId,
            date: new Date().toISOString(),
            physicalLiters: pLiters,
            systemLiters: tank.currentLevel,
            variance,
            notes
        };

        setDipHistory([newReading, ...dipHistory]);
        
        // Update tank level to match physical reality
        updateTankLevel(tank.tankId, pLiters);
        
        setShowNewReading(false);
        setSelectedTank('');
        setPhysicalLiters('');
        setNotes('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Tank Dip Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Reconcile physical dip readings against system stock levels
                    </p>
                </div>
                {!showNewReading && (
                    <Button 
                        onClick={() => setShowNewReading(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
                    >
                        <Plus size={16} /> New Dip Reading
                    </Button>
                )}
            </div>

            {showNewReading && (
                <Card className="p-6 bg-white border-blue-100 shadow-xl shadow-blue-900/5 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Ruler size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Record Physical Dip</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Select Tank</label>
                            <select 
                                value={selectedTank}
                                onChange={(e) => setSelectedTank(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 outline-none"
                            >
                                <option value="">-- Select a Tank --</option>
                                {businessTanks.map(t => (
                                    <option key={t.tankId} value={t.tankId}>
                                        {t.name} ({t.fuelType}) - System: {t.currentLevel.toLocaleString()} L
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Physical Volume (Liters)</label>
                            <Input 
                                type="number"
                                placeholder="Enter calculated liters from dip..."
                                value={physicalLiters}
                                onChange={(e) => setPhysicalLiters(e.target.value)}
                                className="w-full text-lg font-bold rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Notes / Reason (Optional)</label>
                            <Input 
                                placeholder="e.g. After tanker decantation, End of month audit..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full rounded-xl"
                            />
                        </div>
                    </div>

                    {selectedTank && physicalLiters && (
                        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-slate-500">System Expects</p>
                                    <p className="text-xl font-black text-slate-800">
                                        {businessTanks.find(t => t.tankId === selectedTank)?.currentLevel.toLocaleString()} L
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-500">Variance</p>
                                    <p className={clsx(
                                        "text-xl font-black",
                                        (parseFloat(physicalLiters) - (businessTanks.find(t => t.tankId === selectedTank)?.currentLevel || 0)) < 0 
                                            ? "text-rose-600" : "text-emerald-600"
                                    )}>
                                        {(parseFloat(physicalLiters) - (businessTanks.find(t => t.tankId === selectedTank)?.currentLevel || 0)).toLocaleString()} L
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setShowNewReading(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveReading} 
                            disabled={!selectedTank || !physicalLiters}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                        >
                            <Save size={16} /> Save & Reconcile Tank
                        </Button>
                    </div>
                </Card>
            )}

            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Dip Reading History</h2>
                {dipHistory.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Ruler size={24} />
                        </div>
                        <h3 className="font-bold text-slate-700">No Dip Readings Recorded</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Regular dip readings help identify leaks, evaporation, and short deliveries from tankers.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {dipHistory.map(reading => {
                            const tank = businessTanks.find(t => t.tankId === reading.tankId);
                            const isShortage = reading.variance < 0;
                            
                            return (
                                <Card key={reading.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white",
                                            isShortage ? "bg-rose-500" : "bg-emerald-500"
                                        )}>
                                            {isShortage ? <AlertCircle size={18} /> : <Check size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">
                                                {tank?.name || 'Unknown Tank'} 
                                                <span className="text-slate-400 font-normal ml-2 text-sm">{new Date(reading.date).toLocaleString()}</span>
                                            </h4>
                                            <p className="text-sm text-slate-500">{reading.notes || 'Routine check'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 text-right">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">System</p>
                                            <p className="font-bold text-slate-600">{reading.systemLiters.toLocaleString()} L</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Physical</p>
                                            <p className="font-bold text-slate-800">{reading.physicalLiters.toLocaleString()} L</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Variance</p>
                                            <p className={clsx("font-black", isShortage ? "text-rose-600" : "text-emerald-600")}>
                                                {reading.variance > 0 ? '+' : ''}{reading.variance.toLocaleString()} L
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

