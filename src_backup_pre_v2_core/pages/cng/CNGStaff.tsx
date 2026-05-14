import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useStaffStore as _useStaffStore } from '@/stores/dataStores';
import { motion } from 'framer-motion';
import { Activity, Award, Phone, Search, Star, TrendingUp, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

export const CNGStaffPage: React.FC = () => {
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
    const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: 'Attendant' });

    const handleAddStaff = () => {
        // Mock add logic
        setShowAddModal(false);
        setNewStaff({ name: '', phone: '', role: 'Attendant' });
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <PageHeader
                title="CNG Staff Management"
                subtitle="View attendant performance and manage CNG operations team"
                actions={
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowAddModal(true)}
                    >
                        <UserPlus size={18} /> Add Attendant
                    </Button>
                }
            />

            {/* Search and Filters */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40 backdrop-blur-xl border-white/20 shadow-2xl">
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        
                        
                    />
                </div>
            </Card>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {([] as any[]).map((staff, index) => (
                    <motion.div
                        key={staff?.userId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="group relative pt-12 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                            {/* Avatar Circle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-blue-500 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-white text-3xl font-black">
                                {staff.name.charAt(0)}
                            </div>

                            <div className="text-center px-6 pb-6 pt-2">
                                <h3 className="text-xl font-bold mb-1">{staff.name}</h3>
                                <Badge color="blue" className="mb-4">
                                    {staff.role}
                                </Badge>

                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    <div className="p-3 rounded-2xl bg-white/50 border border-white/30">
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                            Rank
                                        </p>
                                        <div className="flex items-center justify-center gap-1 text-primary font-black">
                                            <Award size={14} /> #{staff.performance?.rank || 1}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/50 border border-white/30">
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                            Rating
                                        </p>
                                        <div className="flex items-center justify-center gap-1 text-amber-500 font-black">
                                            <Star size={14} fill="currentColor" /> 4.9
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-transparent group-hover:border-primary/20 transition-all">
                                        <Phone size={16} className="text-primary" />
                                        <span className="font-medium">{staff.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/30 italic text-xs">
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                            <Activity size={14} />
                                            <span>Shift Performance</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                            <TrendingUp size={12} /> +12%
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="secondary"
                                    className="w-full rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-black/5"
                                    onClick={() => setSelectedStaff(staff)}
                                >
                                    View Performance Detail
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Add Staff Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New CNG Staff"
            >
                <div className="space-y-6">
                    <Input
                        label="Full Name"
                        placeholder="Enter staff name..."
                        value={newStaff.name}
                        onChange={(e: any) => setNewStaff({ ...newStaff, name: e.target.value })}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="03xx-xxxxxxx"
                        value={newStaff.phone}
                        onChange={(e: any) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleAddStaff}>
                            Create Account
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Performance Detail Modal */}
            <Modal
                isOpen={!!selectedStaff}
                onClose={() => setSelectedStaff(null)}
                title={`${selectedStaff?.name}'s Performance`}
                size="lg"
            >
                {selectedStaff && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Lifetime Sales
                                </p>
                                <p className="text-xl font-black text-slate-700">₨845,000</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Efficiency
                                </p>
                                <p className="text-xl font-black text-emerald-600">98.2%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Attendance
                                </p>
                                <p className="text-xl font-black text-blue-600">26/30</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/10">
                            <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                                <TrendingUp size={16} /> Recent Performance Trend
                            </h4>
                            <div className="h-40 flex items-end gap-2 px-2">
                                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-primary/20 rounded-t-xl relative group"
                                    >
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl transition-all duration-1000 group-hover:bg-blue-500"
                                            style={{ height: `${h}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <span
                                        key={d}
                                        className="text-[10px] font-bold text-slate-400 uppercase"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button variant="secondary" onClick={() => setSelectedStaff(null)}>
                                Close Profile
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
