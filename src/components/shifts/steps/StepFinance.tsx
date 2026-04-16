import { useSettingsStore } from '@/stores/authStore';
import { useExpenseStore, useStaffStore, useSupplierStore } from '@/stores/dataStores';
import { useCashBankStore, useStaffLedgerStore } from '@/stores/ledgerStore';
import { ShiftExpenseCategory } from '@/types';
import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Loader2,
    Plus,
    Receipt,
    SmartphoneNfc,
    Sparkles,
    Trash2,
    Truck,
    Users,
    Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { InlineFormPanel, QuickInput, QuickSelect, WizardCard } from './WizardCard';

/* ─────────── helpers ───────────────────────────────────────────────── */
const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: spring } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fmt = (n: number) =>
    n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─────────── Expense category config ──────────────────────────────── */
const EXP_CATS: {
    value: ShiftExpenseCategory;
    label: string;
    emoji: string;
    from: string;
    to: string;
    glow: string;
    needsStaff?: boolean;
}[] = [
    {
        value: 'PETTY_CASH',
        label: 'Petty Cash',
        emoji: '💵',
        from: '#f59e0b',
        to: '#d97706',
        glow: 'rgba(245,158,11,0.3)',
    },
    {
        value: 'REPAIRS',
        label: 'Repairs',
        emoji: '🔧',
        from: '#ef4444',
        to: '#dc2626',
        glow: 'rgba(239,68,68,0.3)',
    },
    {
        value: 'UTILITIES',
        label: 'Utilities',
        emoji: '⚡',
        from: '#06b6d4',
        to: '#0891b2',
        glow: 'rgba(6,182,212,0.3)',
    },
    {
        value: 'SALARY',
        label: 'Salary',
        emoji: '👤',
        from: '#8b5cf6',
        to: '#7c3aed',
        glow: 'rgba(139,92,246,0.3)',
        needsStaff: true,
    },
    {
        value: 'TRANSPORT',
        label: 'Transport',
        emoji: '🚗',
        from: '#f97316',
        to: '#ea580c',
        glow: 'rgba(249,115,22,0.3)',
    },
    {
        value: 'CARRIAGE_FREIGHT',
        label: 'Carriage',
        emoji: '📦',
        from: '#10b981',
        to: '#059669',
        glow: 'rgba(16,185,129,0.3)',
    },
    {
        value: 'INAM_TIP',
        label: 'Inam/Tip',
        emoji: '🎁',
        from: '#ec4899',
        to: '#db2777',
        glow: 'rgba(236,72,153,0.3)',
    },
    {
        value: 'CLEANING',
        label: 'Cleaning',
        emoji: '🧹',
        from: '#64748b',
        to: '#475569',
        glow: 'rgba(100,116,139,0.3)',
    },
    {
        value: 'OTHER',
        label: 'Other',
        emoji: '📋',
        from: '#6366f1',
        to: '#4f46e5',
        glow: 'rgba(99,102,241,0.3)',
    },
];

const WALLETS = ['Easypaisa', 'JazzCash', 'Raast', 'SadaPay', 'NayaPay'];
type Tab = 'EXPENSES' | 'DIGITAL' | 'SUPPLIER';

/* ─────────── Inline Supplier Quick-Register ────────────────────────── */
const QuickAddSupplier: React.FC<{
    onCreated: (id: string, name: string) => void;
    onCancel: () => void;
}> = ({ onCreated, onCancel }) => {
    const { addSupplier } = useSupplierStore();
    const { settings } = useSettingsStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<
        'FUEL_SUPPLIER' | 'PARTS_SUPPLIER' | 'SERVICE_PROVIDER' | 'OTHER'
    >('FUEL_SUPPLIER');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const submit = async () => {
        if (!name.trim()) {
            setErr('Supplier name required');
            return;
        }
        setSaving(true);
        setErr('');
        const before = useSupplierStore.getState().suppliers.map(s => s.supplierId);
        try {
            await addSupplier({
                name: name.trim(),
                phone: phone.trim() || '—',
                contactPerson: name.trim(),
                paymentTerms: 'NET_30',
                
                rating: 5,
                status: 'ACTIVE',
                type,
                stationId: 'ST-1',
                businessUnit: settings.businessUnit as 'FUEL' | 'CNG' | 'LUBE',
            });
            const after = useSupplierStore.getState().suppliers;
            const created =
                after.find(s => !before.includes(s.supplierId)) || after[after.length - 1];
            onCreated(created.supplierId, created.name);
        } catch (e: any) {
            setErr(e?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <InlineFormPanel
            visible
            title="Quick-Register Supplier"
            accentColor="#f97316"
            icon={<Truck size={13} style={{ color: '#f97316' }} />}
        >
            {err && <p className="text-sm font-semibold text-red-500">{err}</p>}
            <div className="grid grid-cols-2 gap-3">
                <QuickInput
                    label="Supplier Name *"
                    placeholder="e.g. PSO Depot"
                    value={name}
                    onChange={e => {
                        setName(e.target.value);
                        setErr('');
                    }}
                />
                <QuickInput
                    label="Phone"
                    placeholder="03xx-xxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />
            </div>
            <QuickSelect label="Type" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="FUEL_SUPPLIER">Fuel Supplier</option>
                <option value="PARTS_SUPPLIER">Parts Supplier</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="OTHER">Other</option>
            </QuickSelect>
            <div className="flex gap-2 pt-1">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={submit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white uppercase tracking-widest bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
                >
                    {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <Sparkles size={13} />
                    )}
                    {saving ? 'Saving…' : 'Register & Select'}
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

/* ─────────── Inline Bank Quick-Add ────────────────────────────────── */
const QuickAddBank: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({
    onCreated,
    onCancel,
}) => {
    const { addAccount } = useCashBankStore();
    const { settings } = useSettingsStore();
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [saving, setSaving] = useState(false);

    const submit = () => {
        if (!name.trim()) return;
        setSaving(true);
        addAccount({
            name: name.trim(),
            type: 'BANK',
            bankName: bank.trim() || name.trim(),
            accountNumber: '',
            openingBalance: 0,
            businessUnit: settings.businessUnit as any,
        } as any);
        setTimeout(() => {
            setSaving(false);
            onCreated();
        }, 300);
    };

    return (
        <InlineFormPanel
            visible
            title="Quick-Add Bank Account"
            accentColor="#8b5cf6"
            icon={<Building2 size={13} style={{ color: '#8b5cf6' }} />}
        >
            <div className="grid grid-cols-2 gap-3">
                <QuickInput
                    label="Account Label *"
                    placeholder="e.g. MCB Current"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <QuickInput
                    label="Bank Name"
                    placeholder="e.g. MCB"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                />
            </div>
            <div className="flex gap-2 pt-1">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={submit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white uppercase tracking-widest bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 transition-all"
                >
                    {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <Building2 size={13} />
                    )}
                    {saving ? 'Saving…' : 'Add Account'}
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

/* ─────────── Main Component ────────────────────────────────────────── */
export const StepFinance: React.FC<StepProps> = ({ onUpdate, data }) => {
    const transactions = data?.transactions || [];
    const expenses = transactions.filter((t: any) => t.type === 'EXPENSE');
    const digital = transactions.filter((t: any) => t.type === 'DIGITAL_PAYMENT');
    const supplierPay = transactions.filter((t: any) => t.type === 'SUPPLIER_PAYMENT');
    const totalExp = expenses.reduce((s: number, t: any) => s + t.amount, 0);
    const totalDig = digital.reduce((s: number, t: any) => s + t.amount, 0);
    const totalSup = supplierPay.reduce((s: number, t: any) => s + t.amount, 0);

    /* state */
    const [tab, setTab] = useState<Tab>('EXPENSES');
    const [expCat, setExpCat] = useState<ShiftExpenseCategory>('PETTY_CASH');
    const [expNote, setExpNote] = useState('');
    const [selectedStaffId, setStaffId] = useState('');
    const [digitalMethod, setDMethod] = useState('');
    const [selectedAccount, setSelAcc] = useState('');
    const [selectedSupplier, setSelSup] = useState<{ id: string; name: string } | null>(null);
    const [amount, setAmount] = useState('');
    const [showAddSupplier, setAddSup] = useState(false);
    const [showAddBank, setAddBank] = useState(false);
    const [justSync, setJustSync] = useState<string | null>(null);

    /* stores */
    const { getFilteredSuppliers } = useSupplierStore();
    const { getAccounts } = useCashBankStore();
    const { getActiveStaff } = useStaffStore();
    const { addExpense } = useExpenseStore();
    const staffLedger = useStaffLedgerStore();
    const { settings } = useSettingsStore();

    const suppliers = useMemo(() => getFilteredSuppliers(), [getFilteredSuppliers]);
    const bankAccounts = getAccounts('BANK');
    const activeStaff = useMemo(() => getActiveStaff(), [getActiveStaff]);

    const currentCat = EXP_CATS.find(c => c.value === expCat)!;
    const needsStaff = currentCat?.needsStaff ?? false;
    const staffMember = activeStaff.find(s => s.userId === selectedStaffId);

    function flashSync(label: string) {
        setJustSync(label);
        setTimeout(() => setJustSync(null), 2500);
    }

    const removeTx = (id: string) =>
        onUpdate({ transactions: transactions.filter((t: any) => t.id !== id) });

    /* ── Add Expense — writes to shift data AND global stores ── */
    const addExpenseTx = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;
        const desc =
            needsStaff && staffMember
                ? `Salary — ${staffMember.name}`
                : expNote || currentCat.label;

        /* 1. Write to shift */
        onUpdate({
            transactions: [
                ...transactions,
                {
                    id: crypto.randomUUID(),
                    type: 'EXPENSE' as const,
                    amount: amt,
                    expenseCategory: expCat,
                    description: desc,
                    staffId: needsStaff ? selectedStaffId : undefined,
                    staffName: needsStaff ? staffMember?.name : undefined,
                    timestamp: new Date().toISOString(),
                },
            ],
        });

        /* 2. Write to global Expenses Tab ── always */
        try {
            await addExpense({
                expenseId: `EXP-${Date.now()}`,
                category: expCat,
                amount: amt,
                description: desc,
                expenseDate: new Date().toISOString(),
                paymentMethod: 'CASH',
                paidTo: needsStaff ? staffMember?.name || 'Staff' : 'MISC',
                approvedById: null,
            });
        } catch {
            /* best-effort */
        }

        /* 3. If SALARY → write to Staff Ledger Tab */
        if (needsStaff && staffMember) {
            staffLedger.addEntry({
                userId: staffMember.userId,
                userName: staffMember.name,
                date: new Date().toISOString().split('T')[0],
                type: 'SALARY',
                amount: amt,
                debit: amt, // paying staff = debit (money out)
                credit: 0,
                note: `Salary paid via Shift Wizard — ${new Date().toLocaleDateString('en-PK')}`,
                createdBy: settings.businessName || 'Manager',
                reference: `SHIFT-SALARY`,
            });
            flashSync(`✓ ₨${fmt(amt)} posted to ${staffMember.name}'s ledger`);
        } else {
            flashSync(`✓ ₨${fmt(amt)} recorded in Expenses tab`);
        }

        setAmount('');
        setExpNote('');
        setStaffId('');
    };

    const addDigitalTx = () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0 || !digitalMethod) return;
        const acc = bankAccounts.find(a => a.accountId === selectedAccount);
        onUpdate({
            transactions: [
                ...transactions,
                {
                    id: crypto.randomUUID(),
                    type: 'DIGITAL_PAYMENT' as const,
                    amount: amt,
                    method: digitalMethod,
                    accountId: acc?.accountId,
                    accountName: acc?.name,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        setAmount('');
        setDMethod('');
        setSelAcc('');
        flashSync(`✓ ₨${fmt(amt)} ${digitalMethod} payment logged`);
    };

    const addSupplierTx = () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0 || !selectedSupplier) return;
        onUpdate({
            transactions: [
                ...transactions,
                {
                    id: crypto.randomUUID(),
                    type: 'SUPPLIER_PAYMENT' as const,
                    amount: amt,
                    supplierId: selectedSupplier.id,
                    supplierName: selectedSupplier.name,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        setAmount('');
        setSelSup(null);
        flashSync(`✓ ₨${fmt(amt)} posted to ${selectedSupplier.name}`);
    };

    const displayList = tab === 'EXPENSES' ? expenses : tab === 'DIGITAL' ? digital : supplierPay;

    const TABS = [
        {
            key: 'EXPENSES' as Tab,
            label: 'Expenses',
            Icon: Receipt,
            from: '#f59e0b',
            to: '#d97706',
            total: totalExp,
            count: expenses.length,
        },
        {
            key: 'DIGITAL' as Tab,
            label: 'Digital',
            Icon: SmartphoneNfc,
            from: '#8b5cf6',
            to: '#7c3aed',
            total: totalDig,
            count: digital.length,
        },
        {
            key: 'SUPPLIER' as Tab,
            label: 'Supplier',
            Icon: Truck,
            from: '#f97316',
            to: '#ea580c',
            total: totalSup,
            count: supplierPay.length,
        },
    ];
    const activeTab = TABS.find(t => t.key === tab)!;

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 py-3">
            {/* ── Sync Notification Toast ── */}
            <AnimatePresence>
                {justSync && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.96 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30"
                    >
                        <CheckCircle2
                            size={17}
                            className="text-emerald-600 dark:text-emerald-400 shrink-0"
                        />
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                            {justSync}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── KPI Tiles ── */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                {TABS.map(t => (
                    <motion.button
                        key={t.key}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTab(t.key)}
                        className={clsx(
                            'relative overflow-hidden text-left p-5 rounded-2xl transition-all duration-200 border-2',
                            tab === t.key
                                ? 'border-transparent shadow-2xl'
                                : 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.07] hover:border-gray-200'
                        )}
                        style={
                            tab === t.key
                                ? {
                                      background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                                      boxShadow: `0 8px 32px ${t.from}50`,
                                  }
                                : {}
                        }
                    >
                        {tab === t.key && (
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 0% 0%, white, transparent 60%)',
                                }}
                            />
                        )}
                        <div className="relative">
                            <div
                                className={clsx(
                                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                                    tab === t.key ? 'bg-white/25' : ''
                                )}
                                style={tab !== t.key ? { background: `${t.from}18` } : {}}
                            >
                                <t.Icon
                                    size={18}
                                    className={tab === t.key ? 'text-white' : ''}
                                    style={tab !== t.key ? { color: t.from } : {}}
                                />
                            </div>
                            <p
                                className={clsx(
                                    'text-xs font-black uppercase tracking-widest',
                                    tab === t.key
                                        ? 'text-white/80'
                                        : 'text-gray-400 dark:text-slate-500'
                                )}
                            >
                                {t.label}
                            </p>
                            <p
                                className={clsx(
                                    'text-2xl font-black font-mono mt-1',
                                    tab === t.key ? 'text-white' : 'text-gray-900 dark:text-white'
                                )}
                            >
                                ₨
                                {t.total >= 1000 ? (t.total / 1000).toFixed(0) + 'K' : fmt(t.total)}
                            </p>
                            <p
                                className={clsx(
                                    'text-xs mt-1',
                                    tab === t.key
                                        ? 'text-white/60'
                                        : 'text-gray-400 dark:text-slate-600'
                                )}
                            >
                                {t.count} entr{t.count === 1 ? 'y' : 'ies'}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            {/* ── Entry Panel ── */}
            <motion.div variants={fadeUp}>
                <WizardCard noPad>
                    {/* Panel header with accent bar */}
                    <div className="relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{
                                background: `linear-gradient(90deg,${activeTab.from},${activeTab.to})`,
                            }}
                        />
                        <div className="flex items-center justify-between px-6 pt-5 pb-4">
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-white">
                                    Add{' '}
                                    {tab === 'EXPENSES'
                                        ? 'Expense'
                                        : tab === 'DIGITAL'
                                          ? 'Digital Payment'
                                          : 'Supplier Payment'}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                                    {tab === 'EXPENSES'
                                        ? 'All expenses sync to the Expenses report tab'
                                        : tab === 'DIGITAL'
                                          ? 'Log card and wallet receipts'
                                          : 'Record vendor payments — synced to supplier ledger'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {tab === 'SUPPLIER' && (
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            setAddSup(v => !v);
                                            setAddBank(false);
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/15 transition-all border border-orange-200 dark:border-orange-500/20"
                                    >
                                        <Truck size={13} /> New Supplier
                                    </motion.button>
                                )}
                                {tab === 'DIGITAL' && (
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => {
                                            setAddBank(v => !v);
                                            setAddSup(false);
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wide text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/15 transition-all border border-violet-200 dark:border-violet-500/20"
                                    >
                                        <Building2 size={13} /> Add Bank
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 space-y-5">
                        {/* Inline forms */}
                        <AnimatePresence>
                            {showAddSupplier && tab === 'SUPPLIER' && (
                                <motion.div
                                    key="qsup"
                                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <QuickAddSupplier
                                        onCreated={(id, name) => {
                                            setSelSup({ id, name });
                                            setAddSup(false);
                                        }}
                                        onCancel={() => setAddSup(false)}
                                    />
                                </motion.div>
                            )}
                            {showAddBank && tab === 'DIGITAL' && (
                                <motion.div
                                    key="qbank"
                                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <QuickAddBank
                                        onCreated={() => setAddBank(false)}
                                        onCancel={() => setAddBank(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ══ EXPENSES ══ */}
                        {tab === 'EXPENSES' && (
                            <>
                                {/* Category grid */}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 mb-3">
                                        Select Category
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {EXP_CATS.map(c => {
                                            const active = expCat === c.value;
                                            return (
                                                <motion.button
                                                    key={c.value}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setExpCat(c.value)}
                                                    className={clsx(
                                                        'relative overflow-hidden px-3 py-3 rounded-xl text-left transition-all duration-200 border-2 group',
                                                        active
                                                            ? 'border-transparent shadow-xl'
                                                            : 'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.07] hover:border-gray-200 dark:hover:border-white/[0.12]'
                                                    )}
                                                    style={
                                                        active
                                                            ? {
                                                                  background: `linear-gradient(135deg,${c.from},${c.to})`,
                                                                  boxShadow: `0 4px 20px ${c.glow}`,
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {!active && (
                                                        <div
                                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            style={{ background: `${c.from}08` }}
                                                        />
                                                    )}
                                                    <span className="text-xl block">{c.emoji}</span>
                                                    <span
                                                        className={clsx(
                                                            'text-xs font-black mt-1 block',
                                                            active
                                                                ? 'text-white'
                                                                : 'text-gray-700 dark:text-slate-300'
                                                        )}
                                                    >
                                                        {c.label}
                                                    </span>
                                                    {c.needsStaff && (
                                                        <span
                                                            className={clsx(
                                                                'text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase mt-0.5 inline-block',
                                                                active
                                                                    ? 'bg-white/25 text-white'
                                                                    : 'bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                                            )}
                                                        >
                                                            Staff Pay
                                                        </span>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Salary → Staff picker */}
                                <AnimatePresence>
                                    {needsStaff && (
                                        <motion.div
                                            key="staff-picker"
                                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                                overflow: 'visible',
                                            }}
                                            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div
                                                className="rounded-2xl border-2 p-4 space-y-3"
                                                style={{
                                                    borderColor: '#8b5cf640',
                                                    background:
                                                        'linear-gradient(135deg,#8b5cf608,transparent)',
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                                                        <Users
                                                            size={15}
                                                            className="text-violet-600 dark:text-violet-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white">
                                                            Select Staff Receiving Salary
                                                        </p>
                                                        <p className="text-xs text-violet-600 dark:text-violet-400">
                                                            Payment will post to their ledger
                                                            instantly
                                                        </p>
                                                    </div>
                                                </div>
                                                <QuickSelect
                                                    value={selectedStaffId}
                                                    onChange={e => setStaffId(e.target.value)}
                                                >
                                                    <option
                                                        value=""
                                                        className="bg-white dark:bg-gray-900 text-gray-400"
                                                    >
                                                        — Choose staff member —
                                                    </option>
                                                    {activeStaff.length === 0 && (
                                                        <option disabled>
                                                            No active staff registered yet
                                                        </option>
                                                    )}
                                                    {activeStaff.map(s => (
                                                        <option
                                                            key={s.userId}
                                                            value={s.userId}
                                                            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                        >
                                                            {s.name} —{' '}
                                                            {String(s.role).replace(/_/g, ' ')}
                                                        </option>
                                                    ))}
                                                </QuickSelect>
                                                {staffMember && (
                                                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                                                        <Wallet
                                                            size={14}
                                                            className="text-violet-600 dark:text-violet-400 shrink-0"
                                                        />
                                                        <p className="text-sm font-black text-violet-700 dark:text-violet-300">
                                                            ✓ Will post salary to{' '}
                                                            <strong>{staffMember.name}</strong>'s
                                                            Staff Accounts tab
                                                        </p>
                                                    </div>
                                                )}
                                                {needsStaff && !staffMember && (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                                        <AlertTriangle
                                                            size={13}
                                                            className="text-amber-500 shrink-0"
                                                        />
                                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                            Select a staff member to link this
                                                            salary payment
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <QuickInput
                                    label="Note (optional)"
                                    type="text"
                                    placeholder="Brief description of this expense…"
                                    value={expNote}
                                    onChange={e => setExpNote(e.target.value)}
                                />
                            </>
                        )}

                        {/* ══ DIGITAL ══ */}
                        {tab === 'DIGITAL' && (
                            <>
                                <QuickSelect
                                    label="Payment Method *"
                                    value={digitalMethod}
                                    onChange={e => setDMethod(e.target.value)}
                                >
                                    <option
                                        value=""
                                        className="bg-white dark:bg-gray-900 text-gray-400"
                                    >
                                        — Select method —
                                    </option>
                                    <optgroup
                                        label="Digital Wallets"
                                        className="bg-white dark:bg-gray-900 font-bold"
                                    >
                                        {WALLETS.map(m => (
                                            <option
                                                key={m}
                                                value={m}
                                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                            >
                                                {m}
                                            </option>
                                        ))}
                                    </optgroup>
                                    {bankAccounts.length > 0 && (
                                        <optgroup
                                            label="Bank Accounts"
                                            className="bg-white dark:bg-gray-900 font-bold"
                                        >
                                            {bankAccounts.map(b => (
                                                <option
                                                    key={b.accountId}
                                                    value={b.name}
                                                    className="bg-white dark:bg-gray-900"
                                                >
                                                    {b.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </QuickSelect>
                                <QuickSelect
                                    label="Post to Bank Account (optional)"
                                    value={selectedAccount}
                                    onChange={e => setSelAcc(e.target.value)}
                                >
                                    <option
                                        value=""
                                        className="bg-white dark:bg-gray-900 text-gray-400"
                                    >
                                        — Track separately —
                                    </option>
                                    {bankAccounts.map(b => (
                                        <option
                                            key={b.accountId}
                                            value={b.accountId}
                                            className="bg-white dark:bg-gray-900"
                                        >
                                            {b.name}
                                        </option>
                                    ))}
                                </QuickSelect>
                            </>
                        )}

                        {/* ══ SUPPLIER ══ */}
                        {tab === 'SUPPLIER' && (
                            <QuickSelect
                                label="Select Supplier *"
                                value={selectedSupplier?.id || ''}
                                onChange={e => {
                                    const s = suppliers.find(x => x.supplierId === e.target.value);
                                    setSelSup(s ? { id: s.supplierId, name: s.name } : null);
                                }}
                            >
                                <option
                                    value=""
                                    className="bg-white dark:bg-gray-900 text-gray-400"
                                >
                                    — Choose supplier —
                                </option>
                                {suppliers.length === 0 && (
                                    <option disabled>
                                        No suppliers yet — click "New Supplier" above
                                    </option>
                                )}
                                {suppliers.map(s => (
                                    <option
                                        key={s.supplierId}
                                        value={s.supplierId}
                                        className="bg-white dark:bg-gray-900"
                                    >
                                        {s.name} — {s.type.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </QuickSelect>
                        )}

                        {/* Amount + Add row */}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <QuickInput
                                    label="Amount (₨)"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key !== 'Enter') return;
                                        if (tab === 'EXPENSES') addExpenseTx();
                                        else if (tab === 'DIGITAL') addDigitalTx();
                                        else addSupplierTx();
                                    }}
                                    unit="₨"
                                    className="!text-2xl !font-black"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={
                                    tab === 'EXPENSES'
                                        ? addExpenseTx
                                        : tab === 'DIGITAL'
                                          ? addDigitalTx
                                          : addSupplierTx
                                }
                                disabled={
                                    !amount ||
                                    parseFloat(amount) <= 0 ||
                                    (tab === 'EXPENSES' && needsStaff && !selectedStaffId)
                                }
                                className="h-[54px] px-7 rounded-2xl flex items-center gap-2 text-base font-black text-white uppercase tracking-wider shadow-xl shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background:
                                        amount && parseFloat(amount) > 0
                                            ? `linear-gradient(135deg,${activeTab.from},${activeTab.to})`
                                            : '#e5e7eb',
                                    boxShadow:
                                        amount && parseFloat(amount) > 0
                                            ? `0 6px 24px ${activeTab.from}45`
                                            : 'none',
                                }}
                            >
                                <Plus size={18} /> Add
                            </motion.button>
                        </div>
                    </div>
                </WizardCard>
            </motion.div>

            {/* ── Transaction List ── */}
            {displayList.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2.5">
                    <div className="flex items-center gap-3 px-1">
                        <div className="h-px flex-1 bg-gray-100 dark:bg-white/[0.06]" />
                        <p
                            className="text-xs font-black uppercase tracking-widest shrink-0"
                            style={{ color: activeTab.from }}
                        >
                            {displayList.length} {activeTab.label} Record
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
                                className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-colors group"
                                style={{
                                    boxShadow:
                                        '0 2px 12px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)',
                                }}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg,${activeTab.from},${activeTab.to})`,
                                            boxShadow: `0 4px 14px ${activeTab.from}30`,
                                        }}
                                    >
                                        {tab === 'EXPENSES' ? (
                                            <Receipt size={16} className="text-white" />
                                        ) : tab === 'DIGITAL' ? (
                                            <SmartphoneNfc size={16} className="text-white" />
                                        ) : (
                                            <Truck size={16} className="text-white" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 dark:text-white truncate">
                                            {tx.description ||
                                                tx.method ||
                                                tx.supplierName ||
                                                tx.expenseCategory}
                                        </p>
                                        {tx.staffName && (
                                            <p className="text-sm font-black text-violet-600 dark:text-violet-400">
                                                👤 {tx.staffName}
                                            </p>
                                        )}
                                        {tx.accountName && (
                                            <p className="text-xs font-mono text-gray-400 dark:text-slate-600">
                                                → {tx.accountName}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-slate-600 mt-0.5">
                                            {new Date(tx.timestamp).toLocaleTimeString('en-PK', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <p
                                        className="text-xl font-black font-mono"
                                        style={{ color: activeTab.from }}
                                    >
                                        ₨ {fmt(tx.amount)}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.12 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeTx(tx.id)}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={15} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty state */}
            {displayList.length === 0 && (
                <motion.div
                    variants={fadeUp}
                    className="py-14 text-center rounded-2xl bg-gray-50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/[0.07]"
                >
                    <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg,${activeTab.from}18,${activeTab.to}10)`,
                        }}
                    >
                        {tab === 'EXPENSES' ? (
                            <Receipt size={26} style={{ color: activeTab.from }} />
                        ) : tab === 'DIGITAL' ? (
                            <SmartphoneNfc size={26} style={{ color: activeTab.from }} />
                        ) : (
                            <Truck size={26} style={{ color: activeTab.from }} />
                        )}
                    </div>
                    <p className="text-base font-black uppercase tracking-widest text-gray-400 dark:text-slate-600">
                        No {activeTab.label}s Yet
                    </p>
                    <p className="text-sm text-gray-300 dark:text-slate-700 mt-1">
                        Use the form above to record your first entry
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};
