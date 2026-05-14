// ============================================
// MOTORWAY OIL - TYPE DEFINITIONS
// Enterprise Edition v4.0
// ============================================

// User Roles (FR-12)
export type UserRole =
    | 'OWNER'
    | 'MANAGER'
    | 'CASHIER'
    | 'ATTENDANT'
    | 'AUDITOR'
    | 'SECURITY_GUARD'
    | 'SALESMAN'
    | 'CLERK'
    | 'CLEANER'
    | 'OFFICE_STAFF';

// ============================================
// SOFT-DELETE MIXIN
// Every record that supports soft-delete must extend this.
// Hard deletes are FORBIDDEN — use is_deleted flag instead.
// ============================================
export interface SoftDeletable {
    is_deleted?: boolean;
    deleted_at?: string | null;
    deleted_by?: string | null;
    updated_at?: string;
    updated_by?: string;
}

// User/Staff
export interface User {
    userId: string;
    name: string;
    phone: string;
    email?: string;
    role: UserRole;
    pin?: string; // Hashed
    pinExpiry?: string;
    theme: 'glassy-white' | 'deep-obsidian';
    language: 'en' | 'ur' | 'ar';
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
    createdAt: string;
    lastLogin?: string;
    performance?: {
        totalSales: number;
        avgVariance: number;
        rank: number;
    };
    // Salary & HR Fields
    baseSalary?: number;
    joiningDate?: string;
    cnic?: string;
    emergencyContact?: string;
    bloodGroup?: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    organizationId?: string;
    stationId?: string;
}

// Station
export interface Station {
    stationId: string;
    name: string;
    location?: {
        lat: number;
        lng: number;
    };
    ograLicenceNumber?: string;
    owner?: string;
    establishmentDate?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    settings: {
        currency: string;
        timezone: string;
        theme: string;
        language: string;
        taxRate: number;
    };
    createdAt: string;
}

// Fuel Types
export type FuelType = 'PETROL_92' | 'PETROL_95' | 'DIESEL' | 'PREMIUM_DIESEL' | 'CNG';

// Tank (FR-01)
export interface Tank {
    tankId: string;
    stationId: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    name: string;
    fuelType: FuelType;
    capacity: number; // Liters
    safeFillLevel?: number; // PRD requirement
    currentLevel: number;
    costPrice: number;
    salePrice: number;
    reorderPoint: number;
    lastUpdated: string;
    nozzles: string[]; // Nozzle IDs
}

// Nozzle
export interface Nozzle {
    nozzleId: string;
    tankId: string;
    name: string;
    number: number;
    fuelType?: FuelType; // PRD Requirement
    meterReadingBaseline?: number; // PRD Requirement
    installationDate?: string; // PRD Requirement
    calibrationCertificate?: string; // PRD Requirement
    currentReading: number;
    testVolume: number; // Default test volume per shift
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    costPrice?: number;
    rate?: number;
}

// Nozzle Sale Record (within Shift)
export interface NozzleSale {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    openingReading: number;
    closingReading: number;
    testVolume: number;
    netSales: number; // Liters
    rate: number;
    revenue: number;
    costPrice: number;
    margin: number;
    photoProof?: string;
}

// Shift Status
export type ShiftStatus = 'OPEN' | 'CLOSING' | 'CLOSED' | 'APPROVED';

// Shift (FR-02)
export interface Shift {
    shiftId: string;
    stationId: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    date: string;
    shiftNumber: number; // 1, 2, 3 for morning, afternoon, night
    shiftType: ShiftType;
    staffId: string;
    staffName: string;
    startTime: string;
    endTime?: string;
    openingReadings: OpeningReading[];
    tankReadings?: TankReading[]; // New PRD requirement for manual dip stick
    nozzleSales: NozzleSale[];
    totalLitersSold: number;
    totalRevenue: number;
    actualCash: number;
    expenses: number;
    recoveries: number; // Credit recoveries
    credits: number; // New credit sales
    supplierPayments: number;
    digitalCash: number; // Easypaisa, JazzCash, etc.
    bankDeposits: number;
    staffAdvances: number;
    discounts: number;
    cngRevenue: number;
    martCash: number;
    variance: number;
    variancePercentage: number;
    cashInHand?: number;
    status: ShiftStatus;
    approvedBy?: string;
    notes?: string;
    createdAt: string;
    closedAt?: string;
    // Detailed entries for audit trail
    bankDepositEntries?: BankDepositEntry[];
    digitalCashEntries?: DigitalCashEntry[];
    creditEntries?: CreditEntry[];
    recoveryEntries?: RecoveryEntry[];
    supplierPaymentEntries?: SupplierPaymentEntry[];
    // New unified transactions
    transactions?: Transaction[];
    expenseEntries?: ShiftExpenseEntry[];
    discountEntries?: DiscountEntry[];
}

// ============================================
// SHIFT WIZARD TYPES (16-Step System)
// ============================================

// Shift Types
export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';

// Shift Phase
export type ShiftPhase = 'OPENING' | 'CLOSING';

// Opening Meter Reading (Step 2)
export interface OpeningReading {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    reading: number;
    timestamp: string;
    photoUrl?: string;
}

// Tank Dip-Stick Reading (Step 2 - Manual Entry)
export interface TankReading {
    tankId: string;
    tankName: string;
    fuelType: FuelType;
    openingDip: number; // manual liters
    closingDip: number; // manual liters
}

// ============================================
// TRANSACTION TYPES FOR 7-STEP WIZARD
// ============================================

export type TransactionType =
    | 'CREDIT_SALE'
    | 'RECOVERY'
    | 'EXPENSE'
    | 'BANK_DEPOSIT'
    | 'DIGITAL_PAYMENT'
    | 'DISCOUNT'
    | 'SUPPLIER_PAYMENT'
    | 'STAFF_ADVANCE';

export type ExpenseCategory =
    | 'STATION_MAINTENANCE'
    | 'ELECTRICITY_GENERATOR'
    | 'HOME_PERSONAL'
    | 'OFFICER_TEA_LUNCH'
    | 'CARRIAGE_FREIGHT'
    | 'INAM_TIP'
    | 'OTHER';

// Transaction - Unified structure for all deductions/recoveries
export interface Transaction {
    id: string;
    tenantId?: string;
    businessUnit?: 'FUEL' | 'LUBE' | 'CNG';
    shiftId?: string;
    type: TransactionType;
    amount: number;

    // Customer-related (for credit sales, recoveries)
    customerId?: string;
    customerName?: string;

    // Supplier-related (for supplier payments)
    supplierId?: string;
    supplierName?: string;

    // Bank-related (for bank deposits)
    accountId?: string;
    accountName?: string;

    // Staff-related (for advances, bonuses)
    userId?: string;
    userName?: string;

    // Expense-specific
    expenseCategory?: ExpenseCategory | ShiftExpenseCategory | string;
    fuelType?: FuelType;
    staffId?: string;
    staffName?: string;

    digitalMethod?: DigitalPaymentMethod;
    method?: string;

    // General
    description?: string;
    liters?: number;
    referenceNo?: string;
    timestamp: string;
    syncedToLedger?: boolean;
    syncId?: string;
}

export interface NozzleReading {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    opening: number; // Manual entry
    closing: number; // Manual entry
    test: number;
    rate: number;
    costPrice: number;
    netLiters: number; // Calculated: closing - opening - test
    revenue: number; // Calculated: netLiters × rate
}

// Recovery Entry (Step 6)
export interface RecoveryEntry {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    shiftId: string;
    timestamp: string;
}

// Shift Expense Entry (Step 7)
export interface ShiftExpenseEntry {
    id: string;
    category: ShiftExpenseCategory;
    amount: number;
    note?: string;
    quantity?: number; // For carriage liters
    receiptUrl?: string;
    shiftId: string;
    timestamp: string;
}

export type ShiftExpenseCategory =
    | 'PETTY_CASH'
    | 'REPAIRS'
    | 'UTILITIES'
    | 'SALARY'
    | 'TRANSPORT'
    | 'CARRIAGE_FREIGHT'
    | 'INAM_TIP'
    | 'CLEANING'
    | 'OTHER';

// Credit Entry (Step 8)
export interface CreditEntry {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    previousBalance: number;
    newBalance: number;
    fuelType?: FuelType;
    liters?: number;
    remarks?: string;
    shiftId: string;
    timestamp: string;
}

// Supplier Payment Entry (Step 9)
export interface SupplierPaymentEntry {
    id: string;
    supplierId: string;
    supplierName: string;
    amount: number;
    previousPayable: number;
    newPayable: number;
    shiftId: string;
    timestamp: string;
}

// Digital Cash Entry (Step 11)
export interface DigitalCashEntry {
    id: string;
    method: DigitalPaymentMethod;
    amount: number;
    reference?: string;
    shiftId: string;
    timestamp: string;
}

export type DigitalPaymentMethod =
    | 'JAZZCASH'
    | 'EASYPAISA'
    | 'POS'
    | 'BANK_TRANSFER'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'OTHER';

// Bank Deposit Entry (Step 12)
export interface BankDepositEntry {
    id: string;
    bankName: string;
    accountNumber?: string;
    amount: number;
    depositSlipNumber?: string;
    shiftId: string;
    timestamp: string;
}

// Product Category
export type ProductCategory =
    | 'ENGINE_OIL'
    | 'GEAR_OIL'
    | 'BRAKE_FLUID'
    | 'COOLANT'
    | 'GREASE'
    | 'FILTER'
    | 'ACCESSORY'
    | 'GENERAL'
    | 'FUEL_PETROL'
    | 'FUEL_DIESEL'
    | 'OTHER';

// Product (FR-07)
export interface Product {
    productId: string;
    stationId: string;
    sku: string;
    name: string;
    category: ProductCategory;
    brand: string;
    unit: 'LITER' | 'PIECE' | 'KG' | 'SET';
    packSize: number;
    costPrice: number;
    salePrice: number;
    taxRate: number;
    barcode?: string;
    currentStock: number;
    reorderPoint: number;
    reorderQty: number;
    lastPurchaseDate?: string;
    imageUrl?: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Sale Item (POS)
export interface SaleItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxAmount: number;
    subtotal: number;
    totalAmount?: number;
}

// Payment Method
export type PaymentMethod = 'CASH' | 'CREDIT' | 'CARD' | 'DIGITAL' | 'BANK' | 'SPLIT';

// Sale Status
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'VOIDED' | 'REFUNDED';

// Sale (FR-08)
export interface Sale {
    saleId: string;
    stationId: string;
    shiftId: string;
    cashierId: string;
    cashierName: string;
    timestamp: string;
    items: SaleItem[];
    subtotal: number;
    taxAmount: number;
    discount: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    changeGiven?: number;
    customerId?: string;
    customerName?: string;
    status: SaleStatus;
    voidedBy?: string;
    voidReason?: string;
    receiptNumber: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Hold Order (Cart saved for later)
export interface HoldOrder {
    holdId: string;
    customerName: string;
    items: SaleItem[];
    subtotal: number;
    timestamp: string;
    expiresAt: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Customer (Khata) - FR-10
export interface Customer {
    customerId: string;
    stationId: string;
    name: string;
    phone: string;
    email?: string;
    cnic?: string;
    address?: string;
    creditLimit: number;
    currentBalance?: number;
    paymentTerms: 'CASH' | 'NET_7' | 'NET_15' | 'NET_30' | 'NET_60';
    status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
    guarantorName?: string;
    guarantorPhone?: string;
    lastTransaction?: string;
    createdAt: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Customer Transaction (Ledger)
export type TransactionType_OLD = 'SALE' | 'PAYMENT' | 'ADJUSTMENT' | 'OPENING_BALANCE';

export interface CustomerTransaction {
    transactionId: string;
    customerId: string;
    customerName: string;
    type: TransactionType_OLD;
    amount: number;
    balance: number;
    referenceId?: string; // Sale ID or Receipt #
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdBy: string;
    timestamp: string;
}

// Supplier (FR-11)
export interface Supplier {
    supplierId: string;
    stationId: string;
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address?: string;
    paymentTerms: 'CASH' | 'NET_30' | 'NET_60' | 'NET_90';
    currentPayable?: number;
    rating: number;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    type: 'FUEL_SUPPLIER' | 'LUBE_SUPPLIER' | 'PARTS_SUPPLIER' | 'SERVICE_PROVIDER' | 'OTHER';
    createdAt: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Purchase Order Status
export type POStatus = 'DRAFT' | 'APPROVED' | 'PARTIALLY_RECEIVED' | 'CLOSED' | 'CANCELLED';

// Purchase Order Item
export interface POItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    receivedQty: number;
    purchaseRate: number; // Added per user request
    salePrice: number; // Added to calculate margin
    margin: number; // (SalePrice - PurchaseRate)
    subtotal: number; // (PurchaseRate * Quantity)
}

// Purchase Order (FR-09)
export interface PurchaseOrder {
    poId: string;
    stationId: string;
    supplierId: string;
    supplierName: string;
    orderDate: string;
    expectedDate: string;
    items: POItem[];
    subtotal: number;
    taxAmount: number;
    carriage: number; // Karaya (Transport cost)
    totalAmount: number; // Total + Tax + Carriage (or as per business logic)
    recordedProfit: number; // Total Margin - Carriage
    status: POStatus;
    receivedDate?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Profit Ledger (New for physical register sync)
export interface ProfitLedgerEntry {
    id: string;
    date: string;
    type: 'FUEL_PURCHASE' | 'SHIFT_SALES' | 'LUBE_SALE' | 'ADJUSTMENT';
    referenceId: string;
    description: string;
    revenue: number;
    cost: number;
    carriage: number;
    netProfit: number;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    timestamp: string;
}

// Expense Category
export type ExpenseCategory_OLD =
    | 'SALARY'
    | 'UTILITIES'
    | 'MAINTENANCE'
    | 'SUPPLIES'
    | 'TRANSPORT'
    | 'MISCELLANEOUS';

// Expense
export interface Expense {
    expenseId: string;
    stationId: string;
    shiftId?: string;
    category: ExpenseCategory_OLD;
    description: string;
    amount: number;
    paidTo?: string;
    receiptUrl?: string;
    approvedBy?: string;
    createdBy: string;
    timestamp: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// Attendance Status (FR-13)
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';

// Leave Type
export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';

// Attendance Record
export interface Attendance {
    attendanceId: string;
    userId: string;
    userName: string;
    stationId: string;
    date: string;
    clockIn?: string;
    clockOut?: string;
    gpsLocation?: {
        lat: number;
        lng: number;
    };
    photoUrl?: string;
    status: AttendanceStatus;
    leaveType?: LeaveType;
    totalHours: number;
    overtimeHours: number;
    notes?: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

// CNG Specific Types (FR-04)
export interface CascadeBank {
    bankId: string;
    name: string;
    pressure: number; // bar
    maxPressure: number;
    status: 'FILLING' | 'DISPENSING' | 'IDLE' | 'MAINTENANCE';
}

export interface CNGCompressor {
    compressorId: string;
    stationId: string;
    pressure: number;
    maxPressure: number;
    temperature: number;
    operatingHours: number;
    nextMaintenanceHours: number;
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'FAULT';
    cascadeBanks: CascadeBank[];
}

// Dashboard KPI
export interface DashboardKPI {
    label: string;
    value: number;
    previousValue?: number;
    change?: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    format: 'currency' | 'number' | 'percentage' | 'liters';
    icon?: string;
    color?: 'blue' | 'emerald' | 'rose' | 'amber';
}

// Notification
export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

// App Settings
export interface AppSettings {
    theme: 'glassy-white' | 'deep-obsidian';
    language: 'en' | 'ur' | 'ar';
    currency: string;
    currencySymbol: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    fontSize: 'small' | 'normal' | 'large';
    highContrast: boolean;
    soundEnabled: boolean;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    stationName: string;
    businessName: string;
    businessLocation: string;
    businessPhone: string;
    cngRate?: number;
    cngMeterIds?: string[]; // CNG meter IDs
    easyPaisaAccount?: string; // EasyPaisa digital cash account
    jazzCashAccount?: string; // JazzCash digital cash account
    taxConfig?: {
        enabled: boolean;
        mode: 'INCLUSIVE' | 'EXCLUSIVE';
        defaultRate: number;
    };
    discountConfig?: {
        maxDiscountPercent: number;
        maxDiscountAmount: number;
        requireApprovalAbove: number;
    };
}

// ============================================
// LEDGER SYSTEM TYPES
// Master Principle: Menus = Entities, Transactions = Ledger Entries
// Balances are CALCULATED, never stored separately
// ============================================

// Base Ledger Entry (Universal structure for all ledgers)
export interface LedgerEntry {
    id: string;
    date: string;
    shiftId: string;
    staffId: string;
    staffName: string;
    type: string;
    reference: string;
    debit: number;
    credit: number;
    balance: number; // Running balance (calculated)
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    remarks?: string;
    description?: string;
    timestamp: string;
}

// Customer Ledger Types
export type CustomerLedgerType =
    | 'OPENING_BALANCE'
    | 'CREDIT_SALE' // Debit - increases receivable
    | 'RECOVERY' // Credit - decreases receivable
    | 'DISCOUNT' // Credit - reduces balance
    | 'DEBIT_NOTE' // Debit - increases receivable
    | 'CREDIT_NOTE'; // Credit - decreases receivable

export interface CustomerLedgerEntry extends LedgerEntry {
    customerId: string;
    customerName: string;
    type: CustomerLedgerType;
    fuelType?: FuelType;
    liters?: number;
    invoiceNumber?: string;
    receiptNumber?: string;
}

// Supplier Ledger Types
export type SupplierLedgerType =
    | 'OPENING_BALANCE'
    | 'PURCHASE' // Credit - increases payable
    | 'PAYMENT' // Debit - decreases payable
    | 'DEBIT_NOTE' // Debit - decreases payable
    | 'CREDIT_NOTE'; // Credit - increases payable

export interface SupplierLedgerEntry extends LedgerEntry {
    supplierId: string;
    supplierName: string;
    type: SupplierLedgerType;
    invoiceNumber?: string;
    dueDate?: string;
    paymentRef?: string;
}

// Cash & Bank Account Types
export type AccountType = 'CASH' | 'BANK' | 'DIGITAL_WALLET';

export interface CashAccount {
    accountId: string;
    stationId: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    name: string;
    type: AccountType;
    bankName?: string;
    accountNumber?: string;
    walletProvider?: 'JAZZCASH' | 'EASYPAISA' | 'POS';
    openingBalance: number;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

// Cash/Bank Ledger Types
export type CashLedgerType =
    | 'OPENING_BALANCE'
    | 'RECEIPT' // Credit - cash in
    | 'PAYMENT' // Debit - cash out
    | 'EXPENSE' // Debit - expense paid
    | 'DEPOSIT' // Debit from cash, Credit to bank
    | 'WITHDRAWAL' // Debit from bank, Credit to cash
    | 'TRANSFER' // Between accounts
    | 'ADJUSTMENT'; // Manual adjustment

export interface CashLedgerEntry extends LedgerEntry {
    accountId: string;
    accountName: string;
    type: CashLedgerType;
    counterpartyType?: 'CUSTOMER' | 'SUPPLIER' | 'EXPENSE' | 'TRANSFER';
    counterpartyId?: string;
    counterpartyName?: string;
    transferAccountId?: string; // For transfers between accounts
}

// Enhanced Customer with Type (Walk-in / Credit / Fleet)
export type CustomerType = 'WALK_IN' | 'CREDIT' | 'FLEET';
export type CustomerBusinessType = 'PETROL' | 'CNG' | 'LUBE' | 'ALL';

// Aging bucket for reports
export interface AgingBucket {
    current: number; // 0-30 days
    days30: number; // 31-60 days
    days60: number; // 61-90 days
    days90: number; // 90+ days
    total: number;
}

// ============================================
// RATE CHANGE IMPACT SYSTEM TYPES
// Mandatory as per specification Section 2.4
// ============================================

// Rate Change Record
export interface RateChange {
    id: string;
    fuelType: FuelType;
    oldRate: number;
    newRate: number;
    rateDifference: number;
    changePercentage: number;
    effectiveDate: string;
    effectiveTime: string;
    effectiveShiftId?: string;
    changedBy: string;
    changedByName: string;
    reason: RateChangeReason;
    reasonNote?: string;
    timestamp: string;
}

export type RateChangeReason =
    | 'OMC_RATE_CHANGE'
    | 'COMPETITOR_PRICING'
    | 'PROMOTIONAL_OFFER'
    | 'MARKET_CONDITIONS'
    | 'GOVERNMENT_NOTIFICATION'
    | 'OTHER';

// Inventory Snapshot at Rate Change
export interface InventorySnapshot {
    id: string;
    rateChangeId: string;
    tankId: string;
    tankName: string;
    fuelType: FuelType;
    litersAtChange: number;
    oldRateValue: number; // liters × old rate
    newRateValue: number; // liters × new rate
    paperProfitLoss: number; // difference
    timestamp: string;
}

// Rate Change Impact Analysis
export interface RateChangeImpact {
    rateChangeId: string;
    // Inventory Impact
    totalInventoryLiters: number;
    totalOldValue: number;
    totalNewValue: number;
    totalPaperProfitLoss: number;
    inventorySnapshots: InventorySnapshot[];
    // Sales Impact (7-day comparison)
    preChangeSales: SalesImpactData;
    postChangeSales: SalesImpactData;
    salesVolumeChange: number;
    salesRevenueChange: number;
    // Customer Credit Impact
    outstandingCreditsAtOldRate: number;
    outstandingCreditsAtNewRate: number;
    creditAdjustmentRequired: number;
    creditAdjustmentsApplied: CustomerCreditAdjustment[];
    // Timestamps
    analyzedAt: string;
}

export interface SalesImpactData {
    periodStart: string;
    periodEnd: string;
    totalLiters: number;
    totalRevenue: number;
    averageDailySales: number;
    peakSalesDay: string;
    lowestSalesDay: string;
}

export interface CustomerCreditAdjustment {
    customerId: string;
    customerName: string;
    outstandingLiters: number;
    oldRateAmount: number;
    newRateAmount: number;
    adjustmentAmount: number;
    adjustmentType: 'AUTO' | 'MANUAL' | 'PENDING';
    adjustedAt?: string;
    adjustedBy?: string;
}

// ============================================
// TEST LITER MANAGEMENT TYPES
// Mandatory as per specification Section 3.2
// ============================================

export interface TestingLog {
    id: string;
    shiftId: string;
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    standardTestAmount: number; // Expected liters
    actualDispensed: number; // Actual liters
    variance: number; // Difference
    variancePercentage: number;
    testedBy: string;
    testedByName: string;
    approvedBy?: string;
    approvedByName?: string;
    actionTaken?: 'NONE' | 'RECALIBRATION' | 'MAINTENANCE_SCHEDULED';
    notes?: string;
    timestamp: string;
}

// ============================================
// DISCOUNT MANAGEMENT TYPES
// Mandatory as per specification Section 4.1
// ============================================

export interface DiscountEntry {
    id: string;
    shiftId: string;
    customerName?: string;
    customerId?: string;
    amount: number;
    discountType: 'RUPEES' | 'PERCENTAGE';
    reason: DiscountReason;
    reasonNote?: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
    approvedByName?: string;
    approvalNote?: string;
    timestamp: string;
    createdBy: string;
    createdByName: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
}

export type DiscountReason =
    | 'REGULAR_CUSTOMER'
    | 'PROMOTIONAL'
    | 'MANAGER_APPROVAL'
    | 'BULK_PURCHASE'
    | 'LOYALTY_PROGRAM'
    | 'PRICE_MATCH'
    | 'OTHER';

// Discount Limits Configuration
export interface DiscountLimits {
    dailyLimit: number;
    monthlyLimit: number;
    maxPerTransaction: number;
    requireApprovalAbove: number;
}

// ============================================
// KPI DASHBOARD TYPES
// Mandatory as per specification Section 6.1
// ============================================

export interface KPICard {
    id: string;
    type: KPIType;
    title: string;
    // Summary View
    primaryValue: number;
    primaryLabel: string;
    secondaryValue?: number;
    secondaryLabel?: string;
    comparisonValue?: number;
    comparisonLabel?: string;
    trend: 'UP' | 'DOWN' | 'NEUTRAL';
    trendPercentage?: number;
    // Visual
    icon: string;
    color: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';
    // Drill-down data
    detailData?: KPIDetailData;
}

export type KPIType =
    | 'SALES'
    | 'CREDITS'
    | 'RECOVERY'
    | 'DISCOUNTS'
    | 'DIGITAL_CASH'
    | 'BANK_CASH'
    | 'EXPENSES'
    | 'INVENTORY'
    | 'RATE_CHANGE_IMPACT';

export interface KPIDetailData {
    transactions: KPITransaction[];
    chartData?: ChartDataPoint[];
    summary: Record<string, number>;
}

export interface KPITransaction {
    id: string;
    timestamp: string;
    description: string;
    amount: number;
    category?: string;
    reference?: string;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

// ============================================
// CONFIGURATION SETTINGS TYPES
// Mandatory as per specification Section 2
// ============================================

// Extended Tank Configuration
export interface TankConfiguration extends Tank {
    installationDate: string;
    lastCalibrationDate?: string;
    calibrationDueDate?: string;
    minimumThresholdLevel: number; // Alert level in liters
    daysUntilRefill?: number; // Calculated
    isActive: boolean;
    maintenanceHistory: TankMaintenanceRecord[];
}

export interface TankMaintenanceRecord {
    id: string;
    tankId: string;
    date: string;
    type: 'CALIBRATION' | 'CLEANING' | 'REPAIR' | 'INSPECTION';
    performedBy: string;
    notes?: string;
    nextDueDate?: string;
}

// Extended Nozzle Configuration
export interface NozzleConfiguration extends Nozzle {
    installationDate: string;
    lastCalibrationDate?: string;
    calibrationStatus: 'CALIBRATED' | 'DUE' | 'OVERDUE';
    isActive: boolean;
    performanceMetrics: NozzlePerformance;
    maintenanceHistory: NozzleMaintenanceRecord[];
}

export interface NozzlePerformance {
    totalLitersDispensed: number;
    averageDailyDispense: number;
    accuracyScore: number; // Based on test liter variance
    lastShiftDispense: number;
}

export interface NozzleMaintenanceRecord {
    id: string;
    nozzleId: string;
    date: string;
    type: 'CALIBRATION' | 'SEAL_REPLACEMENT' | 'METER_REPAIR' | 'CLEANING';
    varianceBefore?: number;
    varianceAfter?: number;
    performedBy: string;
    notes?: string;
}

// Rate Configuration
export interface RateConfiguration {
    fuelType: FuelType;
    currentRate: number;
    previousRate: number;
    effectiveFrom: string;
    lastChangedBy: string;
    lastChangedAt: string;
    rateHistory: RateChange[];
}

// Alert Configuration
export interface AlertConfiguration {
    id: string;
    stationId: string;
    type: AlertType;
    threshold?: number;
    isEnabled: boolean;
    notifyRoles: UserRole[];
    createdAt: string;
    updatedAt: string;
}

export type AlertType =
    | 'LOW_INVENTORY'
    | 'OVERDUE_PAYMENT'
    | 'CASH_VARIANCE'
    | 'RATE_CHANGE'
    | 'MAINTENANCE_DUE'
    | 'CREDIT_LIMIT_EXCEEDED'
    | 'DISCOUNT_LIMIT_EXCEEDED'
    | 'SHIFT_VARIANCE_HIGH';

// System Alert (Generated)
export interface SystemAlert {
    id: string;
    type: AlertType;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    isRead: boolean;
    isDismissed: boolean;
    createdAt: string;
    dismissedAt?: string;
    dismissedBy?: string;
}

// ============================================
// SHIFT CLOSING WIZARD ENHANCED TYPES
// Extended for 16-step system
// ============================================

// 7-Step Wizard State (Streamlined)
export interface ShiftClosingWizardState {
    // Wizard Control
    step: number; // 1-7
    isOpen: boolean;
    shiftId: string;
    stationId: string;

    // Step 1: Shift Initialization
    staffId: string;
    staffName: string;
    staffRole?: string;
    shiftType: ShiftType;
    startTime?: string;

    // Steps 2-4: Nozzle Readings (Petrol, Diesel, Testing)
    readings: NozzleReading[];
    nozzleSales: NozzleSale[]; // Required by tests
    petrolTestLiters: number;
    dieselTestLiters: number;

    // Step 5: Recoveries & Physical Cash
    // Step 5: Recoveries & Physical Cash
    actualCash: number; // CRITICAL: Physical cash counted

    // Step 6: All Transactions (7 types)
    transactions: Transaction[];

    // Step 7: Final Audit (Computed)
    totalFuelRevenue: number;
    totalRecoveries: number;
    totalCredits: number;
    totalExpenses: number;
    totalDigitalPayments: number;
    totalBankDeposits: number;
    totalDeductions: number;
    expectedCash: number;
    variance: number;
    variancePercentage: number;
    cashInHand: number;

    // Submission metadata
    notes: string;
    submittedAt?: string;
    isLocked: boolean;
    discountEntries?: DiscountEntry[];
    recoveriesTotal?: number; // Aliased for tests
    expensesTotal?: number; // Aliased for tests
    creditsTotal?: number; // Aliased for tests
    petrolTestTotal?: number;
    dieselTestTotal?: number;
}

export interface NozzleSale {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    openingReading: number;
    closingReading: number;
    rate: number;
    costPrice: number; // Added as per IDE requirement
    margin: number; // Added as per IDE requirement
    testVolume: number;
    netSales: number;
    revenue: number;
}

export interface TankLevel {
    tankId: string;
    tankName: string;
    fuelType: FuelType;
    level: number;
    timestamp: string;
}

export interface MidShiftRateChange {
    fuelType: FuelType;
    changeTime: string;
    oldRate: number;
    newRate: number;
    litersSoldAtOldRate: number;
    litersSoldAtNewRate: number;
    revenueAtOldRate: number;
    revenueAtNewRate: number;
}

export interface ProductSaleSummary {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
}

// ============================================
// REPORT TYPES
// Mandatory as per specification Section 6.2
// ============================================

export interface ShiftReport {
    shiftId: string;
    // Shift Information
    shiftRunnerName: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    totalDuration: string;

    // Sales Summary
    openingReadings: NozzleReadingSummary[];
    closingReadings: NozzleReadingSummary[];
    totalPetrolLiters: number;
    totalDieselLiters: number;
    testLitersDeducted: TestLitersSummary;
    ratesApplied: RateAppliedSummary[];
    totalSalesRevenue: number;
    nozzleWiseBreakdown: NozzleSaleSummary[];

    // Financial Reconciliation
    grossSales: number;
    discounts: number;
    creditsIssued: number;
    recoveryCollected: number;
    digitalCash: number;
    bankDeposits: number;
    expenses: number;
    supplierPayments: number;
    lubeCash: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
    variancePercentage: number;

    // Transaction Summaries
    creditTransactionCount: number;
    recoveryTransactionCount: number;
    discountTransactionCount: number;
    digitalTransactionCount: number;
    bankTransactionCount: number;
    expenseTransactionCount: number;

    // Customer Activity
    newCustomersAdded: number;
    creditCustomersServed: number;
    recoveryCollectedFromCount: number;
    totalOutstandingBalance: number;

    // Inventory Status
    tankLevelsAtEnd: TankLevel[];
    fuelConsumedThisShift: FuelConsumption[];
    estimatedDaysRemaining: TankDaysRemaining[];
    refillAlerts: string[];

    // Rate Information
    rateChanges: RateChange[];
    rateChangeImpact?: number;

    // Alerts & Issues
    alerts: ShiftAlert[];

    // Generated
    generatedAt: string;
    generatedBy: string;
}

export interface NozzleReadingSummary {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    reading: number;
}

export interface TestLitersSummary {
    petrol: number;
    diesel: number;
    total: number;
}

export interface RateAppliedSummary {
    fuelType: FuelType;
    rate: number;
    appliedFrom: string;
    appliedTo?: string;
}

export interface NozzleSaleSummary {
    nozzleId: string;
    nozzleName: string;
    fuelType: FuelType;
    liters: number;
    revenue: number;
    rate: number;
}

export interface FuelConsumption {
    fuelType: FuelType;
    litersConsumed: number;
}

export interface TankDaysRemaining {
    tankId: string;
    tankName: string;
    daysRemaining: number;
}

export interface ShiftAlert {
    type:
        | 'VARIANCE'
        | 'TEST_DISCREPANCY'
        | 'OVERDUE_ACCOUNT'
        | 'LOW_INVENTORY'
        | 'MAINTENANCE'
        | 'UNUSUAL_TRANSACTION';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    relatedEntityId?: string;
}
// Staff Ledger Entry (New)
export type StaffTransactionType =
    | 'SALARY'
    | 'ADVANCE'
    | 'BONUS'
    | 'DEDUCTION'
    | 'LOAN'
    | 'SHIFT_EARNING'
    | 'EXPENSE';

export interface StaffLedgerEntry {
    id: string;
    userId: string;
    userName: string;
    businessUnit: 'FUEL' | 'LUBE' | 'CNG';
    date: string;
    timestamp: string;
    type: StaffTransactionType;
    amount: number;
    debit: number; // For payments to staff (Salary, Advance, etc.)
    credit: number; // For staff returning money (Loan repayment, etc.)
    balance: number;
    reference?: string;
    note?: string;
    createdBy: string;
}

// Audit Log (New)
export interface AuditLog {
    id: string;
    action: string;
    module: string; // e.g., 'FUEL', 'CNG', 'LUBE', 'SYSTEM'
    userId: string;
    userName: string;
    details: string; // e.g., 'Changed Petrol rate from 280 to 285'
    timestamp: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    // Enhanced fields for audit report #46-50 (entity-level tracking)
    entityType?: string;   // e.g., 'SHIFT', 'CUSTOMER', 'PRODUCT'
    entityId?: string;     // ID of the affected record
    oldValue?: string;     // JSON stringified old value (for data change history)
    newValue?: string;     // JSON stringified new value
    ipAddress?: string;    // For login/access audit
    sessionId?: string;    // For session tracking
}

export * from './fraud';
