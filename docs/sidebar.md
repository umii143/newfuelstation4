✅ MASTER PRINCIPLE (VERY IMPORTANT)
Menus represent ENTITIES
Credits / Debits / Payments are TRANSACTIONS
Balances are CALCULATED, never stored separately

If this rule is followed →
✔ no duplicates
✔ no confusion
✔ easy audits
✔ future-proof system

1️⃣ CUSTOMERS — DETAILED DESIGN
Menu

Customers

❌ Do NOT create:

Customer Credits

Customer Recoveries

Customer Debits

Customer Structure
Customer Master

Customer ID (Auto)

Name

Phone

Type (Walk-in / Credit / Fleet)

Credit Limit

Status (Active / Blocked)

Opening Balance

Linked Business (Petrol / CNG / Lube)

Customer Ledger (CORE)

Every financial activity is recorded as a ledger entry:

Transaction Types

Sale (Debit)

Recovery / Payment (Credit)

Discount Adjustment

Debit Note

Credit Note

Opening Balance Entry

Ledger Columns

Date

Shift ID

Transaction Type

Reference (Invoice / Receipt)

Debit Amount

Credit Amount

Running Balance

Entered By (User)

Remarks

👉 Balance is auto-calculated
👉 No manual balance editing allowed

Customer Profile Tabs (UI)

Inside one customer:

Overview

Ledger

Sales History

Recoveries

Aging

Credit Limit

Attachments (Invoices, Receipts)

Audit Trail

Why Recoveries is NOT a Menu

Recovery = a payment transaction

Payments belong inside ledger

Separate menu breaks accounting logic

2️⃣ SUPPLIERS — DETAILED DESIGN
Menu

Suppliers

❌ Do NOT create:

Supplier Payables

Supplier Payments

Supplier Master

Supplier ID

Name

Contact Info

Product Type (Fuel / Oil / Services)

Payment Terms

Opening Balance

Status

Supplier Ledger
Transaction Types

Purchase (Credit)

Payment (Debit)

Debit Note

Credit Note

Opening Balance

Ledger Columns

Date

Purchase Invoice No

Payment Ref

Debit

Credit

Balance

Due Date

User / Shift

Supplier Tabs

Overview

Ledger

Purchases

Payments

Aging

Documents

Audit Log

Payables Logic

Payables = Sum(Purchases) − Sum(Payments)

No separate screen needed.

3️⃣ CASH, BANKS & DIGITAL WALLETS
Menu

Cash & Banks

Sub-Entities

Cash Counter

Bank Accounts

Digital Wallets (JazzCash, Easypaisa, POS)

Each has its OWN Ledger

Same rules apply:

Transaction Types

Receipt

Payment

Transfer

Opening Balance

Adjustment

Why no separate “Cash Receipts” menu?

Because:

Receipt = transaction

Ledger shows truth

Shift closing uses ledger totals

4️⃣ EXPENSES — SPECIAL CASE

Expenses ARE allowed as a menu because:

They are operational entries

They don’t belong to one entity ledger

Expense Entry Includes:

Category

Amount

Paid From (Cash/Bank)

Shift

Approved By

But internally →
expense still posts to Cash/Bank ledger

5️⃣ REPORTS (READ-ONLY ZONE)

Reports NEVER create data.

Examples:

Customer Outstanding Report

Supplier Payables Aging

Daily Recovery Report

Shift Profit/Loss

Cash Reconciliation

Stock vs Sales

Tax Reports

6️⃣ WHEN EXTRA SCREENS ARE ALLOWED
Allowed:

Quick Recovery Screen (shortcut only)

Daily Cash Collection

Shift Closing Summary

👉 These are tools, not masters.

7️⃣ FINAL CLEAN MENU (NON-DUPLICATE)

Dashboard

Shift Management

Sales

Customers

Suppliers

Inventory

Purchases

Expenses

Cash & Banks

Staff & Payroll

Assets & Maintenance

Reports

Analytics / KPIs

Audit Logs

Settings
