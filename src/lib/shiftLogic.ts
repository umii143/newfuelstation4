import { ShiftClosingWizardState, Transaction } from '@/types';

/**
 * Centrally calculates financial totals for a shift closing wizard state.
 * This logic is shared between Fuel and CNG modules to ensure consistency.
 */
export const calculateShiftTotals = (
    state: ShiftClosingWizardState
): Partial<ShiftClosingWizardState> => {
    const { readings, transactions, actualCash, cashInHand } = state;

    // 1. Calculate Fuel Revenue
    const totalFuelRevenue = readings.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0);

    // 2. Aggregate Transactions by Type
    const totalRecoveries = transactions
        .filter(t => t.type === 'RECOVERY')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
        .filter(t => t.type === 'CREDIT_SALE')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE' || t.type === 'SUPPLIER_PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDigitalPayments = transactions
        .filter(t => t.type === 'DIGITAL_PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBankDeposits = transactions
        .filter(t => t.type === 'BANK_DEPOSIT')
        .reduce((sum, t) => sum + t.amount, 0);

    const _totalAdvances = transactions
        .filter(t => t.type === 'STAFF_ADVANCE')
        .reduce((sum, t) => sum + t.amount, 0);
    void _totalAdvances;

    const _totalDiscounts = transactions
        .filter(t => t.type === 'DISCOUNT')
        .reduce((sum, t) => sum + t.amount, 0);
    void _totalDiscounts;

    // 3. Calculate Total Deductions (everything that isn't recovery but reduces cash)
    const totalDeductions = transactions
        .filter(t => t.type !== 'RECOVERY')
        .reduce((sum, t) => sum + t.amount, 0);

    // 4. Final Financial Reconciliation
    // Expected Cash = Revenue + Recoveries - (All other non-cash transactions/deductions)
    const expectedCash = totalFuelRevenue + totalRecoveries - totalDeductions;

    // Variance = (Physical Cash + Cash in Hand + Bank Deposits + Digital) - Expected
    const variance =
        actualCash + (cashInHand || 0) + totalBankDeposits + totalDigitalPayments - expectedCash;

    const variancePercentage = expectedCash !== 0 ? (variance / expectedCash) * 100 : 0;

    return {
        totalFuelRevenue,
        totalRecoveries,
        totalCredits,
        totalExpenses,
        totalDigitalPayments,
        totalBankDeposits,
        totalDeductions,
        expectedCash,
        variance,
        variancePercentage,
        // Aliases for compatibility
        recoveriesTotal: totalRecoveries,
        expensesTotal: totalExpenses,
        creditsTotal: totalCredits,
    };
};

/**
 * Processes a single shift transaction by delegating to relevant domain stores.
 * Centralizing this ensures audit logs and accounting rules are applied uniformly.
 */
export const processShiftTransaction = async (
    tx: Transaction,
    meta: { staffId: string; staffName: string; shiftId: string }
) => {
    // Dynamically import stores to avoid circular dependencies
    const { useCustomerStore } = await import('@/stores/dataStores');
    const { useCustomerLedgerStore } = await import('@/stores/ledgerStore');
    const { useAccountingStore } = await import('@/stores/accountingStore');

    const { staffId, staffName, shiftId } = meta;
    const date = new Date().toISOString().split('T')[0];

    if ((tx.type === 'CREDIT_SALE' || tx.type === 'RECOVERY') && tx.customerId) {
        if (tx.type === 'CREDIT_SALE') {
            await useCustomerStore
                .getState()
                .recordCreditSale(tx.customerId, tx.amount, tx.id, staffName);
        } else {
            await useCustomerStore
                .getState()
                .recordPayment(tx.customerId, tx.amount, 'CASH', staffName);
        }

        useCustomerLedgerStore.getState().addEntry({
            customerId: tx.customerId,
            customerName: tx.customerName || 'Unknown',
            date,
            description:
                tx.type === 'CREDIT_SALE'
                    ? `Credit Sale: ${tx.description || 'Fuel Shift'}`
                    : `Credit Recovery - ${staffName}`,
            debit: tx.type === 'CREDIT_SALE' ? tx.amount : 0,
            credit: tx.type === 'RECOVERY' ? tx.amount : 0,
            reference: tx.id,
            staffId,
            staffName,
            type: tx.type,
            shiftId,
        });

        useAccountingStore.getState().postCustomerTransaction({
            customerId: tx.customerId,
            customerName: tx.customerName || 'Unknown',
            date,
            description:
                tx.type === 'CREDIT_SALE'
                    ? `Fuel Shift Credit sale - ${staffName}`
                    : `Fuel Shift Recovery - ${staffName}`,
            debit: tx.type === 'CREDIT_SALE' ? tx.amount : 0,
            credit: tx.type === 'RECOVERY' ? tx.amount : 0,
            reference: tx.id,
            staffId,
            staffName,
            type: tx.type,
            shiftId,
        });
    } else if (tx.type === 'EXPENSE') {
        useAccountingStore.getState().postCashTransaction({
            accountId: 'CASH-MAIN',
            accountName: 'Main Cash',
            date,
            description: tx.description || 'General Shift Expense',
            debit: 0,
            credit: tx.amount,
            reference: tx.id,
            staffId,
            staffName,
            type: 'EXPENSE',
            shiftId,
            counterpartyType: 'EXPENSE',
            counterpartyName: tx.expenseCategory || 'General',
        });
    }
};
