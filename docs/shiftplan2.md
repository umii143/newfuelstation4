🏆 MASTER PRD – FUEL STATION SHIFT MANAGEMENT SYSTEM

(Gold-Medalist | Audit-Proof | Real-World Register Logic)

1️⃣ SYSTEM PURPOSE (READ FIRST – NON-NEGOTIABLE)

This system must exactly replicate real fuel station shift operations, like a physical register, but with automatic accounting, zero loopholes, and full traceability.

🚫 The system MUST NOT:

Invent new flows

Skip steps

Merge unrelated cash

Allow anonymous credits or recoveries

✅ Every action must be:

Linked to a Shift

Linked to a Salesman

Time-stamped

Auto-synced to its relevant account module

2️⃣ BUSINESS STRUCTURE (VERY IMPORTANT)
Fuel Business Includes:

Petrol

Diesel

CNG Business:

Separate module

Separate staff

Separate shifts

Separate cash & reports
🚫 No mixing with fuel shifts

Lube / Oil:

Separate business

Oil cash must be deducted from fuel salesman cash

3️⃣ SHIFT TYPES

Morning

Evening

Night

Custom

Each shift has:

Unique Shift ID

One salesman only

Fixed start & end time

4️⃣ SHIFT LIFECYCLE (STRICT FLOW)

There are ONLY TWO PHASES:

Shift Start (Opening)

Shift Closing (End of Day)

🚫 No data entry allowed outside these phases.

🔵 PHASE 1: SHIFT START (OPENING)
STEP 1: SHIFT INITIALIZATION
User Action:

Manager/Owner selects:

Salesman Name

Salesman ID

Shift Type

System Rules:

Lock shift to this salesman

❌ No other salesman can use it

✅ All future entries belong to this shift

📌 This is the foundation of accountability.

STEP 2: OPENING METER READINGS (MANDATORY)
Fuel Nozzles:

Petrol Nozzle 1

Petrol Nozzle 2

Diesel Nozzle 1

Diesel Nozzle 2

Fields:

Opening Reading (Liters)

Auto time stamp

Optional photo upload

🚫 Shift cannot start without opening readings.

🔴 PHASE 2: SHIFT CLOSING (STEP-BY-STEP WIZARD)

Shift closing MUST work like a wizard
❌ Steps cannot be skipped
❌ Order cannot be changed

STEP 3: CLOSING METER READINGS
Input Required:

Petrol Nozzle 1 – Closing

Petrol Nozzle 2 – Closing

Diesel Nozzle 1 – Closing

Diesel Nozzle 2 – Closing

System Calculation:
Total Liters = Closing – Opening


Calculated per nozzle & total.

STEP 4: TEST FUEL DEDUCTION (MANDATORY)
Input:

Petrol Test Liters

Diesel Test Liters

📌 Test fuel ≠ Sale

System Calculation:
Net Sale Liters = Total Liters – Test Liters


Test fuel must be tracked separately.

STEP 5: SALES VALUE CALCULATION (AUTO)

System applies:

Net Sale Liters × Current Rate


Creates:

Petrol Gross Sale

Diesel Gross Sale

Total Fuel Sale

🚫 Rates are NOT editable in shift.

STEP 6: RECOVERIES (STRICT FILTERED DROPDOWN)
Recovery Dropdown MUST SHOW ONLY:

Customers where:

Outstanding Credit Balance > 0


🚫 Customers with 0 balance must NOT appear.

On Recovery Entry:

Customer balance decreases

Amount ADDED to salesman cash

Auto saved in:

Customer Ledger

Recovery Module

Shift Activity Log

🚫 Over-recovery not allowed.

STEP 7: EXPENSES (CASH OUT)
Input:

Expense category

Amount

Optional note / receipt

Auto Actions:

❌ Deduct from salesman cash

✅ Save to:

Expenses Module

Shift Ledger

Date-wise reports

STEP 8: CREDITS ISSUED (NO CASH)
Rules:

Customer selection is COMPULSORY

If customer not found → Quick Add Customer

Auto Actions:

❌ Cash NOT added

✅ Customer balance increased

✅ Saved in:

Customer Account

Credit Reports

Shift Details

🚫 Anonymous credits are forbidden.

STEP 9: SUPPLIER PAYMENTS (CASH OUT)
Input:

Select supplier

Or Quick Add Supplier

Amount paid

Auto Actions:

❌ Deduct from salesman cash

✅ Supplier balance updated

✅ Saved in:

Supplier Ledger

Shift Expenses View

STEP 10: OIL / LUBE CASH ADJUSTMENT
Input:

Oil cash handed over

Auto Actions:

❌ Minus from fuel salesman cash

✅ Added to Lube Business Cash

📌 Fuel & Lube must stay separate.

STEP 11: DIGITAL CASH (NON-PHYSICAL)
Accounts:

JazzCash

EasyPaisa

POS

Auto Actions:

❌ Deduct from physical cash

✅ Add to Digital Ledger

✅ Sync to shift summary

STEP 12: BANK CASH DEPOSIT
Input:

Select bank

Deposit amount

Auto Actions:

❌ Deduct from salesman cash

✅ Add to Bank Ledger

✅ Sync to reports

STEP 13: FINAL SHIFT SUMMARY (KPI VIEW)
Must Display:
Fuel KPIs:

Opening / Closing Readings

Test Liters

Net Sale Liters

Total Fuel Sale

Financial KPIs:

Recoveries

Expenses

Credits

Supplier Payments

Oil Cash

Digital Cash

Bank Cash

Final Calculation:
Expected Cash With Salesman

STEP 14: EXPORT & SHARE

One-click options:

PDF

Image

WhatsApp

Print

Must include:

Station name

Shift

Salesman name & ID

Date & time

Full breakdown

STEP 15: SAVE & LOCK SHIFT
On Save:

Salesman confirmation (PIN / checkbox)

Optional manager approval

Result:

🔒 Shift locked

✏️ Editable only by Admin

🧾 Full audit trail required

STEP 16: POST-SHIFT ACTIVITY LOG

Below summary show:

Expenses

Credits (customer-wise)

Recoveries

Supplier payments

Digital & bank cash

Click → full detail view

5️⃣ AUTO-SYNC RULE (VERY IMPORTANT)

Every entry must auto-sync to:

Customers

Suppliers

Expenses

Recoveries

Digital Cash

Bank Cash

Date-wise analytics

Salesman performance

🚫 No duplicate manual entry anywhere.

🏆 FINAL GOLD RULE

This system must behave like a strict accountant, not a creative assistant.
No assumptions. No shortcuts. No invented flows.🏆 MASTER PRD – FUEL STATION SHIFT MANAGEMENT SYSTEM

(Gold-Medalist | Audit-Proof | Real-World Register Logic)

1️⃣ SYSTEM PURPOSE (READ FIRST – NON-NEGOTIABLE)

This system must exactly replicate real fuel station shift operations, like a physical register, but with automatic accounting, zero loopholes, and full traceability.

🚫 The system MUST NOT:

Invent new flows

Skip steps

Merge unrelated cash

Allow anonymous credits or recoveries

✅ Every action must be:

Linked to a Shift

Linked to a Salesman

Time-stamped

Auto-synced to its relevant account module

2️⃣ BUSINESS STRUCTURE (VERY IMPORTANT)
Fuel Business Includes:

Petrol

Diesel

CNG Business:

Separate module

Separate staff

Separate shifts

Separate cash & reports
🚫 No mixing with fuel shifts

Lube / Oil:

Separate business

Oil cash must be deducted from fuel salesman cash

3️⃣ SHIFT TYPES

Morning

Evening

Night

Custom

Each shift has:

Unique Shift ID

One salesman only

Fixed start & end time

4️⃣ SHIFT LIFECYCLE (STRICT FLOW)

There are ONLY TWO PHASES:

Shift Start (Opening)

Shift Closing (End of Day)

🚫 No data entry allowed outside these phases.

🔵 PHASE 1: SHIFT START (OPENING)
STEP 1: SHIFT INITIALIZATION
User Action:

Manager/Owner selects:

Salesman Name

Salesman ID

Shift Type

System Rules:

Lock shift to this salesman

❌ No other salesman can use it

✅ All future entries belong to this shift

📌 This is the foundation of accountability.

STEP 2: OPENING METER READINGS (MANDATORY)
Fuel Nozzles:

Petrol Nozzle 1

Petrol Nozzle 2

Diesel Nozzle 1

Diesel Nozzle 2

Fields:

Opening Reading (Liters)

Auto time stamp

Optional photo upload

🚫 Shift cannot start without opening readings.

🔴 PHASE 2: SHIFT CLOSING (STEP-BY-STEP WIZARD)

Shift closing MUST work like a wizard
❌ Steps cannot be skipped
❌ Order cannot be changed

STEP 3: CLOSING METER READINGS
Input Required:

Petrol Nozzle 1 – Closing

Petrol Nozzle 2 – Closing

Diesel Nozzle 1 – Closing

Diesel Nozzle 2 – Closing

System Calculation:
Total Liters = Closing – Opening


Calculated per nozzle & total.

STEP 4: TEST FUEL DEDUCTION (MANDATORY)
Input:

Petrol Test Liters

Diesel Test Liters

📌 Test fuel ≠ Sale

System Calculation:
Net Sale Liters = Total Liters – Test Liters


Test fuel must be tracked separately.

STEP 5: SALES VALUE CALCULATION (AUTO)

System applies:

Net Sale Liters × Current Rate


Creates:

Petrol Gross Sale

Diesel Gross Sale

Total Fuel Sale

🚫 Rates are NOT editable in shift.

STEP 6: RECOVERIES (STRICT FILTERED DROPDOWN)
Recovery Dropdown MUST SHOW ONLY:

Customers where:

Outstanding Credit Balance > 0


🚫 Customers with 0 balance must NOT appear.

On Recovery Entry:

Customer balance decreases

Amount ADDED to salesman cash

Auto saved in:

Customer Ledger

Recovery Module

Shift Activity Log

🚫 Over-recovery not allowed.

STEP 7: EXPENSES (CASH OUT)
Input:

Expense category

Amount

Optional note / receipt

Auto Actions:

❌ Deduct from salesman cash

✅ Save to:

Expenses Module

Shift Ledger

Date-wise reports

STEP 8: CREDITS ISSUED (NO CASH)
Rules:

Customer selection is COMPULSORY

If customer not found → Quick Add Customer

Auto Actions:

❌ Cash NOT added

✅ Customer balance increased

✅ Saved in:

Customer Account

Credit Reports

Shift Details

🚫 Anonymous credits are forbidden.

STEP 9: SUPPLIER PAYMENTS (CASH OUT)
Input:

Select supplier

Or Quick Add Supplier

Amount paid

Auto Actions:

❌ Deduct from salesman cash

✅ Supplier balance updated

✅ Saved in:

Supplier Ledger

Shift Expenses View

STEP 10: OIL / LUBE CASH ADJUSTMENT
Input:

Oil cash handed over

Auto Actions:

❌ Minus from fuel salesman cash

✅ Added to Lube Business Cash

📌 Fuel & Lube must stay separate.

STEP 11: DIGITAL CASH (NON-PHYSICAL)
Accounts:

JazzCash

EasyPaisa

POS

Auto Actions:

❌ Deduct from physical cash

✅ Add to Digital Ledger

✅ Sync to shift summary

STEP 12: BANK CASH DEPOSIT
Input:

Select bank

Deposit amount

Auto Actions:

❌ Deduct from salesman cash

✅ Add to Bank Ledger

✅ Sync to reports

STEP 13: FINAL SHIFT SUMMARY (KPI VIEW)
Must Display:
Fuel KPIs:

Opening / Closing Readings

Test Liters

Net Sale Liters

Total Fuel Sale

Financial KPIs:

Recoveries

Expenses

Credits

Supplier Payments

Oil Cash

Digital Cash

Bank Cash

Final Calculation:
Expected Cash With Salesman

STEP 14: EXPORT & SHARE

One-click options:

PDF

Image

WhatsApp

Print

Must include:

Station name

Shift

Salesman name & ID

Date & time

Full breakdown

STEP 15: SAVE & LOCK SHIFT
On Save:

Salesman confirmation (PIN / checkbox)

Optional manager approval

Result:

🔒 Shift locked

✏️ Editable only by Admin

🧾 Full audit trail required

STEP 16: POST-SHIFT ACTIVITY LOG

Below summary show:

Expenses

Credits (customer-wise)

Recoveries

Supplier payments

Digital & bank cash

Click → full detail view

5️⃣ AUTO-SYNC RULE (VERY IMPORTANT)

Every entry must auto-sync to:

Customers

Suppliers

Expenses

Recoveries

Digital Cash

Bank Cash

Date-wise analytics

Salesman performance

🚫 No duplicate manual entry anywhere.

🏆 FINAL GOLD RULE

This system must behave like a strict accountant, not a creative assistant.
No assumptions. No shortcuts. No invented flows.