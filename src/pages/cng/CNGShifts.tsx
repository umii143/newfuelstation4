import { ShiftWizard } from '@/components/shifts/ShiftWizard';
import { Badge, Button, Card, Input, Modal } from '@/components/ui';
import { useCNGStore } from '@/stores/cngStore';
import { useStaffStore } from '@/stores/dataStores';
import clsx from 'clsx';
import { AlertCircle, Clock, Eye, Filter, Plus, Receipt, Search, User, X } from 'lucide-react';

import React, { useState } from 'react';

export const CNGShiftsPage: React.FC = () => {
    const { shifts, openClosingWizard, closeClosingWizard, isClosingWizardOpen } = useCNGStore();
    const { users } = useStaffStore();
    const activeStaff = users.filter(u => u.status === 'ACTIVE');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShift, setSelectedShift] = useState<any | null>(null);

    // Staff selection modal before opening shift wizard
    const [isStaffPickerOpen, setIsStaffPickerOpen] = useState(false);
    const [pickedStaffId, setPickedStaffId] = useState('');

    const handleOpenShiftWizard = () => {
        if (!pickedStaffId) return;
        const staff = activeStaff.find(s => s.userId === pickedStaffId);
        if (!staff) return;
        setIsStaffPickerOpen(false);
        openClosingWizard(staff.userId, staff.name);
        setPickedStaffId('');
    };

    const filteredShifts = shifts.filter(
        s =>
            s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.shiftId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalRevenue: shifts.reduce((sum, s) => sum + s.totalRevenue, 0),
        totalKG: shifts.reduce((sum, s) => sum + s.totalLitersSold, 0), // Liters sold used as KG in CNG
        avgVariance: shifts.reduce((sum, s) => sum + s.variance, 0) / (shifts.length || 1),
    };

    const formatCurrency = (value: number) => `₨${(value || 0).toLocaleString()}`;
    const formatKG = (value: number) => `${(value || 0).toFixed(2)} KG`;

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
                        CNG <span className="text-emerald-500 text-glow-emerald">Shifts</span>
                    </h1>
                    <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-1">
                        Operational Protocol & KG Reconciliation
                    </p>
                </div>
                <Button
                    onClick={() => setIsStaffPickerOpen(true)}
                    className="h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black uppercase tracking-widest flex gap-3 shadow-xl shadow-emerald-500/20"
                >
                    <Plus size={24} /> New CNG Shift
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Total CNG Revenue
                    </p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                        {formatCurrency(stats.totalRevenue)}
                    </p>
                </Card>
                <Card className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Total KG Sold
                    </p>
                    <p className="text-3xl font-black text-blue-600 tracking-tighter">
                        {formatKG(stats.totalKG)}
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
                        {stats.avgVariance >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(stats.avgVariance))}
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
                        className="group p-8 rounded-[2.5rem] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-emerald-500/30 transition-all cursor-pointer"
                        onClick={() => setSelectedShift(shift)}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
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
                                        {formatCurrency(shift.totalRevenue)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                                        Quantity
                                    </p>
                                    <p className="font-black text-[var(--text-primary)] italic tracking-tighter">
                                        {formatKG(shift.totalLitersSold)}
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
                                        {formatCurrency(shift.variance)}
                                    </p>
                                </div>
                                <div className="flex justify-end items-center">
                                    <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Eye size={24} />
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
                <ShiftWizard mode="CNG" isOpen={isClosingWizardOpen} onClose={closeClosingWizard} />
            )}

            {/* Shift Detail Modal */}
            <Modal
                isOpen={!!selectedShift}
                onClose={() => setSelectedShift(null)}
                title="CNG Shift Details"
                size="xl"
            >
                {selectedShift && (
                    <div className="p-2 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] space-y-1">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                    Revenue
                                </p>
                                <p className="text-xl font-black text-emerald-600">
                                    {formatCurrency(selectedShift.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] space-y-1">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                    Quantity
                                </p>
                                <p className="text-xl font-black text-blue-600">
                                    {formatKG(selectedShift.totalLitersSold)}
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] space-y-1">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                    Cash
                                </p>
                                <p className="text-xl font-black text-indigo-600">
                                    {formatCurrency(selectedShift.actualCash)}
                                </p>
                            </div>
                            <div
                                className={clsx(
                                    'p-4 rounded-2xl space-y-1',
                                    selectedShift.variance >= 0
                                        ? 'bg-emerald-500/10'
                                        : 'bg-rose-500/10'
                                )}
                            >
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                    Variance
                                </p>
                                <p
                                    className={clsx(
                                        'text-xl font-black',
                                        selectedShift.variance >= 0
                                            ? 'text-emerald-600'
                                            : 'text-rose-600'
                                    )}
                                >
                                    {formatCurrency(selectedShift.variance)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase text-[var(--text-primary)] flex items-center gap-2">
                                <Receipt size={18} className="text-emerald-500" /> Transaction
                                Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-[var(--text-secondary)]">
                                            Credit Recoveries
                                        </span>
                                        <span className="font-black text-emerald-600">
                                            +{formatCurrency(selectedShift.recoveries)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-[var(--text-secondary)]">
                                            Digital Payments
                                        </span>
                                        <span className="font-black text-blue-600">
                                            +{formatCurrency(selectedShift.digitalCash)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-[var(--text-secondary)]">
                                            Credit Sales
                                        </span>
                                        <span className="font-black text-rose-500">
                                            -{formatCurrency(selectedShift.credits)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-[var(--text-secondary)]">
                                            Shift Expenses
                                        </span>
                                        <span className="font-black text-rose-500">
                                            -{formatCurrency(selectedShift.expenses)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedShift.notes && (
                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                    Operational Notes
                                </p>
                                <p className="text-sm font-medium text-[var(--text-secondary)] italic">
                                    "{selectedShift.notes}"
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                            <Button variant="secondary" onClick={() => setSelectedShift(null)}>
                                Dismiss Details
                            </Button>
                            <Button
                                className="bg-emerald-600 text-white font-black uppercase tracking-widest"
                                onClick={() => window.print()}
                            >
                                Print Protocol Report
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Staff Picker Modal — Select who is closing the shift */}
            {isStaffPickerOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-[2rem] shadow-2xl border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter">
                                    Select Staff Member
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Who is closing this CNG shift?
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsStaffPickerOpen(false);
                                    setPickedStaffId('');
                                }}
                                className="p-2 hover:bg-[var(--bg-primary)] rounded-full"
                            >
                                <X size={20} className="text-[var(--text-secondary)]" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {activeStaff.length === 0 ? (
                                <div className="text-center py-8">
                                    <User
                                        size={40}
                                        className="mx-auto text-[var(--text-secondary)] opacity-30 mb-3"
                                    />
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        No active staff found.
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        Add staff in Staff Management first.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {activeStaff.map(s => (
                                        <button
                                            key={s.userId}
                                            onClick={() => setPickedStaffId(s.userId)}
                                            className={clsx(
                                                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                                                pickedStaffId === s.userId
                                                    ? 'border-emerald-500 bg-emerald-500/10'
                                                    : 'border-[var(--border)] hover:border-emerald-500/50 bg-[var(--bg-primary)]'
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-lg">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-[var(--text-primary)]">
                                                    {s.name}
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                                                    {s.role.replace('_', ' ')}
                                                </p>
                                            </div>
                                            {pickedStaffId === s.userId && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <svg
                                                        className="w-3.5 h-3.5 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={3}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-[var(--border)] grid grid-cols-2 gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsStaffPickerOpen(false);
                                    setPickedStaffId('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-500 font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                onClick={handleOpenShiftWizard}
                                disabled={!pickedStaffId}
                            >
                                Start Shift
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
