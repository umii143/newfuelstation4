import { ShiftWizard } from '@/components/shifts/ShiftWizard';
import { Badge, Button, Card, Input } from '@/components/ui';
import { useFuelStore } from '@/stores/fuelStore';
import clsx from 'clsx';
import { AlertCircle, ChevronRight, Clock, Filter, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface ShiftsPageProps {
    onNavigate: (path: string) => void;
}

const ShiftsPage: React.FC<ShiftsPageProps> = ({}) => {
    const { shifts, openClosingWizard, isClosingWizardOpen, closeClosingWizard } = useFuelStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredShifts = useMemo(
        () =>
            shifts.filter(
                s =>
                    s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.shiftId.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [shifts, searchQuery]
    );

    const stats = useMemo(
        () => ({
            totalRevenue: shifts.reduce((sum, s) => sum + s.totalRevenue, 0),
            totalLiters: shifts.reduce((sum, s) => sum + s.totalLitersSold, 0),
            avgVariance: shifts.reduce((sum, s) => sum + s.variance, 0) / (shifts.length || 1),
        }),
        [shifts]
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                        Fuel <span className="text-blue-500 text-glow-blue">Shifts</span>
                    </h1>
                    <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">
                        Management & Reconciliation Protocol
                    </p>
                </div>
                <Button
                    onClick={openClosingWizard}
                    className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest flex gap-3 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={24} /> Close New Shift
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Total Period Revenue
                    </p>
                    <p className="text-3xl font-black text-blue-600 tracking-tighter">
                        Rs. {stats.totalRevenue.toLocaleString()}
                    </p>
                </Card>
                <Card className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Throughput (Liters)
                    </p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                        {stats.totalLiters.toLocaleString()} L
                    </p>
                </Card>
                <Card
                    className={clsx(
                        'p-8 rounded-[2rem] space-y-2 border',
                        stats.avgVariance >= 0
                            ? 'bg-emerald-500/5 border-emerald-500/10'
                            : 'bg-rose-500/5 border-rose-500/10'
                    )}
                >
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Average Variance
                    </p>
                    <p
                        className={clsx(
                            'text-3xl font-black tracking-tighter',
                            stats.avgVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        )}
                    >
                        {stats.avgVariance >= 0 ? '+' : '-'}Rs.{' '}
                        {Math.abs(stats.avgVariance).toLocaleString()}
                    </p>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                        size={20}
                    />
                    <Input
                        placeholder="SEARCH BY SALESMAN OR SHIFT ID..."
                        className="h-16 pl-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] font-bold uppercase tracking-widest text-xs"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="secondary" className="h-16 w-16 p-0 rounded-2xl">
                    <Filter size={24} />
                </Button>
            </div>

            {/* Shifts Table/List */}
            <div className="space-y-4">
                {filteredShifts.map(shift => (
                    <Card
                        key={shift.shiftId}
                        className="group p-8 rounded-[2.5rem] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-blue-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Clock size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                                            {shift.staffName}
                                        </h3>
                                        <Badge
                                            color={
                                                shift.shiftType === 'MORNING' ? 'blue' : 'emerald'
                                            }
                                        >
                                            {shift.shiftType}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                        {shift.shiftId} •{' '}
                                        {new Date(shift.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 lg:max-w-2xl">
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                        Revenue
                                    </p>
                                    <p className="font-black text-[var(--text-primary)] italic tracking-tighter">
                                        Rs. {shift.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                        Liters
                                    </p>
                                    <p className="font-black text-[var(--text-primary)] italic tracking-tighter">
                                        {shift.totalLitersSold.toLocaleString()} L
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                        Variance
                                    </p>
                                    <p
                                        className={clsx(
                                            'font-black italic tracking-tighter',
                                            shift.variance >= 0
                                                ? 'text-emerald-500'
                                                : 'text-rose-500'
                                        )}
                                    >
                                        {shift.variance >= 0 ? '+' : ''}
                                        {shift.variance.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex justify-end items-center">
                                    <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredShifts.length === 0 && (
                    <div className="p-20 rounded-[4rem] border-2 border-dashed border-[var(--border)] text-center space-y-4">
                        <AlertCircle
                            className="mx-auto text-[var(--text-secondary)] opacity-20"
                            size={64}
                        />
                        <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">
                            No shift records found
                        </p>
                    </div>
                )}
            </div>

            {/* Shift Wizard Modal */}
            {isClosingWizardOpen && (
                <ShiftWizard
                    mode="FUEL"
                    isOpen={isClosingWizardOpen}
                    onClose={closeClosingWizard}
                />
            )}
        </div>
    );
};

export default ShiftsPage;
