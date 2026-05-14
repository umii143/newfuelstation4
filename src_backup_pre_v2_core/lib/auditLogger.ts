import { useAuditStore } from '@/stores/ledgerStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Super Duper Audit Logger
 * A centralized utility for precision tracking of every minor to minor activity.
 */
export const auditLogger = {
    /**
     * Log a business activity with precision.
     * @param module The business unit or module (FUEL, CNG, LUBE, LEDGER, etc.)
     * @param action The specific action taken (e.g., 'PRICE_CHANGE', 'SHIFT_CLOSE', 'DEBT_RECOVERY')
     * @param details A human-readable description of the change, including old vs new values if applicable.
     * @param reference Optional ID for the entity (Shift ID, Customer ID, etc.)
     */
    log: (
        module: string,
        action: string,
        details: string,
        reference?: string
    ) => {
        const { user } = useAuthStore.getState();
        const { addLog } = useAuditStore.getState();

        console.log(`[AUDIT] [${module}] ${action}: ${details}`);

        addLog({
            module,
            action,
            details: reference ? `${details} (Ref: ${reference})` : details,
            userId: (user as any)?.userId || (user as any)?.id || 'SYSTEM',
            userName: (user as any)?.name || 'System Process',
            severity: 'INFO',
        });
    },

    // Specialized semantic loggers for convenience
    priceChange: (item: string, oldPrice: number, newPrice: number, bu: 'FUEL' | 'CNG' | 'LUBE') => {
        auditLogger.log(
            bu,
            'PRICE_UPDATE',
            `${item} rate adjusted from ₨${oldPrice} to ₨${newPrice}`,
            item
        );
    },

    inventoryAdjustment: (item: string, change: number, reason: string, bu: 'FUEL' | 'CNG' | 'LUBE') => {
        auditLogger.log(
            bu,
            'STOCK_ADJUSTMENT',
            `${item} inventory ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)}. Reason: ${reason}`,
            item
        );
    },

    financialTransaction: (type: string, amount: number, counterparty: string, bu: 'FUEL' | 'CNG' | 'LUBE') => {
        auditLogger.log(
            bu,
            type,
            `${type} recorded: ₨${amount.toLocaleString()} ${type === 'RECOVERY' ? 'from' : 'to'} ${counterparty}`,
            counterparty
        );
    }
};
