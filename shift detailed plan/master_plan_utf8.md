__CNG & PREMIUM LUBE__

__ENTERPRISE REPORTING ENGINE__

*MASTER EXECUTION PLAN ΓÇö FINAL VERSION*

55\+ Reports per Module  ΓÇó  Production\-Grade  ΓÇó  Zero Compromises

Classification: BINDING  ΓÇó  All Instructions Non\-Negotiable

__SECTION 1 ΓÇö PRIME DIRECTIVE__

# __Prime Directive & Non\-Negotiable Rules__

This document is the single source of truth for the CNG & Premium Lube Enterprise Reporting Engine\. Every instruction herein is binding\. Partial implementation is a failure\. Deferring any item is a failure\. This system must meet world\-class production standards before any release\.

__≡ƒö┤  CRITICAL REQUIREMENT__

You are not permitted to deliver partial, placeholder, demo\-quality, or "good enough" work\.

Every feature must be 100% complete, 100% tested, and 100% integrated before it is marked done\.

TODO comments as substitutes for real code are strictly forbidden\.

Every open question in the previous plan has been resolved in this document\. There are no open questions\.

Proceed through phases in order\. Phase N cannot begin until Phase N\-1 is fully verified\.

## __Definition of "Complete"__

A feature is complete ONLY when ALL seven gates pass simultaneously:

__Gate__

__Criterion__

__Requirement__

1

Functional

Does exactly what the specification requires, with no missing states or edge cases

2

Accurate

All calculations \(P&L, margins, aging, totals\) verified against known test data

3

Integrated

Connects correctly with all related modules, stores, and the QuantumRegister grid

4

Validated

Client\-side and server\-side input validation implemented with proper error messages

5

Secure

RBAC permissions enforced; user cannot access data beyond their role

6

Performant

Loads in under 2 seconds; 5000\+ rows render without lag via pagination

7

Tested

Happy path and all failure paths verified with real data scenarios

__Γä╣∩╕Å   ARCHITECTURE DECISION__

A feature that passes 6 of 7 gates is NOT complete\. All 7 must pass without exception\.

__SECTION 2 ΓÇö ARCHITECTURE DECISIONS \(ALL RESOLVED\)__

# __Architecture Decisions ΓÇö Final & Binding__

All three open questions from the previous plan are now closed\. These decisions are final and must not be revisited during implementation\.

## __Decision 1 ΓÇö Registry Architecture: Unified Extension__

__Γ£à  CONFIRMED APPROACH__

DECIDED: Extend the existing unified ReportRegistry\.ts\. Do NOT build separate report systems for CNG or Lube\.

Rationale: ReportRegistry already has 115\+ Fuel reports with proven column definitions and data sources\.

ReportViewer\.tsx already renders any report via QuantumRegister with search, sort, pagination, and export\.

Building separate systems violates DRY and creates maintenance nightmares\. The unified approach wins\.

## __Decision 2 ΓÇö Data Resolver Architecture: Registry of Functions__

__Γ£à  CONFIRMED APPROACH__

DECIDED: Implement ReportDataResolver\.ts as a registry of resolver functions keyed by dataSource string\.

Rationale: The existing 600\-line switch/case for Fuel is already unacceptable\. Adding 110 more cases to a switch is a critical architecture failure\.

Pattern: resolverRegistry\[dataSource\]\(reportId, dateRange, module\) ΓåÆ \{ rows, totals \}

Each resolver function is independently testable, independently maintainable, and independently replaceable\.

Shared computation logic \(P&L, aging buckets, margin calculations\) extracted into shared utility functions called by multiple resolvers\.

## __Decision 3 ΓÇö Quick\-View Dashboards: Keep as KPI Overview, Link to Full System__

__Γ£à  CONFIRMED APPROACH__

DECIDED: CNGReports\.tsx and lube/Reports\.tsx remain as KPI dashboards \(Overview tab only\)\.

These pages show key metrics, today's summary, and live KPIs ΓÇö not the full report grid\.

Every tab that previously showed a simplified report grid is replaced with a "View All Reports ΓåÆ" button that navigates to /reports?module=CNG or /reports?module=LUBE\.

The Register tab links directly to the relevant report in ReportViewer via /reports/view/\{reportId\}\.

## __Decision 4 ΓÇö Cross\-Module Enterprise Reports: Yes, Implement__

__Γ£à  CONFIRMED APPROACH__

DECIDED: Implement an ENTERPRISE category visible only to users with role ADMIN or OWNER\.

This category contains unified P&L, unified Cash Flow, and unified Balance Sheet across all 3 business units\.

Enterprise reports appear in /reports only when businessUnit === "ALL" or user role is ADMIN/OWNER\.

7 Enterprise reports are defined in Section 4D of this document\.

## __Decision 5 ΓÇö Lube Module Reports: Fully Defined \(Not Assumed\)__

__Γ£à  CONFIRMED APPROACH__

DECIDED: All 55 Lube report definitions are written out explicitly in Section 5 with their own data source column\.

"Same structure as CNG" is NOT acceptable\. Each Lube report has its own title, category, and data source mapping\.

__SECTION 3 ΓÇö SYSTEM ARCHITECTURE__

# __System Architecture Overview__

## __3\.1 ΓÇö ReportDefinition Type Enhancement__

The following fields must be added to the ReportDefinition interface in ReportRegistry\.ts:

__Field__

__Type__

__Required__

__Purpose__

module

'FUEL'|'CNG'|'LUBE'|'ALL'|'ENTERPRISE'

Yes

Filters reports by active business unit

dataSource

string

Yes

Key into the resolver registry in ReportDataResolver\.ts

resolverParams

Record<string,any>

No

Extra static params passed to the resolver \(e\.g\. expense category filter\)

requiredRole

'STAFF'|'MANAGER'|'ADMIN'|'OWNER'

Yes

Minimum role required to view this report

exportFormats

\('EXCEL'|'PDF'|'CSV'\)\[\]

Yes

Allowed export formats for this report

supportsSchedule

boolean

Yes

Whether this report can be sent on automated schedule

category

string

Yes

Display category in the Reports dashboard sidebar

## __3\.2 ΓÇö New Report Categories__

The following categories must be added to the category registry:

__Category Key__

__Display Name__

__Applies To__

CNG\_FINANCIAL

Financial Reports

CNG

CNG\_CUSTOMER

Customer Reports

CNG

CNG\_SALES

Sales Reports

CNG

CNG\_INVENTORY

Inventory Reports

CNG

CNG\_SUPPLIER

Supplier Reports

CNG

CNG\_EXPENSE

Expense Reports

CNG

CNG\_AUDIT

Audit & Compliance

CNG

CNG\_OPERATIONS

Operational Reports

CNG

LUBE\_FINANCIAL

Financial Reports

LUBE

LUBE\_CUSTOMER

Customer Reports

LUBE

LUBE\_SALES

Sales Reports

LUBE

LUBE\_INVENTORY

Inventory & Products

LUBE

LUBE\_SUPPLIER

Supplier Reports

LUBE

LUBE\_EXPENSE

Expense Reports

LUBE

LUBE\_AUDIT

Audit & Compliance

LUBE

LUBE\_OPERATIONS

Operational Reports

LUBE

ENTERPRISE

Enterprise / Cross\-Module

ALL \(Admin only\)

## __3\.3 ΓÇö RBAC Permission Matrix__

Every report must enforce the requiredRole field\. The following matrix defines minimum access levels:

__Report Category__

__Minimum Role__

Daily Sales Summary

STAFF

Shift Reports, Daily Closing

STAFF

Customer Ledger, Transaction History

MANAGER

Supplier Ledger, PO History

MANAGER

P&L, Cash Flow, Balance Sheet

MANAGER

Expense Reports, Budget Reports

MANAGER

Full Audit Trail, Data Change History

ADMIN

Login & Access Log, Deleted Records Log

ADMIN

Enterprise / Cross\-Module Reports

ADMIN or OWNER

System Activity Report

OWNER

## __3\.4 ΓÇö Error Handling Standards__

ReportDataResolver\.ts must handle all failure states\. The QuantumRegister grid must display appropriate UI for each:

__Error State__

__Cause__

__Required UI Response__

EMPTY\_RESULT

Date range returns zero rows

Show "No data found for selected period" with date range hint

STORE\_UNAVAILABLE

Zustand store not initialized

Show "Data source unavailable\. Reload the page\." with retry button

COMPUTATION\_ERROR

Math error in derived value

Show "Calculation error in this report\. Contact admin\." Log to audit trail

PERMISSION\_DENIED

User role below requiredRole

Show "You do not have permission to view this report"

EXPORT\_FAILED

PDF/Excel generation fails

Show toast error with retry option\. Never show blank file download

DATE\_RANGE\_INVALID

Start date after end date

Show inline validation error before resolver is called

__SECTION 4 ΓÇö CNG MODULE: ALL 55 REPORT DEFINITIONS__

# __CNG Module ΓÇö 55 Report Definitions__

Every report below is mandatory\. All must appear in the Reports dashboard when businessUnit === "CNG"\. All must be fully functional with real data from the specified stores\. All must support Excel and PDF export minimum\.

## __4A ΓÇö Financial Reports \(10 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

1

CNG\_FINANCIAL

CNG Profit & Loss Statement

cngShifts \+ cngDecanting \+ cashBank \(CNG expenses\)

MANAGER

Excel, PDF

2

CNG\_FINANCIAL

CNG Cash Flow Statement

cashBank \(CNG\) \+ cngShifts collections

MANAGER

Excel, PDF

3

CNG\_FINANCIAL

CNG Balance Sheet Snapshot

All CNG ledgers: customer \+ supplier \+ cash

MANAGER

Excel, PDF

4

CNG\_FINANCIAL

CNG Revenue Breakdown by Dispenser

cngShifts grouped by nozzle/dispenser

MANAGER

Excel, PDF

5

CNG\_FINANCIAL

CNG Expense Breakdown by Category

cashBank filtered to CNG expense entries

MANAGER

Excel, PDF

6

CNG\_FINANCIAL

CNG Net Margin Report

\(revenue \- procurement \- expenses\) / revenue

MANAGER

Excel, PDF

7

CNG\_FINANCIAL

CNG Gross Profit Report

cngShifts revenue \- cngDecanting cost

MANAGER

Excel, PDF

8

CNG\_FINANCIAL

CNG Tax Summary Report

cngShifts taxable amounts if tax fields present

ADMIN

Excel, PDF

9

CNG\_FINANCIAL

CNG Outstanding Receivables

customerLedger \(CNG\) ΓÇö debit balances only

MANAGER

Excel, PDF

10

CNG\_FINANCIAL

CNG Outstanding Payables

supplierLedger \(CNG\) ΓÇö credit balances only

MANAGER

Excel, PDF

## __4B ΓÇö Customer Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

11

CNG\_CUSTOMER

CNG Full Customer Ledger

customerLedger filtered to CNG transactions

MANAGER

Excel, PDF

12

CNG\_CUSTOMER

CNG Customer Transaction History

customerLedger sorted by date desc, filterable by customer

MANAGER

Excel, PDF

13

CNG\_CUSTOMER

CNG Credit / Debit Summary

customerLedger ΓÇö net balance per customer

MANAGER

Excel, PDF

14

CNG\_CUSTOMER

CNG Top Customers by Revenue

customerLedger aggregated by customer, sorted desc

MANAGER

Excel

15

CNG\_CUSTOMER

CNG Customer Aging \(30/60/90 days\)

customerLedger ΓÇö overdue buckets by days outstanding

MANAGER

Excel, PDF

16

CNG\_CUSTOMER

CNG New vs Returning Customers

customerLedger ΓÇö first transaction date per customer

MANAGER

Excel

17

CNG\_CUSTOMER

CNG Customer Payment Behavior

customerLedger ΓÇö avg days to pay per customer

MANAGER

Excel

18

CNG\_CUSTOMER

CNG Customer Refund History

customerLedger ΓÇö refund/reversal entries only

MANAGER

Excel, PDF

## __4C ΓÇö Sales Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

19

CNG\_SALES

CNG Daily Sales Summary

cngShifts aggregated by date

STAFF

Excel, PDF

20

CNG\_SALES

CNG Sales by Dispenser/Nozzle

cngShifts grouped by nozzle ID

MANAGER

Excel

21

CNG\_SALES

CNG Sales by Employee

cngShifts grouped by staffId

MANAGER

Excel

22

CNG\_SALES

CNG Sales by Time Period \(Hourly/Weekly\)

cngShifts with time\-bucket grouping

MANAGER

Excel

23

CNG\_SALES

CNG Discount & Promotion Impact

discountStore filtered to CNG

MANAGER

Excel

24

CNG\_SALES

CNG Invoice Register

cngShifts \+ customerLedger credit entries

MANAGER

Excel, PDF

25

CNG\_SALES

CNG Period Comparison \(This vs Last\)

cngShifts ΓÇö current period vs prior period side\-by\-side

MANAGER

Excel

26

CNG\_SALES

CNG Average Transaction Value

cngShifts ΓÇö total revenue / transaction count

MANAGER

Excel

## __4D ΓÇö Inventory Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

27

CNG\_INVENTORY

CNG Stock Level \(Real\-time\)

cngStore\.totalCNGStock ΓÇö live value

MANAGER

Excel

28

CNG\_INVENTORY

CNG Inventory Movement History

cngDecanting \(in\) \+ cngShifts dispensed \(out\)

MANAGER

Excel, PDF

29

CNG\_INVENTORY

CNG Low Stock Alert Report

cngStore ΓÇö items below configured reorder threshold

MANAGER

Excel

30

CNG\_INVENTORY

CNG Inventory Valuation Report

cngStore stock quantity ├ù current procurement rate

MANAGER

Excel, PDF

31

CNG\_INVENTORY

CNG Consumption Report \(KG Dispensed\)

cngShifts ΓÇö total KG dispensed per period

MANAGER

Excel

32

CNG\_INVENTORY

CNG Wastage & Loss Report

cngStore ΓÇö variance: procured KG minus dispensed KG

ADMIN

Excel, PDF

33

CNG\_INVENTORY

CNG Reorder Point Analysis

cngShifts ΓÇö avg daily consumption ├ù lead time

MANAGER

Excel

34

CNG\_INVENTORY

CNG Supplier\-wise Stock Received

cngDecanting grouped by supplier

MANAGER

Excel

## __4E ΓÇö Supplier Reports \(6 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

35

CNG\_SUPPLIER

CNG Supplier Ledger

supplierLedger filtered to CNG suppliers

MANAGER

Excel, PDF

36

CNG\_SUPPLIER

CNG Purchase Order History

cngDecanting ΓÇö all decanting records with supplier detail

MANAGER

Excel, PDF

37

CNG\_SUPPLIER

CNG Supplier Payment Summary

supplierLedger ΓÇö payments made to each supplier

MANAGER

Excel, PDF

38

CNG\_SUPPLIER

CNG Purchase vs Consumption

cngDecanting \(procured\) vs cngShifts \(dispensed\) ΓÇö variance

MANAGER

Excel

39

CNG\_SUPPLIER

CNG Supplier Aging Report

supplierLedger ΓÇö overdue payables in 30/60/90\-day buckets

MANAGER

Excel, PDF

40

CNG\_SUPPLIER

CNG Supplier Performance \(Cost/KG\)

cngDecanting ΓÇö cost per KG by supplier over time

MANAGER

Excel

## __4F ΓÇö Expense Reports \(5 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

41

CNG\_EXPENSE

CNG Expense Register

cashBank ΓÇö all CNG\-tagged expense entries by date

MANAGER

Excel, PDF

42

CNG\_EXPENSE

CNG Expense by Category

cashBank CNG expenses ΓÇö grouped and summed by category

MANAGER

Excel

43

CNG\_EXPENSE

CNG Recurring Expense Tracker

cashBank ΓÇö expenses appearing in ΓëÑ3 consecutive periods

MANAGER

Excel

44

CNG\_EXPENSE

CNG Expense vs Budget Report

cashBank actuals vs configured budget targets per category

ADMIN

Excel, PDF

45

CNG\_EXPENSE

CNG Petty Cash Report

cashBank ΓÇö petty cash entries flagged for CNG

MANAGER

Excel, PDF

## __4G ΓÇö Audit & Compliance Reports \(5 reports\)__

__ΓÜá∩╕Å   WARNING / DECISION REQUIRED__

Reports 46ΓÇô50 require soft\-delete to be implemented BEFORE these reports exist\.

Report 49 \(Deleted Records Log\) cannot function if records are hard\-deleted\. See Phase 0 requirement\.

All audit reports require ADMIN role minimum\. These must not be visible to STAFF or MANAGER roles\.

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

46

CNG\_AUDIT

CNG Full Audit Trail Log

auditLogs ΓÇö all actions tagged CNG, with user, timestamp, before/after

ADMIN

Excel, PDF

47

CNG\_AUDIT

CNG Data Change History

auditLogs ΓÇö field\-level changes only, showing old value ΓåÆ new value

ADMIN

Excel, PDF

48

CNG\_AUDIT

CNG Login & Access Log

auditLogs ΓÇö authentication events, session start/end, failed logins

ADMIN

Excel

49

CNG\_AUDIT

CNG Deleted Records Recovery Log

auditLogs ΓÇö soft\-deleted records with deletion reason and deleted\_by

ADMIN

Excel, PDF

50

CNG\_AUDIT

CNG System Activity Report

auditLogs ΓÇö all system events in chronological order

OWNER

Excel

## __4H ΓÇö Operational Reports \(5 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

51

CNG\_OPERATIONS

CNG Shift\-wise Collections Report

cngShifts ΓÇö full per\-shift breakdown: opening, closing, sales, cash

STAFF

Excel, PDF

52

CNG\_OPERATIONS

CNG Meter/Dispenser Reading Log

cngShifts ΓÇö nozzle opening and closing meter readings per shift

MANAGER

Excel, PDF

53

CNG\_OPERATIONS

CNG Employee Performance Report

cngShifts grouped by staffId ΓÇö KG dispensed, revenue, shifts worked

MANAGER

Excel

54

CNG\_OPERATIONS

CNG Daily Closing Report

cngShifts ΓÇö end\-of\-day aggregate: total sales, cash, KG, variance

STAFF

Excel, PDF

55

CNG\_OPERATIONS

CNG Equipment Uptime Report

compressorStatus logs ΓÇö uptime %, downtime events, maintenance flags

ADMIN

Excel

__SECTION 5 ΓÇö LUBE MODULE: ALL 55 REPORT DEFINITIONS__

# __Lube Module ΓÇö 55 Report Definitions__

Every report below is mandatory and fully specified with its own data source\. The phrase "same as CNG" is not acceptable ΓÇö every Lube report has its own explicit definition\. All must appear in /reports when businessUnit === "LUBE"\.

## __5A ΓÇö Financial Reports \(10 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

1

LUBE\_FINANCIAL

Lube Profit & Loss Statement

lubeSales \+ lubeProducts cost \+ cashBank \(Lube expenses\)

MANAGER

Excel, PDF

2

LUBE\_FINANCIAL

Lube Cash Flow Statement

cashBank \(Lube\) \+ lubeSales POS collections

MANAGER

Excel, PDF

3

LUBE\_FINANCIAL

Lube Balance Sheet Snapshot

All Lube ledgers: customer \+ supplier \+ cash

MANAGER

Excel, PDF

4

LUBE\_FINANCIAL

Lube Revenue Breakdown by Service

lubeSales grouped by service type / product category

MANAGER

Excel, PDF

5

LUBE\_FINANCIAL

Lube Expense Breakdown by Category

cashBank filtered to Lube expense entries

MANAGER

Excel, PDF

6

LUBE\_FINANCIAL

Lube Net Margin Report

\(lubeSales revenue \- product cost \- expenses\) / revenue

MANAGER

Excel, PDF

7

LUBE\_FINANCIAL

Lube Gross Profit Report

lubeSales revenue \- lubeProducts cost of goods sold

MANAGER

Excel, PDF

8

LUBE\_FINANCIAL

Lube Tax Summary Report

lubeSales ΓÇö taxable amounts if tax fields present

ADMIN

Excel, PDF

9

LUBE\_FINANCIAL

Lube Outstanding Receivables

customerLedger \(Lube\) ΓÇö debit balances only

MANAGER

Excel, PDF

10

LUBE\_FINANCIAL

Lube Outstanding Payables

supplierLedger \(Lube\) ΓÇö credit balances only

MANAGER

Excel, PDF

## __5B ΓÇö Customer Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

11

LUBE\_CUSTOMER

Lube Full Customer Ledger

customerLedger filtered to Lube transactions

MANAGER

Excel, PDF

12

LUBE\_CUSTOMER

Lube Customer Transaction History

lubeSales \+ customerLedger filtered by customer

MANAGER

Excel, PDF

13

LUBE\_CUSTOMER

Lube Customer Credit / Debit Summary

customerLedger \(Lube\) ΓÇö net balance per customer

MANAGER

Excel, PDF

14

LUBE\_CUSTOMER

Lube Top Customers by Revenue

lubeSales aggregated by customerId, sorted desc

MANAGER

Excel

15

LUBE\_CUSTOMER

Lube Customer Aging \(30/60/90 days\)

customerLedger \(Lube\) ΓÇö overdue buckets by days outstanding

MANAGER

Excel, PDF

16

LUBE\_CUSTOMER

Lube New vs Returning Customers

lubeSales ΓÇö first visit date per customer \(vehicle reg\)

MANAGER

Excel

17

LUBE\_CUSTOMER

Lube Customer Payment Behavior

customerLedger \(Lube\) ΓÇö avg days to pay per customer

MANAGER

Excel

18

LUBE\_CUSTOMER

Lube Customer Refund History

lubeSales ΓÇö reversed/refunded transactions only

MANAGER

Excel, PDF

## __5C ΓÇö Sales Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

19

LUBE\_SALES

Lube Daily Sales Summary

lubeSales \(POS\) aggregated by date

STAFF

Excel, PDF

20

LUBE\_SALES

Lube Sales by Product/Service

lubeSales grouped by lubeProductId or serviceType

MANAGER

Excel

21

LUBE\_SALES

Lube Sales by Employee/Technician

lubeSales grouped by staffId

MANAGER

Excel

22

LUBE\_SALES

Lube Sales by Time Period

lubeSales with hourly / weekly / monthly grouping

MANAGER

Excel

23

LUBE\_SALES

Lube Discount & Promotion Impact

lubeSales ΓÇö discount amount vs full\-price revenue

MANAGER

Excel

24

LUBE\_SALES

Lube Invoice Register

lubeSales ΓÇö all invoices with customer, items, total

MANAGER

Excel, PDF

25

LUBE\_SALES

Lube Period Comparison \(This vs Last\)

lubeSales ΓÇö current vs prior period, side\-by\-side

MANAGER

Excel

26

LUBE\_SALES

Lube Average Transaction Value

lubeSales ΓÇö total revenue / invoice count per period

MANAGER

Excel

## __5D ΓÇö Inventory & Product Reports \(8 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

27

LUBE\_INVENTORY

Lube Stock Level \(Real\-time\)

lubeProducts\.stockQty ΓÇö live value per product

MANAGER

Excel

28

LUBE\_INVENTORY

Lube Inventory Movement History

lubeStockIn \(in\) \+ lubeSales items \(out\)

MANAGER

Excel, PDF

29

LUBE\_INVENTORY

Lube Low Stock Alert Report

lubeProducts ΓÇö items where stockQty < reorderPoint

MANAGER

Excel

30

LUBE\_INVENTORY

Lube Inventory Valuation Report

lubeProducts ΓÇö stockQty ├ù purchasePrice per product

MANAGER

Excel, PDF

31

LUBE\_INVENTORY

Lube Product Consumption Report

lubeSales items ΓÇö qty sold per product per period

MANAGER

Excel

32

LUBE\_INVENTORY

Lube Wastage & Loss Report

lubeStockIn received minus lubeSales sold minus closing stock

ADMIN

Excel, PDF

33

LUBE\_INVENTORY

Lube Reorder Point Analysis

lubeSales ΓÇö avg daily qty sold ├ù configured lead time

MANAGER

Excel

34

LUBE\_INVENTORY

Lube Supplier\-wise Stock Received

lubeStockIn grouped by supplierId

MANAGER

Excel

## __5E ΓÇö Supplier Reports \(6 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

35

LUBE\_SUPPLIER

Lube Supplier Ledger

supplierLedger filtered to Lube suppliers

MANAGER

Excel, PDF

36

LUBE\_SUPPLIER

Lube Purchase Order History

lubeStockIn ΓÇö all stock purchase records with supplier detail

MANAGER

Excel, PDF

37

LUBE\_SUPPLIER

Lube Supplier Payment Summary

supplierLedger ΓÇö payments made per Lube supplier

MANAGER

Excel, PDF

38

LUBE\_SUPPLIER

Lube Purchase vs Sales \(Margin Check\)

lubeStockIn cost vs lubeSales revenue per product

MANAGER

Excel

39

LUBE\_SUPPLIER

Lube Supplier Aging Report

supplierLedger \(Lube\) ΓÇö overdue payables by 30/60/90 days

MANAGER

Excel, PDF

40

LUBE\_SUPPLIER

Lube Supplier Performance Report

lubeStockIn ΓÇö cost per unit by supplier, trend over time

MANAGER

Excel

## __5F ΓÇö Expense Reports \(5 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

41

LUBE\_EXPENSE

Lube Expense Register

cashBank ΓÇö all Lube\-tagged expense entries by date

MANAGER

Excel, PDF

42

LUBE\_EXPENSE

Lube Expense by Category

cashBank Lube expenses ΓÇö grouped by category

MANAGER

Excel

43

LUBE\_EXPENSE

Lube Recurring Expense Tracker

cashBank ΓÇö Lube expenses appearing ΓëÑ3 consecutive periods

MANAGER

Excel

44

LUBE\_EXPENSE

Lube Expense vs Budget Report

cashBank actuals vs configured Lube budget per category

ADMIN

Excel, PDF

45

LUBE\_EXPENSE

Lube Petty Cash Report

cashBank ΓÇö petty cash entries flagged for Lube module

MANAGER

Excel, PDF

## __5G ΓÇö Audit & Compliance Reports \(5 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

46

LUBE\_AUDIT

Lube Full Audit Trail Log

auditLogs ΓÇö all actions tagged LUBE, user \+ timestamp \+ before/after

ADMIN

Excel, PDF

47

LUBE\_AUDIT

Lube Data Change History

auditLogs ΓÇö field\-level changes for Lube records

ADMIN

Excel, PDF

48

LUBE\_AUDIT

Lube Login & Access Log

auditLogs ΓÇö auth events, session times for Lube users

ADMIN

Excel

49

LUBE\_AUDIT

Lube Deleted Records Recovery Log

auditLogs ΓÇö soft\-deleted Lube records with deletion reason

ADMIN

Excel, PDF

50

LUBE\_AUDIT

Lube System Activity Report

auditLogs ΓÇö all Lube system events chronologically

OWNER

Excel

## __5H ΓÇö Operational Reports \(5 reports\)__

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

51

LUBE\_OPERATIONS

Lube Service History by Vehicle

lubeSales ΓÇö all services grouped by vehicle registration number

STAFF

Excel, PDF

52

LUBE\_OPERATIONS

Lube Technician Job Sheet Log

lubeSales ΓÇö per\-technician service records with time and product used

MANAGER

Excel, PDF

53

LUBE\_OPERATIONS

Lube Employee Performance Report

lubeSales grouped by staffId ΓÇö revenue, jobs completed, avg ticket

MANAGER

Excel

54

LUBE\_OPERATIONS

Lube Daily Closing Report

lubeSales ΓÇö end\-of\-day aggregate: services, cash, products used

STAFF

Excel, PDF

55

LUBE\_OPERATIONS

Lube Bay Utilization Report

serviceSlots or lubeSales ΓÇö jobs per bay per day, idle vs active time

MANAGER

Excel

__SECTION 6 ΓÇö ENTERPRISE CROSS\-MODULE REPORTS \(7 REPORTS\)__

# __Enterprise Reports ΓÇö Cross\-Module \(Admin Only\)__

These 7 reports are visible only when businessUnit === "ALL" or user role === ADMIN or OWNER\. They aggregate data from Fuel, CNG, and Lube simultaneously\. They require all three modules to share common store interfaces for financial data\.

__\#__

__Category__

__Report Title__

__Data Source__

__Role__

__Export__

E1

ENTERPRISE

Unified P&L Statement \(All Modules\)

fuelShifts \+ cngShifts \+ lubeSales \+ all cashBank

ADMIN

Excel, PDF

E2

ENTERPRISE

Unified Cash Flow Statement

All cashBank entries across all 3 modules

ADMIN

Excel, PDF

E3

ENTERPRISE

Unified Balance Sheet

All customer \+ supplier \+ cash ledgers combined

ADMIN

Excel, PDF

E4

ENTERPRISE

Revenue by Business Unit Comparison

Fuel vs CNG vs Lube ΓÇö revenue, expenses, margin side\-by\-side

ADMIN

Excel, PDF

E5

ENTERPRISE

Unified Customer Ledger \(All Modules\)

customerLedger ΓÇö all modules, filterable by module

ADMIN

Excel, PDF

E6

ENTERPRISE

Unified Expense Report \(All Modules\)

cashBank ΓÇö all expense entries, filterable by module

ADMIN

Excel, PDF

E7

ENTERPRISE

Unified Audit Trail \(All Modules\)

auditLogs ΓÇö all modules combined, filterable by module

OWNER

Excel, PDF

__SECTION 7 ΓÇö PHASED EXECUTION PLAN__

# __Phased Execution Plan__

Phases must be executed in order\. Phase N cannot begin until Phase N\-1 is 100% verified\. Each phase has explicit deliverables and a verification checkpoint that must pass before progression\.

__PHASE 0  __ΓÇö Data Audit & Prerequisites*   \[2ΓÇô3 Days\]*

__Scope: __Must complete before ANY code is written\. This phase prevents building reports on missing data\.

- Audit all Zustand stores: useCNGStore, useLubeStore, useProductStore, useSalesStore, useCustomerLedgerStore, useSupplierLedgerStore, useCashBankStore, useAuditStore, useStaffLedgerStore
- Verify every data source field referenced in Sections 4 & 5 actually exists in the store schema
- Document every missing field with its store name and required type
- Implement soft\-delete on all CNG and Lube record types \(required for Audit Reports 46ΓÇô50\)
- Verify auditLogs store captures: userId, timestamp, module tag, action, entity type, entity ID, old value, new value
- Verify RBAC roles \(STAFF, MANAGER, ADMIN, OWNER\) exist in the auth/user store
- CHECKPOINT: All required fields confirmed present OR added\. Soft\-delete implemented\. RBAC roles exist\.

__PHASE 1  __ΓÇö Registry Architecture Enhancement*   \[3ΓÇô5 Days\]*

__Scope: __Foundation ΓÇö must be done first\. Errors here break all subsequent phases\.

- Add module, dataSource, resolverParams, requiredRole, exportFormats, supportsSchedule fields to ReportDefinition interface
- Add all 17 new category keys to the category registry
- Add all 55 CNG report definitions to ReportRegistry\.ts with correct module, dataSource, and requiredRole
- Add all 55 Lube report definitions to ReportRegistry\.ts with correct module, dataSource, and requiredRole
- Add all 7 Enterprise report definitions to ReportRegistry\.ts
- Run: npx tsc \-\-noEmit ΓåÆ must return 0 errors
- CHECKPOINT: TypeScript compiles\. All 117 new report definitions present\. No existing Fuel reports broken\.

__PHASE 2  __ΓÇö ReportDataResolver\.ts ΓÇö Resolver Registry*   \[5ΓÇô8 Days\]*

__Scope: __The data engine\. Every report gets a resolver function\. Shared computation utilities extracted\.

- Create ReportDataResolver\.ts with resolver registry pattern: resolverRegistry\[dataSource\]\(reportId, dateRange, module, params\)
- Extract shared utility functions: computePnL\(\), computeAging\(\), computeMargin\(\), computeVariance\(\) ΓÇö shared across Fuel/CNG/Lube
- Implement all 55 CNG resolver functions \(one per unique dataSource string\)
- Implement all 55 Lube resolver functions \(one per unique dataSource string\)
- Implement all 7 Enterprise resolver functions
- Each resolver must return \{ rows: T\[\], totals?: Record<string, number>, meta?: \{ generated, rowCount \} \}
- Each resolver must handle all 6 error states defined in Section 3\.4
- CHECKPOINT: All resolvers return correct data verified against manually computed test values for at least 3 reports per category\.

__PHASE 3  __ΓÇö Reports\.tsx Dashboard ΓÇö Module Filtering & RBAC*   \[2ΓÇô3 Days\]*

__Scope: __The Reports dashboard becomes module\-aware and role\-aware\.

- Read active businessUnit from settings store
- Filter REPORT\_REGISTRY to show only reports where report\.module === businessUnit OR report\.module === "ALL"
- Filter REPORT\_REGISTRY to show only reports where userRole >= report\.requiredRole
- Category sidebar dynamically shows only categories present in the filtered report list
- Category counts update in real time when filters change
- Enterprise category visible only to ADMIN and OWNER roles
- Search bar searches across title, category, and dataSource fields
- CHECKPOINT: Switch to CNG ΓåÆ see 55 CNG reports \+ 7 Enterprise \(if admin\)\. Switch to Lube ΓåÆ see 55 Lube reports\. STAFF sees no audit reports\.

__PHASE 4  __ΓÇö ReportViewer\.tsx ΓÇö Resolver Integration*   \[2ΓÇô3 Days\]*

__Scope: __ReportViewer stops using inline data logic and delegates entirely to ReportDataResolver\.

- Replace all inline switch/case data resolution with: const \{ rows, totals \} = await ReportDataResolver\.resolve\(reportId, dateRange, module\)
- Implement PDF export path using the report column definitions and resolver output
- Implement Excel export using existing export logic but fed by resolver output
- Display totals row at bottom of QuantumRegister when report includes totals
- Show report metadata: generated timestamp, row count, date range applied
- Implement all 6 error state UI responses defined in Section 3\.4
- CHECKPOINT: Open any CNG report ΓåÆ QuantumRegister shows real data\. Export Excel ΓåÆ correct columns\. Export PDF ΓåÆ renders correctly\.

__PHASE 5  __ΓÇö Quick\-View Dashboard Links*   \[1 Day\]*

__Scope: __CNGReports\.tsx and lube/Reports\.tsx updated to link into the full report system\.

- Remove any simplified report grid tabs from CNGReports\.tsx and lube/Reports\.tsx
- Keep Overview/KPI tabs as\-is ΓÇö these are valuable and must stay
- Add "View All 55\+ Reports ΓåÆ" button in each module dashboard linking to /reports?module=CNG or /reports?module=LUBE
- Register tab \(if present\) links to /reports/view/\{most relevant reportId\} for that module
- CHECKPOINT: Click "View All Reports" in CNG dashboard ΓåÆ lands on /reports showing 55 CNG reports filtered\.

__PHASE 6  __ΓÇö Security ΓÇö PDF Export & Scheduled Reports*   \[2ΓÇô3 Days\]*

__Scope: __PDF export implemented\. Scheduled/automated report delivery configured\.

- Implement PDF export using a PDF library \(pdfmake or jsPDF\) with professional layout: logo, report title, date range, column headers, data rows, totals footer
- PDF output must match the column definitions in the report definition
- Implement report scheduling: ADMIN can set a report to run daily/weekly/monthly and deliver by email
- Scheduled reports stored in a scheduleStore with: reportId, frequency, recipients, lastRun, nextRun
- Implement report favorites: users can pin up to 10 reports to their dashboard
- Favorites stored per user in userPreferencesStore
- CHECKPOINT: Export PDF on P&L report ΓåÆ professional layout renders\. Schedule a daily closing report ΓåÆ confirm schedule saved\.

__PHASE 7  __ΓÇö Financial Accuracy Verification*   \[2ΓÇô3 Days\]*

__Scope: __All financial reports verified against known test data sets with pre\-calculated correct values\.

- Create a test data fixture file with known CNG and Lube transactions spanning 3 months
- Pre\-calculate expected P&L, Cash Flow, Receivables, Aging, and Margin values manually
- Run all 10 Financial reports in CNG module against test data ΓÇö verify every total matches expected
- Run all 10 Financial reports in Lube module against test data ΓÇö verify every total matches expected
- Run all 7 Enterprise reports against combined test data ΓÇö verify cross\-module totals
- Fix any discrepancy found ΓÇö do not proceed until all financial reports produce correct numbers
- CHECKPOINT: All financial report outputs match pre\-calculated expected values to 2 decimal places\.

__PHASE 8  __ΓÇö Full System QA & Performance Verification*   \[3ΓÇô5 Days\]*

__Scope: __End\-to\-end testing under realistic business conditions\. Performance benchmarks confirmed\.

- Load 5000\+ rows of synthetic CNG data into cngStore ΓÇö verify QuantumRegister renders without lag
- Test all 55 CNG reports and all 55 Lube reports in sequence ΓÇö verify all load data correctly
- Test all 7 Enterprise reports ΓÇö verify cross\-module aggregation is correct
- Test RBAC: log in as STAFF ΓåÆ verify audit reports are hidden\. Log in as MANAGER ΓåÆ verify access\. Log in as ADMIN ΓåÆ verify enterprise reports visible
- Test all error states: empty date range, invalid range, permission denied ΓÇö verify correct UI for each
- Performance: Reports dashboard must load in under 2 seconds with 117\+ report definitions
- Performance: Any individual report must load data in under 3 seconds for a 1\-year date range
- Mobile responsive test: all reports dashboard and viewer must function on 375px viewport
- Dark mode test: all report pages must render correctly in both light and dark mode
- CHECKPOINT: All 117 reports functional\. All RBAC rules enforced\. All performance targets met\. Zero known bugs\.

__SECTION 8 ΓÇö DATA INTEGRITY, SECURITY & BACKUP__

# __Data Integrity Requirements__

## __8\.1 ΓÇö Record Standards__

Every record in every store must carry the following fields\. Any record missing these fields is considered corrupt and must be flagged:

__Field__

__Type__

__Purpose__

created\_at

ISO timestamp

When the record was created

updated\_at

ISO timestamp

When the record was last modified

created\_by

userId string

Who created the record

updated\_by

userId string

Who last modified the record

is\_deleted

boolean \(default: false\)

Soft\-delete flag ΓÇö NEVER hard delete

deleted\_at

ISO timestamp or null

When soft\-deleted \(null if active\)

deleted\_by

userId string or null

Who soft\-deleted \(null if active\)

module

'FUEL'|'CNG'|'LUBE'

Which business unit owns this record

## __8\.2 ΓÇö Transaction Atomicity__

__≡ƒö┤  CRITICAL REQUIREMENT__

All financial transactions must be atomic\. If any part of a multi\-store write fails, the entire operation must roll back\.

Partial writes are a critical failure\. A sale that debits cashBank but fails to credit customerLedger corrupts the books\.

Use a transaction wrapper pattern: beginTransaction\(\) ΓåÆ write all stores ΓåÆ commitTransaction\(\) or rollbackAll\(\)

## __8\.3 ΓÇö Validation Rules__

All inputs must be validated on both client and server side\. The following validations are mandatory:

__Field Type__

__Validation Required__

Monetary amounts

Must be positive numbers with max 2 decimal places\. Reject negative unless explicitly a credit/refund

Dates

Must be valid ISO dates\. Start date must be Γëñ end date for all date ranges

Quantities \(KG, litres\)

Must be positive numbers\. Zero quantity is only valid for wastage records

Customer/Supplier IDs

Must reference an existing record in the respective ledger store

Staff IDs

Must reference an existing user in the auth store with role STAFF or higher

Phone numbers

Must match configured locale format\. Reject if empty when customer creation requires it

Report date ranges

Maximum span of 5 years\. Ranges exceeding this must show a warning before proceeding

## __8\.4 ΓÇö Backup & Recovery__

__≡ƒö┤  CRITICAL REQUIREMENT__

Automated backups must run every 24 hours minimum\.

Each backup must be restorable independently ΓÇö test restore must complete successfully on at least one backup per week\.

Backup must include: all Zustand store states, all user data, all audit logs\.

A manual backup trigger must be available to ADMIN users at any time from the Settings panel\.

Backup retention: keep last 30 daily backups minimum\.

__SECTION 9 ΓÇö UI/UX & PERFORMANCE STANDARDS__

# __UI/UX Requirements__

## __9\.1 ΓÇö Performance Benchmarks \(Non\-Negotiable\)__

__Page / Action__

__Maximum Allowed Time__

__Measurement Condition__

Reports dashboard initial load

2 seconds

With 117\+ report definitions in registry

Individual report data load

3 seconds

For a 1\-year date range

QuantumRegister with 5000\+ rows

No visible lag

Pagination at 50 rows ΓÇö never render all rows at once

Excel export generation

5 seconds

For reports with up to 10,000 rows

PDF export generation

8 seconds

For reports with up to 500 rows

Report search / filter

Instant \(< 100ms\)

Client\-side filtering, no server round trip

## __9\.2 ΓÇö Report Dashboard UI Requirements__

- Category sidebar must collapse on mobile \(Γëñ 768px\) into a dropdown or sheet
- All report lists must support: text search, category filter, module filter, role\-based visibility
- Pinned/favorite reports must appear at the top of the list in a dedicated section
- Each report card must show: title, category, last run date, export format badges
- Report viewer must show: report title, applied date range, generated timestamp, total row count
- QuantumRegister must support: column sort, column search, pagination controls, export button
- Dark mode must be fully functional ΓÇö no hardcoded colors anywhere in report pages
- All interactive elements must have keyboard navigation support \(Tab, Enter, Escape\)

__SECTION 10 ΓÇö RELEASE CRITERIA__

# __Release Criteria ΓÇö All Must Pass__

This system must NOT be released until every single item below is verified as complete\. A system that passes 49 of 50 items is not ready for release\.

## __Functional Completeness__

1. All 55 CNG reports are implemented, showing real data from the correct stores
2. All 55 Lube reports are implemented, showing real data from the correct stores
3. All 7 Enterprise reports are implemented and restricted to ADMIN/OWNER roles
4. All reports support Excel export with correct columns
5. All reports marked PDF in their definition support PDF export with professional layout
6. Report scheduling is implemented and delivers reports by email on configured schedule
7. Report favorites/pinning is implemented per user

## __Data Accuracy__

1. All 10 CNG Financial reports verified against test data with correct totals
2. All 10 Lube Financial reports verified against test data with correct totals
3. All aging calculations \(30/60/90 days\) verified against known overdue records
4. All P&L calculations verified: revenue \- COGS \- expenses = net profit \(correct to 2 decimal places\)
5. Soft\-delete implemented ΓÇö deleted records appear in Deleted Records Log, not in active reports

## __Security & Access Control__

1. STAFF users cannot see any Audit or Expense vs Budget reports
2. MANAGER users cannot see Enterprise reports or System Activity reports
3. ADMIN users can see all reports for their assigned module plus Enterprise reports
4. OWNER users can see all reports across all modules
5. Unauthorized access attempt shows permission denied message ΓÇö not an empty report

## __Performance__

1. Reports dashboard loads in under 2 seconds with 117\+ definitions
2. Any individual report loads in under 3 seconds for a 1\-year date range
3. QuantumRegister with 5000\+ rows shows no visible lag \(pagination enforced\)
4. Mobile viewport \(375px\) is fully functional for all report pages

## __System Stability__

1. npx tsc \-\-noEmit returns 0 errors
2. No console errors in production build
3. All 6 error states produce correct UI \(no blank screens or unhandled exceptions\)
4. Light mode and dark mode both render correctly on all report pages
5. Automated backup is configured and a test restore has completed successfully

__≡ƒö┤  CRITICAL REQUIREMENT__

ANY item above that is not verified is a BLOCKER\. The system is not ready for customers, real business data, or market release until all 25 release criteria are verified\.

Do not request approval for release until Phase 8 \(Full System QA\) is 100% complete\.

__SECTION 11 ΓÇö SUMMARY & QUICK REFERENCE__

# __Summary__

## __Total Report Count__

__Module__

__Reports__

__Categories__

CNG Module

55

Financial \(10\), Customer \(8\), Sales \(8\), Inventory \(8\), Supplier \(6\), Expense \(5\), Audit \(5\), Operational \(5\)

Lube Module

55

Financial \(10\), Customer \(8\), Sales \(8\), Inventory \(8\), Supplier \(6\), Expense \(5\), Audit \(5\), Operational \(5\)

Enterprise \(Cross\-Module\)

7

Unified P&L, Cash Flow, Balance Sheet, Revenue Comparison, Customer Ledger, Expense, Audit Trail

Fuel Module \(existing\)

115

Unchanged ΓÇö existing registry

TOTAL

232

Across all modules

## __Phase Timeline Summary__

__Phase__

__Title__

__Effort__

__Priority__

0

Data Audit & Prerequisites

2ΓÇô3 Days

BLOCKING ΓÇö do first

1

Registry Architecture Enhancement

3ΓÇô5 Days

CRITICAL

2

ReportDataResolver\.ts ΓÇö Resolver Registry

5ΓÇô8 Days

CRITICAL

3

Reports\.tsx Dashboard ΓÇö Module & RBAC Filtering

2ΓÇô3 Days

REQUIRED

4

ReportViewer\.tsx ΓÇö Resolver Integration

2ΓÇô3 Days

REQUIRED

5

Quick\-View Dashboard Links

1 Day

STANDARD

6

Security, PDF Export & Scheduled Reports

2ΓÇô3 Days

REQUIRED

7

Financial Accuracy Verification

2ΓÇô3 Days

VERIFICATION

8

Full System QA & Performance Verification

3ΓÇô5 Days

VERIFICATION

TOTAL

ΓÇö

22ΓÇô34 Days

All phases mandatory

__Γ£à  CONFIRMED APPROACH__

This is the final, complete, binding specification\. There are no open questions\. All architecture decisions are made\.

All 110 module reports are fully defined with explicit data sources, roles, and export formats\.

All 7 Enterprise reports are defined\. All 9 phases are scoped with verification checkpoints\.

Implementation begins at Phase 0\. Do not skip\. Do not reorder\. Do not partially implement\.

