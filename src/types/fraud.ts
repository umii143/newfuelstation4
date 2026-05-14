import { FuelType, SoftDeletable } from './index';

// ============================================
// FRAUD & TRACEABILITY TYPES (MODULE 16)
// ============================================

export type FraudRuleId =
    | 'FR-01' // Stock received < dispatched > 2%
    | 'FR-02' // Revenue < pump meter expected
    | 'FR-03' // Cash shortage < expected > 500
    | 'FR-04' // Dip reading variance > 50L/day or 200L/week
    | 'FR-05' // Edit attempt on verified record
    | 'FR-06' // Off-hours entry
    | 'FR-07' // Station profit margin drops > 20%
    | 'FR-08' // Deletion attempt (blocked)
    | 'FR-09' // Stock not confirmed in 4 hours
    | 'FR-10' // Expense without receipt
    | 'FR-11' // Credit sale exceeds limit
    | 'FR-12' // Pump meter decreased
    | 'FR-13' // Same day entry edited > 1 time
    | 'FR-14' // Multiple failed PIN
    | 'FR-15' // Unrecognized device login
    | 'FR-16' // Revenue drop > 30%
    | 'FR-17' // Tanker seal broken
    | 'FR-18' // Debt > 60 days
    | 'FR-19' // Cash variance > 2000
    | 'FR-20'; // Large expense approved without owner

export type AlertSeverity = 'CRITICAL' | 'WARNING';
export type FraudAlertStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'FALSE_ALARM';

export interface FraudAlert extends SoftDeletable {
    alertId: string;
    ruleId: FraudRuleId;
    severity: AlertSeverity;
    stationId?: string;
    triggeredAt: string;
    triggeredByRecord?: string; // ID of the transaction/record
    details: string;
    expectedValue?: number;
    actualValue?: number;
    variance?: number;
    financialImpact: number; // Estimated loss in PKR
    status: FraudAlertStatus;
    resolvedBy?: string; // Owner User ID
    resolvedAt?: string;
    resolutionNote?: string;
    permanent: boolean; // TRUE (cannot be deleted, ever)
}

// ============================================
// OWNER STOCK POOL & DISPATCH (MODULE 1 & 2)
// ============================================

export interface StockPurchase extends SoftDeletable {
    purchaseId: string;
    purchaseDate: string;
    supplierId: string;
    fuelType: FuelType;
    quantityLiters: number;
    ratePerLiter: number;
    totalCost: number;
    invoiceNumber: string;
    invoicePhotoUrl?: string; // S3/Storage URL
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT';
    bankAccountId?: string;
    paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT_DUE';
    amountPaid: number;
    amountDue: number;
    dueDate?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export type DispatchStatus = 'IN_TRANSIT' | 'CONFIRMED' | 'DISPUTED' | 'OVERDUE';

export interface StockDispatch extends SoftDeletable {
    dispatchId: string;
    dispatchDate: string;
    fromPool: 'OWNER_POOL'; // Currently fixed
    toStationId: string;
    fuelType: FuelType;
    quantityDispatched: number; // Liters
    tankerNumber: string;
    driverName: string;
    driverCnic: string;
    driverPhone: string;
    challanNumber: string;
    purchaseRef?: string; // Linked purchase ID(s)
    costPricePerLiter: number; // FIFO avg from owner pool
    totalCostValue: number; // Dispatched Qty * Cost Price
    status: DispatchStatus;
    
    // Receipt Confirmation Details
    receivedAt?: string;
    managerId?: string; // Manager who confirmed
    beforeDipLiters?: number;
    afterDipLiters?: number;
    quantityReceived?: number;
    tankerSealIntact?: boolean;
    receiptNotes?: string;
    
    createdBy: string; // Owner who dispatched
    createdAt: string;
}
