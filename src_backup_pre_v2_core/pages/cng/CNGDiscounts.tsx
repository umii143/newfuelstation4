import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useDiscountStore } from '@/stores/discountStore';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    Search,
    ShieldCheck,
    Tag,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

export const CNGDiscountsPage: React.FC = () => {
    const { discountEntries, approveDiscount, rejectDiscount } = useDiscountStore();
    const { user: currentUser } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Filter for CNG only
    const cngDiscounts = (discountEntries || []).filter(
        d =>
            d.businessUnit === 'CNG' &&
            (d.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.reason?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <PageHeader
                title="CNG Discounts"
                subtitle="Review and approve discount requests from CNG attendants"
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">
                        Pending Approvals
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-3xl font-black">
                            {cngDiscounts.filter(d => d.approvalStatus === 'PENDING').length}
                        </h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">
                        Today's Total
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-3xl font-black">
                            {formatCurrency(
                                cngDiscounts
                                    .filter(
                                        d =>
                                            d.timestamp.split('T')[0] ===
                                            new Date().toISOString().split('T')[0]
                                    )
                                    .reduce((s, d) => s + d.amount, 0)
                            )}
                        </h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">
                        Approval Rate
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-3xl font-black">94%</h3>
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40 backdrop-blur-xl border-white/20 shadow-2xl">
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by customer or reason..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 noscrollbar">
                    <Button variant="secondary" className="gap-2">
                        <Filter size={16} /> All Status
                    </Button>
                </div>
            </Card>

            {/* Discounts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cngDiscounts.length > 0 ? (
                    cngDiscounts.map((discount, index) => (
                        <motion.div
                            key={discount.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all relative group overflow-hidden">
                                {discount.approvalStatus === 'PENDING' && (
                                    <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/40" />
                                )}

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Tag size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">
                                                {discount.customerName || 'Anonymous Customer'}
                                            </h3>
                                            <p className="text-xs text-[var(--text-secondary)] font-medium">
                                                By {discount.createdByName} •{' '}
                                                {discount.timestamp.split('T')[1].substring(0, 5)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        color={
                                            discount.approvalStatus === 'APPROVED'
                                                ? 'emerald'
                                                : discount.approvalStatus === 'REJECTED'
                                                  ? 'rose'
                                                  : 'amber'
                                        }
                                    >
                                        {discount.approvalStatus}
                                    </Badge>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/50 border border-white/40 space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                            Amount
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            {formatCurrency(discount.amount)}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                                            Reason
                                        </span>
                                        <p className="text-sm font-medium italic">
                                            "{discount.reason.replace('_', ' ')}"
                                        </p>
                                        {discount.reasonNote && (
                                            <p className="text-xs opacity-60">
                                                {discount.reasonNote}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {discount.approvalStatus === 'PENDING' ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 h-10 shadow-lg shadow-emerald-600/20"
                                            onClick={() =>
                                                approveDiscount(
                                                    discount.id,
                                                    (currentUser as any)?.userId || 'USR-001',
                                                    (currentUser as any)?.name || 'Manager'
                                                )
                                            }
                                        >
                                            <CheckCircle2 size={16} /> Approve
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="flex-1 gap-2 text-rose-600 border-rose-100 hover:bg-rose-50 h-10"
                                            onClick={() =>
                                                rejectDiscount(
                                                    discount.id,
                                                    (currentUser as any)?.userId || 'USR-001',
                                                    (currentUser as any)?.name || 'Manager'
                                                )
                                            }
                                        >
                                            <XCircle size={16} /> Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-[var(--text-secondary)]">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span>
                                            Processed by <b>{discount.approvedByName}</b>
                                        </span>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 flex items-center justify-center text-[var(--text-secondary)]">
                            <Tag size={32} opacity={0.3} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Discounts Found</h3>
                        <p className="text-[var(--text-secondary)]">
                            Discounts recorded during CNG shifts will appear here for review.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
