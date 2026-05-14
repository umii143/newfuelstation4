import { useSettingsStore } from '@/stores/authStore';
import { useCashBankStore } from '@/stores/ledgerStore';
import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    DollarSign,
    Loader2,
    Plus,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { InlineFormPanel, QuickInput, QuickSelect, WizardCard } from './WizardCard';

const spring = { type: 'spring' as const, stiffness: 280, damping: 26 };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: spring } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function fmt(n: number) {
    return n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Quick-Add Bank Account (reusable inline) ──────────────────────────── */
const QuickAddBank: React.FC<{ onCreated: () => void; onCancel: () => void }> = ({
    onCreated,
    onCancel,
}) => {
    const { addAccount } = useCashBankStore();
    const { settings } = useSettingsStore();
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [accNo, setAccNo] = useState('');
    const [saving, setSaving] = useState(false);

    const submit = () => {
        if (!name.trim()) return;
        setSaving(true);
        addAccount({
            name: name.trim(),
            type: 'BANK',
            bankName: bank.trim() || name.trim(),
            accountNumber: accNo.trim(),
            openingBalance: 0,
            businessUnit: settings.businessUnit as 'FUEL' | 'CNG' | 'LUBE',
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
            accentColor="#6366f1"
            icon={<Building2 size={12} style={{ color: '#6366f1' }} />}
        >
            <QuickInput
                label="Account Label *"
                type="text"
                placeholder="e.g. MCB Main"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
                <QuickInput
                    label="Bank Name"
                    type="text"
                    placeholder="e.g. MCB"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                />
                <QuickInput
                    label="Account #"
                    type="text"
                    placeholder="Optional"
                    value={accNo}
                    onChange={e => setAccNo(e.target.value)}
                />
            </div>
            <div className="flex gap-2 pt-1">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={submit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-colors"
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
                    className="px-4 py-2.5 rounded-xl text-xs font-black text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors uppercase tracking-widest"
                >
                    Cancel
                </button>
            </div>
        </InlineFormPanel>
    );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
export const StepTreasury: React.FC<StepProps> = ({ onUpdate, data }) => {
    const readings = data?.readings || [];
    const transactions = data?.transactions || [];

    const totalRevenue = readings.reduce((s, r) => s + (r.revenue || 0), 0);
    const credits = transactions
        .filter((t: any) => t.type === 'CREDIT_SALE')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const recoveries = transactions
        .filter((t: any) => t.type === 'RECOVERY')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const expenses = transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const digital = transactions
        .filter((t: any) => t.type === 'DIGITAL_PAYMENT')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const supplierPay = transactions
        .filter((t: any) => t.type === 'SUPPLIER_PAYMENT')
        .reduce((s: number, t: any) => s + t.amount, 0);
    const bankDeposits = transactions
        .filter((t: any) => t.type === 'BANK_DEPOSIT')
        .reduce((s: number, t: any) => s + t.amount, 0);

    const expectedCash =
        totalRevenue - credits + recoveries - expenses - digital - supplierPay - bankDeposits;
    const actualCash = data?.actualCash ?? null;
    const variance = actualCash !== null ? actualCash - expectedCash : null;
    const isBalanced = variance !== null && Math.abs(variance) < 100;

    const { getAccounts } = useCashBankStore();
    const bankAccounts = getAccounts('BANK');

    const [depositAcct, setDepositAcct] = useState('');
    const [depositAmt, setDepositAmt] = useState('');
    const [showAddBank, setShowAddBank] = useState(false);

    const addDeposit = () => {
        const amt = parseFloat(depositAmt);
        if (isNaN(amt) || amt <= 0 || !depositAcct) return;
        const acc = bankAccounts.find(a => a.accountId === depositAcct);
        onUpdate({
            transactions: [
                ...transactions,
                {
                    id: crypto.randomUUID(),
                    type: 'BANK_DEPOSIT',
                    amount: amt,
                    accountId: acc?.accountId,
                    accountName: acc?.name || depositAcct,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        setDepositAmt('');
        setDepositAcct('');
    };

    const removeDeposit = (id: string) =>
        onUpdate({ transactions: transactions.filter((t: any) => t.id !== id) });
    const deposits = transactions.filter((t: any) => t.type === 'BANK_DEPOSIT');

    const flowRows = [
        { label: 'Fuel Revenue', value: totalRevenue, dir: 'in' as const, color: '#10b981' },
        { label: 'Recoveries', value: recoveries, dir: 'in' as const, color: '#06b6d4' },
        { label: 'Credit Sales (Deducted)', value: credits, dir: 'out' as const, color: '#f59e0b' },
        { label: 'Expenses', value: expenses, dir: 'out' as const, color: '#ef4444' },
        { label: 'Digital Payments', value: digital, dir: 'out' as const, color: '#8b5cf6' },
        { label: 'Supplier Payments', value: supplierPay, dir: 'out' as const, color: '#f97316' },
        { label: 'Bank Deposits', value: bankDeposits, dir: 'out' as const, color: '#6366f1' },
    ];

    const variantColor = isBalanced
        ? '#10b981'
        : variance !== null && variance > 0
          ? '#6366f1'
          : '#ef4444';
    const variantLabel = isBalanced
        ? 'Balanced'
        : variance !== null && variance > 0
          ? 'Over Cash'
          : 'Short Cash';
    const variantIcon = isBalanced ? (
        <CheckCircle2 size={18} style={{ color: variantColor }} />
    ) : (
        <AlertTriangle size={18} style={{ color: variantColor }} />
    );

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4 py-3">
            {/* ── Cash Flow Table ── */}
            <motion.div variants={fadeUp}>
                <WizardCard noPad accent="linear-gradient(90deg,#6366f1,#8b5cf6)">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Cash Flow Calculation
                        </p>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                        {flowRows.map(row => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between px-5 py-3"
                            >
                                <div className="flex items-center gap-2">
                                    {row.dir === 'in' ? (
                                        <TrendingUp
                                            size={13}
                                            style={{ color: row.color }}
                                            className="shrink-0"
                                        />
                                    ) : (
                                        <TrendingDown
                                            size={13}
                                            style={{ color: row.color }}
                                            className="shrink-0"
                                        />
                                    )}
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                                        {row.label}
                                    </span>
                                </div>
                                <span
                                    className="text-sm font-black font-mono"
                                    style={{ color: row.color }}
                                >
                                    {row.dir === 'in' ? '+' : '−'} ₨ {fmt(row.value)}
                                </span>
                            </div>
                        ))}
                        {/* Expected total */}
                        <div className="flex items-center justify-between px-5 py-4 bg-indigo-50 dark:bg-indigo-500/10">
                            <span className="text-sm font-black text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                                Expected Cash
                            </span>
                            <span className="text-xl font-black font-mono text-indigo-700 dark:text-indigo-300">
                                ₨ {fmt(expectedCash)}
                            </span>
                        </div>
                    </div>
                </WizardCard>
            </motion.div>

            {/* ── Bank Deposit Section ── */}
            <motion.div variants={fadeUp}>
                <WizardCard
                    noPad
                    accent="linear-gradient(90deg,#6366f1,#8b5cf6)"
                    glowColor="rgba(99,102,241,0.08)"
                >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 size={13} className="text-indigo-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                Bank Deposits
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddBank(v => !v)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                        >
                            <Plus size={11} /> Add Bank
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {showAddBank && (
                            <QuickAddBank
                                onCreated={() => setShowAddBank(false)}
                                onCancel={() => setShowAddBank(false)}
                            />
                        )}
                        {bankAccounts.length === 0 && !showAddBank && (
                            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                                <Building2
                                    size={14}
                                    className="text-gray-300 dark:text-slate-700"
                                />
                                <p className="text-xs font-medium text-gray-400 dark:text-slate-600">
                                    No bank accounts registered yet. Add one above to record
                                    deposits.
                                </p>
                            </div>
                        )}
                        {bankAccounts.length > 0 && (
                            <div className="flex gap-2">
                                <QuickSelect
                                    label="Bank Account *"
                                    value={depositAcct}
                                    onChange={e => setDepositAcct(e.target.value)}
                                >
                                    <option
                                        value=""
                                        className="bg-white dark:bg-gray-900 text-gray-400"
                                    >
                                        — Select account —
                                    </option>
                                    {bankAccounts.map(b => (
                                        <option
                                            key={b.accountId}
                                            value={b.accountId}
                                            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                        >
                                            {b.name}
                                        </option>
                                    ))}
                                </QuickSelect>
                            </div>
                        )}
                        {bankAccounts.length > 0 && (
                            <div className="flex gap-2">
                                <QuickInput
                                    type="number"
                                    placeholder="Deposit Amount (₨)"
                                    value={depositAmt}
                                    onChange={e => setDepositAmt(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addDeposit()}
                                    unit="₨"
                                    className="!text-lg"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={addDeposit}
                                    disabled={!depositAcct || !depositAmt}
                                    className="px-5 h-[54px] rounded-xl flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Plus size={15} /> Log
                                </motion.button>
                            </div>
                        )}
                        {deposits.map((d: any) => (
                            <div
                                key={d.id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20"
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 size={13} className="text-indigo-500 shrink-0" />
                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                        {d.accountName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-sm font-black font-mono text-indigo-700 dark:text-indigo-400">
                                        ₨ {fmt(d.amount)}
                                    </p>
                                    <button
                                        onClick={() => removeDeposit(d.id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                    >
                                        <TrendingDown size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </WizardCard>
            </motion.div>

            {/* ── Physical Cash Count ── */}
            <motion.div variants={fadeUp}>
                <WizardCard
                    accent={
                        variance !== null
                            ? `linear-gradient(90deg, ${variantColor}, ${variantColor}99)`
                            : 'linear-gradient(90deg,#94a3b8,#64748b)'
                    }
                    glowColor={variance !== null ? `${variantColor}18` : undefined}
                >
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 mb-3">
                        <DollarSign size={12} className="text-indigo-500" />
                        Physical Cash Count *
                    </label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 dark:text-slate-700 pointer-events-none">
                            ₨
                        </span>
                        <motion.input
                            type="number"
                            placeholder="0.00"
                            value={actualCash ?? ''}
                            onChange={e =>
                                onUpdate({ actualCash: parseFloat(e.target.value) || 0 })
                            }
                            whileFocus={{ scale: 1.01 }}
                            className={clsx(
                                'w-full pl-10 pr-5 py-5 rounded-2xl text-3xl font-black font-mono outline-none transition-all duration-200',
                                'bg-gray-50 dark:bg-white/[0.06]',
                                'text-gray-900 dark:text-white',
                                'placeholder:text-gray-200 dark:placeholder:text-slate-800',
                                actualCash !== null
                                    ? 'border-2 ring-4 ring-opacity-20'
                                    : 'border-2 border-gray-200 dark:border-white/[0.1]'
                            )}
                            style={
                                actualCash !== null
                                    ? {
                                          borderColor: variantColor,
                                          boxShadow: `0 0 0 4px ${variantColor}18`,
                                      }
                                    : {}
                            }
                        />
                    </div>
                </WizardCard>
            </motion.div>

            {/* ── Variance Card ── */}
            {variance !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 overflow-hidden"
                    style={{
                        borderColor: `${variantColor}40`,
                        background: `${variantColor}08`,
                        boxShadow: `0 4px 20px ${variantColor}18`,
                    }}
                >
                    <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                            {variantIcon}
                            <div>
                                <p className="text-base font-black" style={{ color: variantColor }}>
                                    {variantLabel}
                                </p>
                                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 mt-0.5">
                                    {isBalanced
                                        ? 'Cash perfectly reconciled. Ready to commit.'
                                        : `Difference of ₨ ${fmt(Math.abs(variance))}`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-600">
                                Variance
                            </p>
                            <p
                                className="text-2xl font-black font-mono"
                                style={{ color: variantColor }}
                            >
                                {variance > 0 ? '+' : ''}₨ {fmt(variance)}
                            </p>
                        </div>
                    </div>
                    {/* Animated bar */}
                    <div className="px-5 pb-4">
                        <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: `${variantColor}15` }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    background: `linear-gradient(90deg, ${variantColor}cc, ${variantColor})`,
                                }}
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(100, Math.abs(variance / Math.max(expectedCash, 1)) * 500)}%`,
                                }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};
