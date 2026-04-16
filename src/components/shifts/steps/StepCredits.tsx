import { useSettingsStore } from '@/stores/authStore';
import { useCustomerStore } from '@/stores/dataStores';
import { useCustomerLedgerStore } from '@/stores/ledgerStore';
import { Customer } from '@/types';
import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    CreditCard,
    Loader2,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { InlineFormPanel, QuickInput, QuickSelect, WizardCard } from './WizardCard';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function fmt(n: number) {
    return n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─────────────────────────────────────────────────────────────────────────
   Inline Quick-Register Customer
   FIX: instead of calling useCustomerStore.getState() after await (race),
        we read the customer list BEFORE and AFTER then diff to find the new one.
──────────────────────────────────────────────────────────────────────────*/
const QuickAddCustomer: React.FC<{
    onCreated: (c: Customer) => void;
    onCancel: () => void;
}> = ({ onCreated, onCancel }) => {
    const { addCustomer } = useCustomerStore();
    const { settings } = useSettingsStore();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [limit, setLimit] = useState('50000');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const submit = async () => {
        const n = name.trim(),
            p = phone.trim();
        if (!n) {
            setErr('Customer name is required.');
            return;
        }
        if (!p) {
            setErr('Phone number is required.');
            return;
        }

        setSaving(true);
        setErr('');

        // Snapshot IDs BEFORE so we can find the newly-added customer
        const before = useCustomerStore.getState().customers.map(c => c.customerId);

        try {
            await addCustomer({
                name: n,
                phone: p,
                creditLimit: parseFloat(limit) || 50_000,
                
                paymentTerms: 'NET_30',
                status: 'ACTIVE',
                stationId: 'ST-1',
                businessUnit: settings.businessUnit as 'FUEL' | 'CNG' | 'LUBE',
            });

            // Diff to find newly created customer (100% reliable regardless of timing)
            const after = useCustomerStore.getState().customers;
            const created = after.find(c => !before.includes(c.customerId));
            if (created) {
                onCreated(created);
            } else {
                // Fallback: take last customer
                const last = after[after.length - 1];
                if (last) onCreated(last);
            }
        } catch (e: any) {
            setErr(e?.message || 'Failed to register customer.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <InlineFormPanel
            visible
            title="Quick-Register New Customer"
            accentColor="#6366f1"
            icon={<UserPlus size={13} style={{ color: '#6366f1' }} />}
        >
            {err && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <AlertTriangle size={12} className="text-red-500 shrink-0" />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{err}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <QuickInput
                    label="Customer Name *"
                    type="text"
                    placeholder="e.g. Ahmed Transport"
                    value={name}
                    onChange={e => {
                        setName(e.target.value);
                        setErr('');
                    }}
                />
                <QuickInput
                    label="Phone *"
                    type="tel"
                    placeholder="03xx-xxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
            </div>

            <QuickInput
                label="Credit Limit (₨)"
                type="number"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                unit="₨"
            />

            <div className="flex gap-2 pt-1">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={saving}
                    className={clsx(
                        'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all',
                        saving
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                    )}
                >
                    {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Sparkles size={14} />
                    )}
                    {saving ? 'Registering…' : 'Register & Select'}
                </motion.button>
                <button
                    onClick={onCancel}
                    className="px-4 py-3 rounded-xl text-sm font-black text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors uppercase tracking-widest"
                >
                    Cancel
                </button>
            </div>
        </InlineFormPanel>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main Component
──────────────────────────────────────────────────────────────────────────*/
export const StepCredits: React.FC<StepProps> = ({ onUpdate, data }) => {
    const transactions = data?.transactions || [];
    const credits = transactions.filter((t: any) => t.type === 'CREDIT_SALE');
    const recoveries = transactions.filter((t: any) => t.type === 'RECOVERY');
    const totalCredits = credits.reduce((s: number, t: any) => s + t.amount, 0);
    const totalRecoveries = recoveries.reduce((s: number, t: any) => s + t.amount, 0);

    const [tab, setTab] = useState<'SALES' | 'RECOVERIES'>('SALES');
    const [selectedCustomer, setCustomer] = useState<Customer | null>(null);
    const [amount, setAmount] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const { customers } = useCustomerStore();
    const { getCustomerBalance } = useCustomerLedgerStore();
    const { settings } = useSettingsStore();

    // Filter customers to current business unit
    const filteredCustomers = useMemo(
        () => customers.filter(c => c.businessUnit === settings.businessUnit || !c.businessUnit),
        [customers, settings.businessUnit]
    );

    const balance = selectedCustomer ? getCustomerBalance(selectedCustomer.customerId) : 0;

    const addTx = (type: 'CREDIT_SALE' | 'RECOVERY') => {
        const amt = parseFloat(amount);
        if (!selectedCustomer || isNaN(amt) || amt <= 0) return;
        onUpdate({
            transactions: [
                ...transactions,
                {
                    id: crypto.randomUUID(),
                    type,
                    amount: amt,
                    customerId: selectedCustomer.customerId,
                    customerName: selectedCustomer.name,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        setAmount('');
    };

    const removeTx = (id: string) =>
        onUpdate({ transactions: transactions.filter((t: any) => t.id !== id) });

    const displayList = tab === 'SALES' ? credits : recoveries;
    const activeColor = tab === 'SALES' ? '#6366f1' : '#10b981';
    const addLabel = tab === 'SALES' ? 'Credit Sale' : 'Recovery';
    const txType = tab === 'SALES' ? 'CREDIT_SALE' : 'RECOVERY';

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 py-3">
            {/* ── Totals Cockpit ── */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                {[
                    {
                        label: 'Credit Sales',
                        value: totalCredits,
                        count: credits.length,
                        from: '#6366f1',
                        to: '#8b5cf6',
                        glow: 'rgba(99,102,241,0.35)',
                        textClass: 'text-indigo-700 dark:text-indigo-400',
                        Icon: CreditCard,
                    },
                    {
                        label: 'Recoveries',
                        value: totalRecoveries,
                        count: recoveries.length,
                        from: '#10b981',
                        to: '#059669',
                        glow: 'rgba(16,185,129,0.35)',
                        textClass: 'text-emerald-700 dark:text-emerald-400',
                        Icon: RotateCcw,
                    },
                ].map(card => (
                    <WizardCard
                        key={card.label}
                        accent={`linear-gradient(90deg,${card.from},${card.to})`}
                        glowColor={`rgba(99,102,241,0.08)`}
                        className="!p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: `linear-gradient(135deg,${card.from},${card.to})`,
                                    boxShadow: `0 6px 20px ${card.glow}`,
                                }}
                            >
                                <card.Icon size={17} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 leading-none">
                                    {card.label}
                                </p>
                                <p
                                    className={clsx(
                                        'text-2xl font-black font-mono mt-1',
                                        card.textClass
                                    )}
                                >
                                    ₨{fmt(card.value)}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-600 mt-0.5">
                                    {card.count} entr{card.count === 1 ? 'y' : 'ies'}
                                </p>
                            </div>
                        </div>
                    </WizardCard>
                ))}
            </motion.div>

            {/* ── Tab Switcher ── */}
            <motion.div
                variants={fadeUp}
                className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.06]"
            >
                {[
                    {
                        key: 'SALES',
                        label: 'Credit Sales',
                        icon: CreditCard,
                        active: 'bg-indigo-600',
                    },
                    {
                        key: 'RECOVERIES',
                        label: 'Recoveries',
                        icon: RotateCcw,
                        active: 'bg-emerald-600',
                    },
                ].map(t => (
                    <motion.button
                        key={t.key}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTab(t.key as any)}
                        className={clsx(
                            'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200',
                            tab === t.key
                                ? `${t.active} text-white shadow-lg`
                                : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                        )}
                    >
                        <t.icon size={14} /> {t.label}
                    </motion.button>
                ))}
            </motion.div>

            {/* ── Customer Selector + Quick-Add ── */}
            <motion.div variants={fadeUp}>
                <WizardCard noPad>
                    {/* Header bar */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                        <div>
                            <p className="text-base font-black text-gray-900 dark:text-white">
                                Add {addLabel}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                Select a customer, then enter the amount
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowAddForm(v => !v)}
                            className={clsx(
                                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all',
                                showAddForm
                                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-gray-50 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-gray-200 dark:border-white/[0.08]'
                            )}
                        >
                            <UserPlus size={12} />
                            {showAddForm ? 'Cancel' : '+ New Customer'}
                        </motion.button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Inline quick-add form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    key="quick-add-customer"
                                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <QuickAddCustomer
                                        onCreated={c => {
                                            setCustomer(c);
                                            setShowAddForm(false);
                                        }}
                                        onCancel={() => setShowAddForm(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Customer dropdown */}
                        <QuickSelect
                            label="Select Customer"
                            value={selectedCustomer?.customerId || ''}
                            onChange={e => {
                                const c =
                                    filteredCustomers.find(x => x.customerId === e.target.value) ||
                                    null;
                                setCustomer(c);
                            }}
                        >
                            <option value="" className="bg-white dark:bg-gray-900 text-gray-400">
                                — Choose customer —
                            </option>
                            {filteredCustomers.length === 0 && (
                                <option
                                    disabled
                                    className="bg-white dark:bg-gray-900 text-gray-400"
                                >
                                    No customers yet — click &quot;+ New Customer&quot; to add one
                                </option>
                            )}
                            {filteredCustomers.map(c => (
                                <option
                                    key={c.customerId}
                                    value={c.customerId}
                                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                >
                                    {c.name}
                                    {c.phone ? ` — ${c.phone}` : ''}
                                </option>
                            ))}
                        </QuickSelect>

                        {/* Balance chip */}
                        <AnimatePresence>
                            {selectedCustomer && (
                                <motion.div
                                    key="balance"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={clsx(
                                        'grid grid-cols-2 gap-3 p-3 rounded-xl border',
                                        balance > 0
                                            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                                            : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                                    )}
                                >
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                            Outstanding Balance
                                        </p>
                                        <p
                                            className={clsx(
                                                'text-lg font-black font-mono mt-0.5',
                                                balance > 0
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            )}
                                        >
                                            ₨ {fmt(balance)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">
                                            Credit Limit
                                        </p>
                                        <p className="text-lg font-black font-mono mt-0.5 text-gray-700 dark:text-slate-300">
                                            ₨ {fmt(selectedCustomer.creditLimit)}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Amount + Add button */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <QuickInput
                                    type="number"
                                    placeholder={`${addLabel} amount…`}
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTx(txType)}
                                    unit="₨"
                                    className="!text-xl"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => addTx(txType)}
                                disabled={!selectedCustomer || !amount || parseFloat(amount) <= 0}
                                className={clsx(
                                    'h-[54px] px-6 rounded-xl flex items-center gap-2 text-sm font-black text-white uppercase tracking-widest shadow-lg shrink-0 transition-all',
                                    !selectedCustomer || !amount || parseFloat(amount) <= 0
                                        ? 'bg-gray-200 dark:bg-white/[0.05] text-gray-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                                        : tab === 'SALES'
                                          ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                                )}
                            >
                                <Plus size={16} /> Add
                            </motion.button>
                        </div>
                    </div>
                </WizardCard>
            </motion.div>

            {/* ── Transaction List ── */}
            {displayList.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/[0.06]" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 shrink-0">
                            {displayList.length} {addLabel} Record
                            {displayList.length > 1 ? 's' : ''}
                        </p>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/[0.06]" />
                    </div>
                    <AnimatePresence>
                        {displayList.map((tx: any) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"
                                style={{
                                    boxShadow:
                                        '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
                                }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                            background: `${activeColor}15`,
                                            border: `1px solid ${activeColor}25`,
                                        }}
                                    >
                                        <Users size={14} style={{ color: activeColor }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                            {tx.customerName}
                                        </p>
                                        <p className="text-xs font-mono text-gray-400 dark:text-slate-600 mt-0.5">
                                            {new Date(tx.timestamp).toLocaleTimeString('en-PK', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <p
                                        className="text-lg font-black font-mono"
                                        style={{ color: activeColor }}
                                    >
                                        ₨ {fmt(tx.amount)}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeTx(tx.id)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty state */}
            {displayList.length === 0 && (
                <motion.div variants={fadeUp} className="py-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{ background: `${activeColor}10` }}
                    >
                        {tab === 'SALES' ? (
                            <CreditCard size={24} style={{ color: activeColor }} />
                        ) : (
                            <RotateCcw size={24} style={{ color: activeColor }} />
                        )}
                    </div>
                    <p className="text-sm font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                        No {addLabel}s Yet
                    </p>
                    <p className="text-xs text-gray-300 dark:text-slate-700 mt-1">
                        Add the first one using the form above
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};
