roduct Requirements Document: Shift Wizard
Product Name: Shift Reconciliation Wizard
Version: 5.0
Last Updated: February 4, 2026
Document Owner: Fuel Station Management System

1. Executive Summary
   The Shift Wizard is a 7-step guided workflow that enables fuel station operators to perform end-of-shift reconciliation with high accuracy and minimal manual calculation. It captures nozzle readings, transactions, recoveries, deductions, and physical cash counts to automatically compute variance between expected and actual cash.

Key Objectives
Eliminate manual calculation errors in shift reconciliation
Provide real-time variance detection
Create an auditable trail for all financial transactions
Reduce shift closing time from 30+ minutes to under 10 minutes 2. User Personas
Primary User: Fuel Station Salesman

Operates fuel pumps during assigned shift (Morning/Night)
Needs to reconcile cash at shift end
Limited technical expertise
Secondary User: Station Manager

Reviews shift reports
Investigates variances
Approves final submissions 3. Core Features & User Flow
3.1 Step 1: Shift Initialization
Purpose: Establish the audit context

User Actions:

Select salesman from dropdown (populated from staffStore)
Choose shift type: Morning or Night
Click "Open Fuel Command" to proceed
Validation Rules:

Salesman selection is mandatory
Shift type defaults to "MORNING"
Quick Add button allows creating new salesman on-the-fly
Backend Data:

{
salesmanId: string;
shiftType: 'MORNING' | 'NIGHT';
}
3.2 Step 2: Petrol Readings (MS 92 RON)
Purpose: Capture opening, closing, and test readings for Petrol nozzles

Nozzles Configured:

Petrol-1 (Rate: Rs 282.50/L)
Petrol-2 (Rate: Rs 282.50/L)
User Actions:

Enter opening reading for each nozzle
Enter closing reading for each nozzle
Enter test liters (deducted from sales)
Click "Proceed to Diesel"
Business Logic:

Net Liters = Closing - Opening - Test
Revenue = Net Liters × Rate
UI Components:

Premium grid layout with animated cards
Real-time calculation of total liters and revenue
Visual feedback on each input field
Validation:

Closing must be ≥ Opening
All fields accept decimal inputs
Negative values are not allowed
3.3 Step 3: Diesel Readings (HSD)
Purpose: Capture diesel nozzle data

Nozzles Configured:

Diesel-1 (Rate: Rs 295.10/L)
Diesel-2 (Rate: Rs 295.10/L)
User Actions:

Enter opening, closing, test readings
Click "Proceed to Testing"
Business Logic: Same as Petrol step

3.4 Step 4: Testing & Calibration
Purpose: Deduct liters used for pump testing/calibration

User Actions:

Enter petrol test liters (applied to Petrol-1 nozzle)
Enter diesel test liters (applied to Diesel-1 nozzle)
Click "Proceed to Recoveries"
Business Logic:

Test liters are subtracted from the net sales calculation
These are quality control/maintenance deductions
Badge indicator shows "Active Deduction" when test > 0
Visual Design:

Glassmorphic cards with hover effects
Icon-based indicators (Fuel icon for petrol, Droplets for diesel)
3.5 Step 5: Cash Recoveries
Purpose: Record cash received from credit customers during the shift

User Actions:

Select customer from dropdown
Enter recovery amount
Click "+" to add to recovery list
Repeat for multiple recoveries
Enter Physical Cash In-Hand (critical field)
Click "Proceed to Deductions"
Quick Add Feature:

Users can create new customers on-the-fly
Fields: Name, Phone, Credit Limit
Recovery List Display:

Shows customer name
Shows amount with "Rs" prefix
Delete button (trash icon) to remove entries
Total recovered displayed at bottom
Business Logic:

Total Recoveries = Sum of all RECOVERY transactions
Expected Cash += Total Recoveries
Critical Field:

Physical Cash In-Hand (Closing)
This is the actual cash counted by the salesman. The variance calculation depends on this value being accurate.

3.6 Step 6: Deductions Command Center
Purpose: Record all non-fuel transactions that reduce expected cash

Transaction Types (7 Categories):

6.1 Credit Sales
Icon: Credit Card
Description: Fuel sold on credit to corporate customers
Fields: Customer selection, Amount, Description
Effect: Reduces expected cash
6.2 Expenses
Icon: Receipt
Description: Petty cash expenditures
Predefined Categories:
Station Maintenance
Electricity / Generator
Home / Personal
Officer Tea/Lunch
Fields: Category, Amount, Notes
Effect: Reduces expected cash
6.3 Bank Deposits
Icon: Landmark (bank)
Description: Cash deposited to bank during shift
Fields: Bank account selection, Amount, Description
Effect: Reduces expected cash
6.4 Digital Payments
Icon: Smartphone
Description: JazzCash, EasyPaisa, digital wallet payments
Fields: Amount, Description
Effect: Reduces expected cash (cash not received physically)
6.5 Supplier Payments
Icon: Truck
Description: Cash paid to vendors/suppliers
Fields: Supplier selection, Amount, Description
Effect: Reduces expected cash
6.6 Oil/Lube Sales
Icon: Droplets
Description: Lubricant oil sales (cash received)
Fields: Amount, Description
Effect: Increases expected cash (revenue)
6.7 Discounts
Icon: Tag
Description: Price reductions given to customers
Fields: Amount, Description
Effect: Reduces expected cash
UI Design:

Horizontal tab navigation for switching between transaction types
Active tab highlighted with dark background
Single unified form for all transaction types
Quick Add buttons for entities (customers, banks, suppliers)
Transaction list below form showing all entries for active category
Delete functionality for each transaction
State Management:

transactions: Transaction[] = [
{
id: 'TX-xxx',
type: 'CREDIT_SALE' | 'EXPENSE' | 'BANK_DEPOSIT' | ...,
amount: number,
customerId?: string,
customerName?: string,
description?: string,
timestamp: ISO8601
}
]
3.7 Step 7: Final Audit & Submission
Purpose: Display variance calculation and allow shift finalization

Display Components:

Variance Card (Prominent)
Visual Design:

- Large rounded card (3rem border radius)
- Color-coded background:
    - GREEN (Emerald 600) if variance ≥ 0 (Excess Cash)
    - RED (Red 600) if variance < 0 (Cash Shortage)
- Badge indicator: "Excellent - Excess Cash" or "Critical - Cash Shortage"
- 6xl font size for variance amount
- Animated icon (TrendingUp/TrendingDown) in background
  Summary Cards (2-column grid)
  Expected Cash (calculated)
  Physical Cash (user input from Step 5)
  Grand Equation
  Expected Cash = Total Fuel Revenue - Total Deductions + Total Recoveries + Lube Sales
  Variance = Physical Cash - Expected Cash
  Detailed Breakdown:

Total Fuel Revenue = (Petrol Liters × Petrol Rate) + (Diesel Liters × Diesel Rate)
Total Deductions = Credit Sales + Expenses + Bank Deposits + Digital Payments + Supplier Payments
Total Recoveries = Cash Recoveries + Lube Sales
User Actions:

Review variance and breakdown
Click "SUBMIT TO LEDGER" to finalize
System shows confirmation dialog
On confirmation, shift data is locked and wizard closes
Export Options (Future Enhancement):

PDF Summary
Share Report 4. Technical Architecture
4.1 State Management (Zustand)
Store:
fuelStore.ts

State Shape:

interface ShiftWizardState {
// Wizard Control
step: number; // Current step (1-7)
isOpen: boolean; // Modal visibility

// Shift Context
salesmanId: string;
shiftType: 'MORNING' | 'NIGHT';

// Nozzle Data
readings: Record<string, NozzleReading>;

// Transactions
transactions: Transaction[];

// Cash Count
actualCash: number;
}
Key Actions:

openWizard()

- Opens modal, resets to step 1
  closeWizard()
- Closes modal
  setStep(n)
- Navigate to step n
  updateReading(nozzleId, data)
- Update nozzle reading
  addTransaction(tx)
- Add new transaction
  removeTransaction(id)
- Delete transaction
  setActualCash(amount)
- Set physical cash count
  getTotals()
- Compute all financial totals
  resetWizard()
- Clear all data
  4.2 Related Stores
  staffStore - Provides salesman list, addStaff() for quick add
  customerStore - Provides customer list, addCustomer()
  bankStore - Provides bank accounts, addAccount()
  supplierStore - Provides supplier list, addSupplier()
  4.3 Component Structure
  ShiftWizard.tsx (Container)
  ├── CoreSteps.tsx
  │ ├── StepStart
  │ └── StepPetrolReadings
  ├── SecondarySteps.tsx
  │ ├── StepDieselReadings
  │ └── StepTesting
  ├── RecoveryStep.tsx
  │ └── StepRecoveries
  └── SummaryStep.tsx
  ├── StepDeductions
  └── StepFinalAudit
  4.4 UI Components (Reusable)
  NozzleGrid - Premium grid for nozzle inputs
  QuickAddModal - Generic modal for adding entities
  Card
  ,
  Button
  ,
  Input
  ,
  Badge
- Design system components

5. Data Models
   5.1 NozzleReading
   interface NozzleReading {
   nozzleId: string; // e.g., 'petrol-1'
   opening: number; // Opening meter reading
   closing: number; // Closing meter reading
   test: number; // Test liters (deduction)
   rate: number; // Price per liter (Rs)
   }
   5.2 Transaction
   type TransactionType =
   | 'CREDIT_SALE'
   | 'RECOVERY'
   | 'EXPENSE'
   | 'BANK_DEPOSIT'
   | 'DIGITAL_PAYMENT'
   | 'LUBE_SALE'
   | 'DISCOUNT'
   | 'SUPPLIER_PAYMENT';
   interface Transaction {
   id: string; // Auto-generated: TX-{timestamp}-{random}
   tenantId: string; // Multi-tenancy support
   shiftId?: string; // Link to shift record
   type: TransactionType;
   amount: number;
   customerId?: string;
   customerName?: string;
   supplierId?: string;
   supplierName?: string;
   accountId?: string;
   accountName?: string;
   description?: string;
   referenceNo?: string;
   timestamp: string; // ISO8601
   }
6. Business Rules & Validation
   6.1 Critical Validations
   Salesman Selection - Cannot proceed without salesman ID
   Closing ≥ Opening - Prevents negative liters
   Physical Cash Required - Must be entered before final audit
   Transaction Amount > 0 - No zero or negative transactions
   6.2 Calculation Consistency
   All currency values stored as number (not strings)
   Displayed with 2 decimal precision
   Use toLocaleString() for formatted display
   6.3 Audit Trail
   Each transaction gets unique ID with timestamp
   All transactions linked to tenantId for multi-location support
   Future: Link to shiftId for historical queries
7. UX & Visual Design
   7.1 Design Principles
   Guided Flow - Linear 7-step wizard with clear progress indicator
   Premium Aesthetics - Rounded corners (2rem+), soft shadows, glassmorphism
   Real-time Feedback - Live calculations, animated transitions
   Error Prevention - Validation, confirmation dialogs
   7.2 Progress Indicator
   7 horizontal bars at top of wizard
   Filled bars (primary color) for completed steps
   Gray bars for pending steps
   Step labels below bars (Intro, Petrol, Diesel, Test, Recovery, Deduct, Audit)
   7.3 Color Semantics
   Emerald/Green - Positive (excess cash, success)
   Red/Rose - Negative (shortage, errors)
   Amber - Diesel category
   Blue - Recoveries, bank deposits
   Primary (Emerald) - Action buttons, active states
   7.4 Animations (Framer Motion)
   Modal entrance: Scale + opacity fade
   Step transitions: Horizontal slide (exit -20px, enter +20px)
   Transaction list: Staggered fade-in on add
8. Edge Cases & Error Handling
   8.1 Data Persistence
   Uses zustand/persist with localStorage
   Key: fuel-shift-storage
   Data survives page refresh until wizard is reset
   8.2 Variance Handling
   Balanced: |variance| < 1 Rs (allowed tolerance)
   Surplus: variance > 0 (extra cash found)
   Shortage: variance < 0 (cash missing)
   8.3 User Interruptions
   Back button available in footer (except Step 1)
   Close (X) button clears wizard state
   Confirmation required before final submission
   8.4 Quick Add Scenarios
   If customer/supplier not in list, user can add instantly
   Modal validates required fields before save
   New entity immediately available in dropdown
9. Future Enhancements
   Phase 2 (Planned)
   PDF export of shift report
   Email/WhatsApp sharing
   Historical shift comparison
   Automatic nozzle reading import (IoT integration)
   Photo capture for physical cash verification
   Signature capture for audit approval
   Phase 3 (Aspirational)
   Tank dip reconciliation (Manual vs ATG)
   Shift handover notes
   Multi-currency support
   Biometric salesman verification
10. Success Metrics
    Quantitative KPIs
    Time to Close: Target < 10 minutes (baseline: 30+ minutes)
    Variance Rate: < 5% of shifts with variance > Rs 500
    User Adoption: 90%+ of shifts using wizard within 30 days
    Error Rate: < 2% calculation errors (down from ~15% manual)
    Qualitative Goals
    Improved salesman confidence in shift reconciliation
    Reduced manager time spent investigating discrepancies
    Enhanced audit compliance
11. Technical Constraints
    Browser Support
    Modern browsers with ES6+ support
    Chrome/Edge 90+, Firefox 88+, Safari 14+
    Performance
    Modal render time: < 200ms
    Step transition: < 300ms
    No blocking operations on UI thread
    Dependencies
    React 18+
    Zustand 4.x
    Framer Motion 10.x
    Lucide React (icons)
    TailwindCSS (styling)
12. Developer Handoff Checklist
    Must Understand
    Zustand state management pattern
    7-step wizard flow and navigation logic
    Grand Equation calculation (
    getTotals()
    function)
    Transaction type taxonomy
    QuickAdd modal pattern for entity creation
    Critical Files to Review
    fuelStore.ts

- Core business logic
  ShiftWizard.tsx
- Wizard orchestration
  SummaryStep.tsx
- StepDeductions + StepFinalAudit
  types/index.ts
- Data contracts
  Testing Scenarios
  Complete happy path (all 7 steps)
  Variance scenarios (balanced, surplus, shortage)
  Quick Add for customer/bank/supplier
  Back navigation and data persistence
  Transaction add/delete operations
  Appendix A: Sample Data Flow
  Step 1: Salesman "Ali Khan" selected, Morning shift
  Step 2: Petrol-1: 5000→5500L (500L × Rs282.50 = Rs141,250)
  Step 3: Diesel-1: 3000→3400L (400L × Rs295.10 = Rs118,040)
  Step 4: Test deductions: 5L petrol, 3L diesel
  Step 5: Recovery from "XYZ Transport": Rs 50,000, Physical cash: Rs 300,000
  Step 6:

Credit sale to "ABC Corp": Rs 20,000
Expense (Electricity): Rs 5,000
Bank deposit to HBL: Rs 80,000
Step 7 Calculation:

Fuel Revenue = Rs 257,877.50 (adjusted for test)
Total Deductions = Rs 105,000
Total Recoveries = Rs 50,000
Expected Cash = Rs 202,877.50
Physical Cash = Rs 300,000
Variance = Rs 97,122.50 (SURPLUS - Extra cash found)
