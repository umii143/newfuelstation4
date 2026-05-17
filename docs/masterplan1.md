# MOTORWAY OIL - ENTERPRISE EDITION v4.0
## PRODUCT REQUIREMENTS DOCUMENT (PRD)

---

## DOCUMENT CONTROL

| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | January 29, 2026 | Product Team | FINAL DRAFT |

**Classification:** World-Class Premium Fuel Station Management System  
**Target Ranking:** Top 20 Global Fuel Management Platforms  
**Quality Standard:** Gold Medalist / Zero-Defect Architecture

---

# PART 1: STRATEGIC FOUNDATION

## 1.1 EXECUTIVE SUMMARY

**Motorway Oil - Enterprise Edition v4.0** is a hyper-premium, zero-defect fuel station management ecosystem designed to revolutionize multi-fuel retail operations. This system addresses critical pain points in the $3 trillion global fuel retail industry:

- **Cash Leakage Prevention**: Automated variance tracking with AI-powered anomaly detection
- **Inventory Precision**: Real-time stock management with IoT integration capability
- **Regulatory Compliance**: Built-in audit trails and tax reporting
- **Operational Intelligence**: Predictive analytics for fuel demand and staff performance

**Market Differentiation:**
- First-in-class hybrid fuel management (Petrol + Diesel + CNG + Hydrogen-ready)
- Military-grade data integrity with blockchain-ready architecture
- Ultra-premium UI/UX with accessibility compliance (WCAG 2.2 Level AAA)
- Enterprise-grade security (SOC 2 Type II ready)

---

## 1.2 ENHANCED USER PERSONAS

### Persona 1: The Enterprise Owner (C-Suite)
**Profile:**
- Manages 5-50 stations across multiple regions
- Focus: ROI, compliance, strategic growth
- Tech Savviness: Medium
- Daily Usage: 15-30 minutes (dashboard review)

**Critical Needs:**
- Cross-station performance comparison
- Real-time variance alerts on mobile
- Tax-ready financial reports
- Fuel price optimization recommendations

**Success Metrics:**
- Reduce cash variance to <0.3%
- Increase gross margin by 8%
- Achieve 99.9% inventory accuracy

---

### Persona 2: The Station Manager (Operations Lead)
**Profile:**
- On-site 10-12 hours daily
- Manages 8-15 staff members
- Handles supplier relationships
- Tech Savviness: Medium-High

**Critical Needs:**
- Quick shift handover process (<3 minutes)
- Staff performance tracking dashboard
- Automated re-order points for inventory
- Dispute resolution tools (CCTV timestamp sync)

**Pain Points:**
- Manual reconciliation takes 45+ minutes per shift
- Paperwork errors in stock-in entries
- Staff attendance disputes

---

### Persona 3: The Cashier/POS Operator
**Profile:**
- Part-time/full-time hourly workers
- Age: 20-40 years
- Tech Savviness: Low-Medium
- Transaction Volume: 150-300 sales/shift

**Critical Needs:**
- Foolproof POS interface (max 3 taps per sale)
- Quick void/correction mechanism
- Visual confirmation (large fonts, colors)
- Offline reliability during internet outages

---

### Persona 4: The Field Auditor (NEW)
**Profile:**
- Regional quality control inspector
- Visits 10-15 stations per week
- Needs instant compliance verification

**Critical Needs:**
- Instant access to 90-day transaction logs
- Variance trend analysis
- Photo-based tank dip verification
- Regulatory checklist completion

---

### Persona 5: The Fuel Attendant (NEW)
**Profile:**
- Operates nozzles and performs tank dipping
- Tech Savviness: Low
- Works in outdoor conditions

**Critical Needs:**
- Voice-based meter reading input (future)
- Weather-resistant tablet interface
- Large touch targets (min 44x44px)
- Auto-save to prevent data loss

---

## 1.3 PROBLEM STATEMENT & SOLUTION FIT

### Critical Industry Problems:

**1. Cash Variance Crisis**
- Industry Average: 2-5% cash shortage per shift
- Annual Loss (50-pump station): $120,000 - $300,000
- **Solution:** Real-time nozzle-to-cash reconciliation with AI anomaly detection

**2. Inventory Theft & Evaporation**
- Fuel evaporation losses: 0.5-1.5% annually
- Pilferage: 1-3% of total stock
- **Solution:** IoT tank level monitoring + temperature compensation algorithms

**3. Regulatory Compliance Burden**
- Manual tax filing errors: 15-20% of stations face penalties
- Audit preparation time: 40-60 hours/quarter
- **Solution:** Automated GST/VAT reports + blockchain audit trail

**4. Staff Performance Opacity**
- 30% variance in sales efficiency across staff
- No data-driven hiring/firing decisions
- **Solution:** AI-powered performance scoring + predictive scheduling

---

# PART 2: FUNCTIONAL REQUIREMENTS (ENHANCED)

## 2.1 FUEL OPERATIONS MODULE

### FR-01: Advanced Tank Monitoring System

**Capability Level:** Enterprise IoT-Enabled

**Requirements:**
1. **Real-Time Tank Visualization**
   - 3D tank model with fill animation
   - Color-coded levels: Red (<15%), Yellow (15-30%), Green (>30%)
   - Historical 30-day level chart overlay

2. **Automated Reconciliation**
   - Formula: `Stock Change = (Deliveries + Opening Stock) - (Sales + Evaporation + Variance)`
   - Evaporation calculation: `0.2% daily for temp >30°C`
   - Variance threshold: Auto-alert if >0.5% per shift

3. **Predictive Alerts**
   - "Reorder Point" calculation: `(Daily Avg Sales * Lead Time) + Safety Stock`
   - Weather-based demand prediction (integrate weather API)
   - Price war alert: Detect if competitors drop prices (future integration)

4. **IoT Integration (Premium Tier)**
   - API support for Automatic Tank Gauges (ATG)
   - Protocol: Modbus TCP/IP or OPC UA
   - Auto-sync every 15 minutes
   - Leak detection: Alert if drop exceeds evaporation rate

**UI Specifications:**
```
┌─────────────────────────────────────┐
│  TANK 1: PETROL (92 OCTANE)         │
│  ████████████░░░░ 68%               │
│  Current: 18,450 L / Capacity: 27,000 L │
│  ⚠️ Reorder in 3 days                │
│  📊 7-Day Trend ↗️ +12%               │
└─────────────────────────────────────┘
```

**Test Cases:**
- TC-01: Verify alert triggers at 14.9% level
- TC-02: Test negative stock scenario (should block sales)
- TC-03: Validate evaporation calculation for 45°C temperature
- TC-04: Concurrent shift closing (2 users) - data integrity check

---

### FR-02: Shift Closing Wizard (Zero-Error Design)

**Process Flow:**
```
Step 1: Staff Selection (Mandatory)
  ↓
Step 2: Nozzle Reading Entry (with photo proof)
  ↓
Step 3: Test Volume Deduction
  ↓
Step 4: Cash Declaration
  ↓
Step 5: Expense Entry
  ↓
Step 6: Variance Calculation & Approval
  ↓
Step 7: Digital Signature + Timestamp
```

**Enhanced Requirements:**

1. **Mandatory Fields Enforcement**
   - Cannot proceed if ANY nozzle reading is missing
   - Must photograph each nozzle display (OCR verification - future)
   - Require manager PIN if variance exceeds ±0.5%

2. **Intelligent Variance Analysis**
   ```
   Variance = Actual Cash - (Calculated Revenue - Expenses)
   
   If Variance < -₨500: Red Flag (investigate theft)
   If Variance > +₨500: Overpayment by customer (rare)
   If |Variance| < ₨100: Acceptable (mark green)
   ```

3. **Test Volume Management**
   - Pre-set Test Vol per nozzle (configurable in Settings)
   - Auto-deduct from gross sales
   - Log: Date, Nozzle, Volume, Reason

4. **Cash Denomination Entry**
   - Visual calculator: 
     ```
     ₨5000 x [__] = ₨_____
     ₨1000 x [__] = ₨_____
     ₨500  x [__] = ₨_____
     Total = ₨_____
     ```
   - Compare with expected cash (auto-highlight difference)

5. **Digital Handover**
   - Generate PDF shift report
   - Email to owner + manager
   - Store in blockchain-ready hash (SHA-256)

**UI - Progressive Disclosure:**
```
═══════════════════════════════════════
 SHIFT CLOSING - STEP 2/7
═══════════════════════════════════════
 
 NOZZLE 1 (Petrol 92)
 ┌──────────────────────────┐
 │ Opening: 245,670.5 L     │
 │ Closing:  246,890.2 L ✓  │
 │ Sold:     1,219.7 L      │
 │ Revenue:  ₨ 341,516      │
 │ 📷 [Photo Proof]         │
 └──────────────────────────┘
 
 [Back]  [Next: Nozzle 2 →]
═══════════════════════════════════════
```

---

### FR-03: Dynamic Rate Management

**Requirements:**

1. **Real-Time Price Updates**
   - Single click updates across ALL nozzles
   - Effective timestamp: Immediate or Scheduled (12:01 AM)
   - SMS/Email notification to all staff on duty

2. **Price History Ledger**
   - Log: Old Rate, New Rate, Changed By, Timestamp
   - Chart: 90-day price trend
   - Competitor price tracking (manual entry for now)

3. **Margin Protection**
   - Warning if Sale Price < Cost Price + ₨5/liter
   - Recommend optimal margin based on competitor data

4. **Fuel-Type Specific Pricing**
   - Support differential pricing (e.g., Premium vs Regular)
   - Volume-based discounts (e.g., Truck sales at -₨2/liter)

**Test Cases:**
- TC-05: Update rate at 11:59 PM, verify shift closing uses old rate
- TC-06: Change rate mid-shift, confirm next sale uses new rate
- TC-07: Attempt to set rate below cost (should show warning but allow with PIN)

---

## 2.2 CNG OPERATIONS MODULE (ADVANCED)

### FR-04: Pressure & Cascade System Monitoring

**Requirements:**

1. **Real-Time Pressure Gauges**
   - Display: Primary Compressor (0-250 bar)
   - Display: Cascade Bank A, B, C (visual gauges)
   - Alert: If pressure drops below 180 bar (low efficiency)

2. **Compressor Health Tracking**
   - Operating Hours meter
   - Maintenance reminder at 5,000 hours
   - Temperature monitoring (overheat alert >85°C)

3. **Gas Composition Analysis (Premium Feature)**
   - Methane purity %
   - Calor ific value tracking
   - Compliance with ISO 15403 standards

**UI Design:**
```
╔═══════════════════════════════════════╗
║  CNG COMPRESSOR STATION               ║
╠═══════════════════════════════════════╣
║                                       ║
║   ⚙️ COMPRESSOR                        ║
║   ████████████████░░ 210 bar         ║
║   Status: ✅ OPERATIONAL               ║
║   Temp: 68°C  Hours: 3,245           ║
║                                       ║
║   💾 CASCADE BANKS                     ║
║   Bank A: ████████ 195 bar           ║
║   Bank B: ██████░░ 165 bar           ║
║   Bank C: ████░░░░ 140 bar           ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

### FR-05: Trailer Refill Workflow

**Requirements:**

1. **Trailer Arrival Logging**
   - Capture: Supplier, Vehicle #, Arrival Time, Starting Pressure
   - Photo: Vehicle registration + seal number

2. **Automatic Stock Credit**
   - Formula: `Stock Added (KG) = (Final Pressure - Initial Pressure) * Conversion Factor`
   - Conversion Factor: Configurable per cascade volume

3. **Quality Check**
   - Moisture test result (Pass/Fail)
   - Odorization level (required for safety)

**Test Cases:**
- TC-08: Verify cascade pressure resets to max after trailer refill
- TC-09: Test partial refill scenario (trailer disconnected early)

---

## 2.3 LUBE SHOP & INVENTORY MODULE

### FR-07: Advanced Product Management

**Requirements:**

1. **Product Catalog**
   - Fields: SKU, Name, Category, Brand, Cost, Sale Price, Tax %, Barcode
   - Support: Variable pricing (Wholesale vs Retail)
   - Multi-unit support (Liter, Quart, Gallon for imported oils)

2. **Category Management**
   - Hierarchical: Engine Oil → Synthetic → 5W-30
   - Custom attributes per category (e.g., Viscosity for oils)

3. **Barcode Integration**
   - Generate QR codes for custom products
   - Scanner support (USB/Bluetooth)
   - Auto-search by barcode during POS

4. **Stock Alerts**
   - Reorder Point = (Daily Avg Sales * 7) + Safety Stock
   - Alert: When current stock < Reorder Point
   - Suggest order quantity based on supplier MOQ

**UI - Product Card:**
```
┌─────────────────────────────────────┐
│ [QR] CASTROL EDGE 5W-30 SYNTHETIC   │
│                                     │
│ SKU: CE5W30-4L                      │
│ Stock: 24 units ⚠️ LOW              │
│ Cost: ₨2,800 | Sale: ₨3,500        │
│ Margin: 25% | Sold: 156 (30 days)  │
│                                     │
│ [Edit] [Adjust Stock] [View History]│
└─────────────────────────────────────┘
```

---

### FR-08: Point of Sale (POS) - Gold Standard

**Requirements:**

1. **Lightning-Fast Checkout**
   - Product search: Autocomplete (min 2 chars)
   - Barcode scan: <0.5 second response
   - Keyboard shortcuts: F1=Cash, F2=Credit, F3=Hold

2. **Hold Order Queue**
   - Save up to 20 incomplete carts
   - Display: Customer name, items count, timestamp
   - Auto-expire after 24 hours

3. **Credit Sale Workflow**
   ```
   1. Search Customer (by phone/name/ID)
   2. Check Credit Limit vs Cart Total
   3. If Exceeded → Require Manager PIN
   4. If OK → Print Invoice + Update Khata
   ```

4. **Multi-Payment Support**
   - Cash + Card split payments
   - Loyalty Points redemption (future)
   - Voucher/Coupon codes

5. **Receipt Customization**
   - Header: Logo, Station Name, GST #
   - Body: Itemized list, Tax breakdown
   - Footer: Terms, Warranty info, QR for feedback

6. **Void/Return Mechanism**
   - Within 24 hours: Full return with receipt
   - Require: Manager PIN + Reason
   - Update inventory automatically

**UI - POS Screen (Premium White Theme):**
```
╔═══════════════════════════════════════════════════════╗
║  🛒 NEW SALE                    [Hold] [Clear] [⚙️]    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Search Product: [_____________] 🔍                   ║
║                                                       ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ Castrol Edge 5W-30 x2    ₨7,000                 │ ║
║  │ Oil Filter (Mann)         ₨850                  │ ║
║  │ Air Freshener             ₨120                  │ ║
║  └─────────────────────────────────────────────────┘ ║
║                                                       ║
║  Subtotal:     ₨7,970                                ║
║  Tax (17%):    ₨1,355                                ║
║  ━━━━━━━━━━━━━━━━━━                                  ║
║  TOTAL:        ₨9,325                                ║
║                                                       ║
║  [💵 Cash (F1)] [💳 Credit (F2)] [⏸️ Hold (F3)]        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Test Cases:**
- TC-10: Hold 5 orders, verify retrieval by customer name
- TC-11: Credit sale when customer exceeds limit (should block)
- TC-12: Split payment: ₨5,000 cash + ₨4,325 card
- TC-13: Void sale after 30 hours (should require special permission)

---

### FR-09: Purchase Orders (PO) & Stock-In

**Requirements:**

1. **PO Creation Wizard**
   ```
   Step 1: Select Supplier
   Step 2: Add Products (with auto-suggested qty)
   Step 3: Review Totals
   Step 4: Approve & Generate PO #
   ```

2. **Goods Receipt**
   - Match PO # with delivery challan
   - Physical count vs PO quantity
   - Quality check (damaged/expired items)
   - Photo: Supplier invoice

3. **Automatic Ledger Updates**
   - Debit: Inventory Asset
   - Credit: Supplier Payable
   - Update: Product stock levels

4. **Partial Receipts**
   - Allow receiving in multiple batches
   - Track: PO status (Open/Partially Received/Closed)

5. **Supplier Performance Metrics**
   - On-Time Delivery %
   - Quality Issue Rate
   - Average Lead Time

**UI - PO Review Screen:**
```
═══════════════════════════════════════
 PURCHASE ORDER #PO-2026-0042
═══════════════════════════════════════
 
 Supplier: TOTAL Parco Pakistan
 Expected: Feb 2, 2026
 
 ITEMS:
 • Quartz 9000 5W-40 (20L) x50   ₨420,000
 • Quartz 7000 10W-40 (4L) x100  ₨280,000
 • Oil Filters x200                ₨34,000
 
 Subtotal: ₨734,000
 GST (17%): ₨124,780
 ━━━━━━━━━━━━━━━━━━━━━━━
 TOTAL: ₨858,780
 
 [Cancel] [Edit] [✓ Approve & Send]
═══════════════════════════════════════
```

---

## 2.4 FINANCIAL LEDGERS MODULE

### FR-10: Customer Credit (Digital Khata) - Enhanced

**Requirements:**

1. **Customer Onboarding**
   - Fields: Name, CNIC/ID, Phone, Email, Address
   - Credit Limit: Owner-approved
   - Guarantor Details (for limits >₨50,000)

2. **Credit Rules Engine**
   - Hard Block: Sale if Balance + New Sale > Limit
   - Soft Block: Warning if 90% of limit reached
   - Auto-suspend: After 3 missed payments

3. **Payment Recovery Workflow**
   - Multiple modes: Cash, Cheque, Bank Transfer
   - Partial payments allowed
   - Receipt generation with balance confirmation

4. **Aging Analysis**
   ```
   0-30 days:   ₨45,000 (Current)
   31-60 days:  ₨12,000 (Overdue)
   61-90 days:  ₨8,000  (Critical)
   90+ days:    ₨3,000  (Bad Debt)
   ```

5. **Communication Tools**
   - Auto-SMS on credit sale (with balance)
   - Payment reminder 3 days before due date
   - Statement generation (PDF/WhatsApp)

**UI - Customer Ledger:**
```
╔═══════════════════════════════════════════════════╗
║  CUSTOMER: Ahmad Traders (ID: C-1847)             ║
╠═══════════════════════════════════════════════════╣
║  Phone: 0300-1234567 | Limit: ₨100,000           ║
║  Outstanding: ₨68,500 | Available: ₨31,500       ║
║                                                   ║
║  RECENT TRANSACTIONS:                             ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ Jan 25  Invoice #4521    +₨12,500  ₨68,500 │ ║
║  │ Jan 22  Payment (Cash)   -₨20,000  ₨56,000 │ ║
║  │ Jan 18  Invoice #4498    +₨15,200  ₨76,000 │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  [💰 Record Payment] [📄 Generate Statement]      ║
║  [📧 Send Reminder]  [🚫 Suspend Credit]          ║
╚═══════════════════════════════════════════════════╝
```

**Test Cases:**
- TC-14: Credit sale when balance = ₨99,000, limit = ₨100,000, sale = ₨2,000 (should block)
- TC-15: Record partial payment of ₨10,000 against ₨30,000 invoice
- TC-16: Generate statement for date range Jan 1-31, 2026

---

### FR-11: Supplier Payable Management

**Requirements:**

1. **Automated Accrual**
   - On Stock-In: Auto-create payable entry
   - Match: PO # with invoice #

2. **Payment Scheduling**
   - Support: Net 30, Net 60 payment terms
   - Alert: 5 days before due date
   - Track: Early payment discounts (e.g., 2/10 Net 30)

3. **Payment Modes**
   - Cash payout
   - Cheque (track cheque #, date, bank)
   - Online transfer (with UTR #)

4. **Reconciliation**
   - Match supplier statement with system ledger
   - Flag discrepancies (missing invoices, price differences)

5. **Vendor Rating**
   - Quality score (defect rate)
   - Delivery reliability
   - Price competitiveness

---

## 2.5 HR & ACCESS CONTROL

### FR-12: Multi-Level Authentication

**Requirements:**

1. **Role-Based Access Control (RBAC)**
   ```
   OWNER:     All permissions
   MANAGER:   Cannot delete shifts, view-only financials
   CASHIER:   POS + expense entry only
   ATTENDANT: Fuel readings only
   AUDITOR:   Read-only access to reports
   ```

2. **4-Digit PIN System**
   - Complexity: Not sequential (1234 blocked)
   - Not birth year (1990-2010 blocked)
   - Expire: Force reset every 90 days

3. **Security Features**
   - 3 failed attempts: 5-minute lockout
   - 5 failed attempts: Account suspension + owner alert
   - Optional: Fingerprint unlock (future)

4. **Session Management**
   - Auto-logout after 15 minutes of inactivity
   - Force logout: On PIN change
   - Concurrent login: Block (single device per user)

5. **Audit Trail**
   - Log: User, Action, Timestamp, IP Address
   - Tamper-proof: Blockchain hash (future)

**Test Cases:**
- TC-17: Cashier attempts to close shift (should deny)
- TC-18: Manager tries to delete a 60-day-old shift (should deny)
- TC-19: Enter wrong PIN 4 times, verify 5-min lockout

---

### FR-13: Attendance & Shift Scheduling

**Requirements:**

1. **Clock In/Out**
   - Geo-fence verification (GPS check if within 100m of station)
   - Photo capture (verify person is on-site)
   - Late marking: If clock-in >15 min after shift start

2. **Shift Roster**
   - Visual calendar (monthly view)
   - Drag-and-drop scheduling
   - Auto-detect conflicts (double-booking)

3. **Leave Management**
   - Types: Casual, Sick, Annual
   - Approval workflow: Staff requests → Manager approves
   - Balance tracking (e.g., 12 days annual leave/year)

4. **Overtime Calculation**
   - Standard shift: 8 hours
   - OT Rate: 1.5x regular hourly wage
   - Auto-calculate: Total hours - 8 hours = OT hours

**UI - Attendance Dashboard:**
```
═══════════════════════════════════════
 ATTENDANCE - JANUARY 2026
═══════════════════════════════════════
 
 📅 Mon 27  Tue 28  Wed 29  Thu 30  Fri 31
 
 Ali Khan
 ✅ 08:00  ✅ 08:05  ⏰ 08:22  ✅ 08:00  [ ]
 
 Sara Ahmed
 ✅ 08:00  ❌ Absent  ✅ 08:10  ✅ 08:00  [ ]
 
 Usman Ali
 🏥 Sick Leave          ✅ 08:00  [ ]
 
 [+ Mark Attendance] [📊 Monthly Report]
═══════════════════════════════════════
```

---

### FR-14: AI-Powered Performance Analytics

**Requirements:**

1. **KPIs Tracked**
   - Sales Volume (liters sold per shift)
   - Variance % (lower is better)
   - Customer Satisfaction (from feedback forms)
   - Speed (transactions per hour)

2. **Ranking Algorithm**
   ```
   Score = (Sales Volume * 0.4) + 
           ((1 - Variance%) * 0.3) +
           (Customer Rating * 0.2) +
           (Speed * 0.1)
   ```

3. **Leaderboard**
   - Monthly top performers
   - Rewards: Badge icons, bonuses
   - Coaching: Bottom 10% get training alerts

4. **Predictive Insights**
   - Forecast: "Ali likely to exceed ₨500K sales this month"
   - Anomaly: "Sara's variance increased 200% - investigate"

**Test Cases:**
- TC-20: Verify ranking changes when variance drops from 1% to 0.5%
- TC-21: Test scorecard generation for staff with <30 days tenure

---

## 2.6 SETTINGS & CUSTOMIZATION

### FR-15: Advanced Theming Engine

**Requirements:**

1. **Pre-Built Themes**
   - **Glassy White** (Default Light): 
     - Background: #F8FAFC
     - Surface: #FFFFFF with blur effect
     - Shadows: Soft, multi-layer
   - **Deep Obsidian** (Default Dark):
     - Background: #0B1121
     - Surface: #1E293B
     - Accents: Neon blue (#3B82F6)
   - **Forest Green** (Eco Mode):
     - Primary: #059669
     - Nature-inspired gradients
   - **Royal Gold** (Premium):
     - Accents: #D97706
     - Luxury feel for VIP clients

2. **Custom Theme Builder** (Premium Feature)
   - Color picker for 6 main colors
   - Font selection (5 premium fonts)
   - Preview before applying

3. **Accessibility Modes**
   - High Contrast (for visually impaired)
   - Dyslexia-friendly font (OpenDyslexic)
   - Text-to-Speech toggle

4. **Per-User Preferences**
   - Each user can select their theme
   - Persist across devices (cloud sync)

**UI - Theme Selector:**
```
┌─────────────────────────────────────┐
│  CHOOSE YOUR THEME                  │
├─────────────────────────────────────┤
│                                     │
│  ⬜ Glassy White (Current)          │
│  ⬛ Deep Obsidian                   │
│  🟩 Forest Green                    │
│  🟨 Royal Gold                      │
│  🎨 Custom Theme                    │
│                                     │
│  Accessibility:                     │
│  [ ] High Contrast Mode             │
│  [ ] Dyslexia Font                  │
│  [ ] Large Text (1.5x)              │
│                                     │
│  [Cancel] [Apply]                   │
└─────────────────────────────────────┘
```

---

### FR-16: Data Safety & Compliance

**Requirements:**

1. **Automated Backups**
   - Frequency: Every 6 hours (local + cloud)
   - Retention: 90 days rolling
   - Encryption: AES-256

2. **Export Functions**
   - JSON (full database)
   - CSV (per module: sales, inventory, ledgers)
   - PDF (formatted reports)

3. **Import/Migration Tools**
   - CSV import for bulk product upload
   - Legacy system data migration wizard

4. **GDPR/Data Privacy**
   - Customer data anonymization (on request)
   - Right to deletion (with audit log)
   - Data processing agreements (for enterprise)

5. **Disaster Recovery**
   - One-click restore from backup
   - Point-in-time recovery (within 90 days)
   - Test restore quarterly (automated)

**Test Cases:**
- TC-22: Delete backup older than 91 days (should auto-purge)
- TC-23: Export 10,000 transactions to CSV, verify data integrity
- TC-24: Restore database to state from 30 days ago

---

# PART 3: NON-FUNCTIONAL REQUIREMENTS (NFR)

## 3.1 PERFORMANCE BENCHMARKS

### NFR-01: Response Times (99th Percentile)

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Dashboard Load | <1.2s | 1.5s |
| POS Transaction | <0.8s | 1.0s |
| Report Generation (30 days) | <3s | 5s |
| Shift Closing | <2s | 3s |
| Search (1000+ products) | <0.3s | 0.5s |

**Testing Method:** Lighthouse CI, K6 load testing

---

### NFR-02: Scalability

**Concurrent Users:**
- Support: 50 simultaneous users per station
- Database: Handle 1M transactions/month
- Storage: Auto-scale cloud storage (Firebase)

**Growth Planning:**
- Design for 500 stations (current: 1)
- API rate limiting: 1000 req/min per station

---

### NFR-03: Offline Capability

**Requirements:**
1. **Service Worker:** Cache all UI assets
2. **Local Database:** IndexedDB for offline transactions
3. **Sync Queue:** Store operations when offline, sync when online
4. **Conflict Resolution:** Last-write-wins with timestamp check

**Offline Scenarios:**
- Internet outage: Continue POS sales for 24 hours
- Sync: Auto-resume when connection restored
- Data loss: Zero (all data in local cache)

**Test Cases:**
- TC-25: Disconnect WiFi, complete 10 sales, reconnect, verify sync
- TC-26: Create shift offline, come online after 8 hours, verify no data loss

---

### NFR-04: Security Standards

**Compliance Targets:**
- **OWASP Top 10:** Zero critical vulnerabilities
- **PCI DSS Level 1:** For card payment integration (future)
- **SOC 2 Type II:** Annual audit (enterprise tier)

**Security Measures:**
1. **Data Encryption:**
   - At Rest: AES-256
   - In Transit: TLS 1.3
2. **Input Validation:**
   - SQL injection prevention (parameterized queries)
   - XSS protection (Content Security Policy)
3. **Rate Limiting:**
   - Login attempts: 3/minute
   - API calls: 100/minute per user
4. **Penetration Testing:**
   - Quarterly scans (automated)
   - Annual red team exercise

**Test Cases:**
- TC-27: Attempt SQL injection in product search
- TC-28: Flood login endpoint with 100 requests/second

---

## 3.2 RELIABILITY & UPTIME

### NFR-05: Availability

**Target SLA:** 99.9% uptime (8.76 hours downtime/year)

**Strategies:**
- **Redundancy:** Multi-region Firebase deployment
- **Failover:** Auto-switch to backup server within 30 seconds
- **Monitoring:** Real-time alerts (PagerDuty integration)

**Maintenance Windows:**
- Scheduled: Every Sunday 2-4 AM (local time)
- Notification: 7-day advance notice

---

### NFR-06: Data Integrity

**Zero Data Loss Policy:**
- Transactions: ACID-compliant (use Firestore transactions)
- Backups: Immutable (cannot be overwritten)
- Checksums: SHA-256 hash for critical files

**Validation Rules:**
- Negative stock: Impossible (hard constraint)
- Date anomalies: Block future-dated transactions
- Duplicate prevention: Unique constraint on shift IDs

---

## 3.3 USABILITY & ACCESSIBILITY

### NFR-07: Accessibility Compliance

**Standard:** WCAG 2.2 Level AAA

**Requirements:**
1. **Keyboard Navigation:** 100% operable without mouse
2. **Screen Reader:** ARIA labels on all interactive elements
3. **Color Contrast:** Min 7:1 ratio (AAA)
4. **Focus Indicators:** Visible 3px outline
5. **Text Scaling:** Up to 200% without layout break

**Testing:** axe DevTools, manual NVDA testing

---

### NFR-08: Mobile Responsiveness

**Breakpoints:**
```
Mobile:  320px - 767px (1 column)
Tablet:  768px - 1023px (2 columns)
Desktop: 1024px+ (4 columns)
```

**Touch Targets:**
- Minimum size: 48x48px (per iOS HIG)
- Spacing: 8px between buttons

**Performance:**
- Mobile load time: <2 seconds on 3G
- Smooth scrolling: 60 FPS

**Test Devices:**
- iPhone SE (small screen)
- iPad Air (tablet)
- Galaxy S21 (Android)

---

## 3.4 INTERNATIONALIZATION

### NFR-09: Multi-Language Support

**Phase 1 Languages:**
- English (default)
- Urdu (primary local)
- Arabic (regional)

**Phase 2 (Future):**
- Spanish, French, Mandarin

**Implementation:**
- i18n library (react-i18next)
- RTL support for Arabic/Urdu
- Currency localization (₨, $, €)
- Date formats (DD/MM/YYYY vs MM/DD/YYYY)

---

### NFR-10: Time Zone Handling

**Requirements:**
- Store all timestamps in UTC
- Display in station's local timezone
- Support: Daylight Saving Time transitions
- Multi-station: Handle cross-timezone operations

---

# PART 4: UI/UX SPECIFICATIONS

## 4.1 DESIGN SYSTEM

### Typography

**Font Family:** Plus Jakarta Sans (Google Font)

**Scale:**
```
Heading 1: 32px / Bold / Line Height 1.2
Heading 2: 24px / SemiBold / LH 1.3
Heading 3: 20px / SemiBold / LH 1.4
Body Large: 16px / Regular / LH 1.6
Body: 14px / Regular / LH 1.6
Caption: 12px / Medium / LH 1.5
```

**Weights:**
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

---

### Color Palette

**Glassy White Theme (Light Mode):**
```css
--bg-primary: #F8FAFC;
--bg-surface: #FFFFFF;
--bg-elevated: rgba(255, 255, 255, 0.8); /* Glass effect */
--text-primary: #0F172A;
--text-secondary: #64748B;
--border: #E2E8F0;

--accent-blue: #3B82F6;
--accent-emerald: #10B981;
--accent-rose: #F43F5E;
--accent-amber: #F59E0B;
```

**Deep Obsidian Theme (Dark Mode):**
```css
--bg-primary: #0B1121;
--bg-surface: #1E293B;
--bg-elevated: rgba(30, 41, 59, 0.8);
--text-primary: #F1F5F9;
--text-secondary: #94A3B8;
--border: #334155;

--accent-blue: #60A5FA;
--accent-emerald: #34D399;
--accent-rose: #FB7185;
--accent-amber: #FBBF24;
```

---

### Shadows & Depth

**Light Mode:**
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

**Dark Mode:**
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 6px rgba(0,0,0,0.4);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.6);
```

---

### Spacing Scale

```
4px  (0.25rem) - xs
8px  (0.5rem)  - sm
12px (0.75rem) - md
16px (1rem)    - lg
24px (1.5rem)  - xl
32px (2rem)    - 2xl
48px (3rem)    - 3xl
64px (4rem)    - 4xl
```

---

### Border Radius

```
--radius-sm: 4px;  /* Inputs, chips */
--radius-md: 8px;  /* Cards, buttons */
--radius-lg: 12px; /* Modals */
--radius-xl: 16px; /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 4.2 COMPONENT LIBRARY

### Buttons

**Primary Button:**
```jsx
<button className="
  px-6 py-3 
  bg-blue-600 hover:bg-blue-700 
  text-white font-semibold 
  rounded-lg shadow-md 
  transition-all duration-200 
  active:scale-95
">
  Approve Shift
</button>
```

**Variants:**
- Primary: Blue background
- Secondary: Transparent with border
- Danger: Red background
- Ghost: No background, text only

**States:**
- Default
- Hover (scale 1.02)
- Active (scale 0.95)
- Disabled (50% opacity, no pointer)
- Loading (spinner icon)

---

### Input Fields

**Text Input:**
```jsx
<div className="relative">
  <input 
    type="text"
    placeholder="Search products..."
    className="
      w-full px-4 py-3 
      bg-white dark:bg-slate-800 
      border-2 border-gray-200 dark:border-gray-700 
      rounded-lg 
      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
      transition-all duration-200
    "
  />
  <SearchIcon className="absolute right-3 top-3 text-gray-400" />
</div>
```

**Validation States:**
- Valid: Green border + checkmark icon
- Invalid: Red border + error message below
- Warning: Yellow border + warning icon

---

### Cards

**Surface Card (Glassy White):**
```jsx
<div className="
  bg-white/80 backdrop-blur-md 
  border border-gray-200/50 
  rounded-xl shadow-lg 
  p-6 
  hover:shadow-xl 
  transition-all duration-300
">
  {/* Content */}
</div>
```

**Variants:**
- Flat: No shadow
- Elevated: Large shadow
- Interactive: Hover effect + cursor pointer

---

### Tables

**Responsive Table:**
```
Desktop: Standard table layout
Tablet: Collapse to 2-column cards
Mobile: Stack vertically with labels
```

**Features:**
- Sortable columns (click header)
- Row selection (checkbox)
- Infinite scroll (load more on scroll)
- Export to CSV button

---

### Modals

**Full-Screen Modal (Mobile):**
```jsx
<div className="
  fixed inset-0 z-50 
  bg-black/50 backdrop-blur-sm 
  flex items-center justify-center 
  p-4 sm:p-8
">
  <div className="
    bg-white dark:bg-slate-900 
    rounded-2xl 
    max-w-2xl w-full 
    max-h-[90vh] 
    overflow-auto 
    shadow-2xl
  ">
    {/* Modal content */}
  </div>
</div>
```

**Animation:**
- Enter: Fade in + scale from 0.9 to 1
- Exit: Fade out + scale to 0.95
- Duration: 200ms

---

## 4.3 LAYOUT ARCHITECTURE

### Sidebar Navigation

**Desktop (>1024px):**
```
Width: 280px (expanded) / 80px (collapsed)
Position: Fixed left
Scroll: Independent from main content
```

**Mobile (<768px):**
```
Position: Overlay (slide from left)
Trigger: Hamburger menu
Dismiss: Tap outside or close button
```

**Menu Structure:**
```
📊 Dashboard
⛽ Fuel Management
  └ Tanks
  └ Shifts
  └ Rate History
🏪 Lube Shop
  └ Products
  └ POS
  └ Purchase Orders
💰 Financials
  └ Customer Credit
  └ Supplier Payable
  └ Expenses
👥 Staff
  └ Attendance
  └ Performance
⚙️ Settings
```

---

### Dashboard Grid

**4-Column Layout (Desktop):**
```
Row 1: [KPI Card] [KPI Card] [KPI Card] [KPI Card]
Row 2: [Fuel Tanks (span 2)] [Recent Shifts (span 2)]
Row 3: [Top Products (span 1)] [Low Stock (span 1)] [Performance Chart (span 2)]
```

**Responsive:**
- Tablet: 2 columns
- Mobile: 1 column (stacked)

---

## 4.4 ANIMATIONS & MICRO-INTERACTIONS

### Loading States

**Skeleton Screens:**
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
</div>
```

**Spinner (Button Loading):**
```jsx
<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" />
  <path className="opacity-75" d="M4 12a8 8 0 018-8V0..." />
</svg>
```

---

### Success/Error Feedback

**Toast Notifications:**
```
Position: Top-right
Duration: 3 seconds
Animation: Slide in from right + fade
Types: Success (green), Error (red), Info (blue), Warning (yellow)
```

**Confetti (Major Achievements):**
```jsx
// Trigger on: Shift closing with 0% variance
<Confetti 
  numberOfPieces={200} 
  recycle={false} 
  colors={['#3B82F6', '#10B981', '#F59E0B']}
/>
```

---

### Data Transitions

**Number Counter:**
```jsx
// Animate from 0 to final value
<CountUp 
  start={0} 
  end={245680} 
  duration={1.5} 
  separator="," 
  prefix="₨" 
/>
```

**Chart Animations:**
```
Bars: Grow from bottom (duration: 800ms)
Lines: Draw from left to right (duration: 1200ms)
Pie: Rotate segments (staggered)
```

---

# PART 5: DATA ARCHITECTURE

## 5.1 DATABASE SCHEMA (FIREBASE FIRESTORE)

### Collections Structure

#### 1. Stations
```json
{
  "stationId": "STN-001",
  "name": "Motorway Oil - Main Branch",
  "address": {...},
  "settings": {
    "currency": "PKR",
    "timezone": "Asia/Karachi",
    "theme": "glassy-white",
    "language": "en"
  },
  "createdAt": "2026-01-01T00:00:00Z"
}
```

#### 2. Tanks
```json
{
  "tankId": "TK-001",
  "stationId": "STN-001",
  "fuelType": "PETROL_92",
  "capacity": 27000,
  "currentLevel": 18450,
  "costPrice": 265.50,
  "salePrice": 280.00,
  "lastUpdated": "2026-01-29T14:30:00Z",
  "nozzles": ["NOZ-001", "NOZ-002", "NOZ-003"]
}
```

#### 3. Shifts
```json
{
  "shiftId": "SH-2026-0145",
  "stationId": "STN-001",
  "date": "2026-01-29",
  "staffId": "USR-012",
  "startTime": "2026-01-29T08:00:00Z",
  "endTime": "2026-01-29T20:00:00Z",
  "nozzleSales": [
    {
      "nozzleId": "NOZ-001",
      "openingReading": 245670.5,
      "closingReading": 246890.2,
      "testVolume": 10.0,
      "netSales": 1209.7,
      "revenue": 338716,
      "photoProof": "gs://bucket/shift-145-noz1.jpg"
    }
  ],
  "totalRevenue": 891240,
  "actualCash": 890500,
  "expenses": 1200,
  "variance": -540,
  "variancePercentage": -0.06,
  "approvedBy": "USR-001",
  "status": "CLOSED",
  "createdAt": "2026-01-29T20:15:00Z"
}
```

#### 4. Products
```json
{
  "productId": "PRD-152",
  "sku": "CE5W30-4L",
  "name": "Castrol Edge 5W-30 Synthetic",
  "category": "ENGINE_OIL",
  "brand": "Castrol",
  "unit": "LITER",
  "packSize": 4,
  "costPrice": 2800,
  "salePrice": 3500,
  "taxRate": 0.17,
  "barcode": "8901000123456",
  "currentStock": 24,
  "reorderPoint": 30,
  "reorderQty": 50,
  "lastPurchaseDate": "2026-01-15",
  "imageUrl": "https://cdn.example.com/products/ce5w30.jpg"
}
```

#### 5. Sales (POS Transactions)
```json
{
  "saleId": "SAL-2026-4521",
  "stationId": "STN-001",
  "cashierId": "USR-008",
  "timestamp": "2026-01-29T15:45:00Z",
  "items": [
    {
      "productId": "PRD-152",
      "quantity": 2,
      "unitPrice": 3500,
      "discount": 0,
      "subtotal": 7000
    }
  ],
  "subtotal": 7970,
  "taxAmount": 1355,
  "totalAmount": 9325,
  "paymentMethod": "CASH",
  "customerId": "CUST-047", // Null for walk-in
  "status": "COMPLETED",
  "voidedBy": null,
  "voidReason": null
}
```

#### 6. Customers (Khata)
```json
{
  "customerId": "CUST-047",
  "name": "Ahmad Traders",
  "phone": "03001234567",
  "email": "ahmad@example.com",
  "cnic": "12345-6789012-3",
  "creditLimit": 100000,
  "currentBalance": 68500,
  "paymentTerms": "NET_30",
  "status": "ACTIVE",
  "createdAt": "2025-06-15T00:00:00Z",
  "lastTransaction": "2026-01-25"
}
```

#### 7. CustomerTransactions (Ledger)
```json
{
  "transactionId": "CT-8521",
  "customerId": "CUST-047",
  "type": "SALE", // SALE | PAYMENT | ADJUSTMENT
  "amount": 12500,
  "balance": 68500,
  "referenceId": "SAL-2026-4521",
  "notes": "Invoice #4521",
  "createdBy": "USR-008",
  "timestamp": "2026-01-25T11:30:00Z"
}
```

#### 8. Suppliers
```json
{
  "supplierId": "SUP-012",
  "name": "TOTAL Parco Pakistan",
  "contactPerson": "Bilal Ahmed",
  "phone": "042-111-123-123",
  "email": "orders@totalparco.com",
  "paymentTerms": "NET_60",
  "currentPayable": 858780,
  "rating": 4.5,
  "performance": {
    "onTimeDelivery": 0.92,
    "qualityScore": 0.95,
    "avgLeadTime": 7
  }
}
```

#### 9. PurchaseOrders
```json
{
  "poId": "PO-2026-0042",
  "supplierId": "SUP-012",
  "stationId": "STN-001",
  "orderDate": "2026-01-28",
  "expectedDate": "2026-02-02",
  "items": [
    {
      "productId": "PRD-089",
      "quantity": 50,
      "unitCost": 8400,
      "subtotal": 420000
    }
  ],
  "subtotal": 734000,
  "taxAmount": 124780,
  "totalAmount": 858780,
  "status": "APPROVED", // DRAFT | APPROVED | PARTIALLY_RECEIVED | CLOSED
  "receivedItems": [],
  "createdBy": "USR-002"
}
```

#### 10. Users (Staff)
```json
{
  "userId": "USR-012",
  "name": "Ali Khan",
  "phone": "03121234567",
  "role": "CASHIER", // OWNER | MANAGER | CASHIER | ATTENDANT | AUDITOR
  "pin": "hashed_pin_here",
  "pinExpiry": "2026-04-29",
  "theme": "deep-obsidian",
  "language": "ur",
  "status": "ACTIVE",
  "createdAt": "2025-08-10",
  "lastLogin": "2026-01-29T08:00:00Z",
  "performance": {
    "totalSales": 4250000,
    "avgVariance": 0.004,
    "rank": 2
  }
}
```

#### 11. Attendance
```json
{
  "attendanceId": "ATT-5421",
  "userId": "USR-012",
  "stationId": "STN-001",
  "date": "2026-01-29",
  "clockIn": "2026-01-29T08:05:00Z",
  "clockOut": "2026-01-29T20:10:00Z",
  "gpsLocation": {
    "lat": 31.5204,
    "lng": 74.3587
  },
  "photoUrl": "gs://bucket/attendance/usr12-jan29.jpg",
  "status": "PRESENT", // PRESENT | ABSENT | LATE | LEAVE
  "totalHours": 12.08,
  "overtimeHours": 4.08
}
```

---

## 5.2 SECURITY RULES (FIRESTORE)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Stations - Owner only
    match /stations/{stationId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('OWNER');
    }
    
    // Shifts - Manager & Owner
    match /shifts/{shiftId} {
      allow read: if isAuthenticated();
      allow create: if hasRole('MANAGER') || hasRole('OWNER');
      allow update: if hasRole('MANAGER') || hasRole('OWNER');
      allow delete: if hasRole('OWNER'); // Owner only
    }
    
    // Products - All authenticated
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('MANAGER') || hasRole('OWNER');
    }
    
    // Sales - Cashier+
    match /sales/{saleId} {
      allow read: if isAuthenticated();
      allow create: if hasRole('CASHIER') || hasRole('MANAGER') || hasRole('OWNER');
      allow update: if hasRole('MANAGER') || hasRole('OWNER');
      allow delete: if hasRole('OWNER');
    }
    
    // Auditor read-only access
    match /{document=**} {
      allow read: if hasRole('AUDITOR');
      allow write: if false; // Auditors cannot write
    }
  }
}
```

---

## 5.3 INDEXING STRATEGY

**Composite Indexes (for complex queries):**

```json
// Get shifts by date range for specific staff
{
  "collectionGroup": "shifts",
  "queryScope": "COLLECTION",
  "fields": [
    {"fieldPath": "stationId", "order": "ASCENDING"},
    {"fieldPath": "staffId", "order": "ASCENDING"},
    {"fieldPath": "date", "order": "DESCENDING"}
  ]
}

// Find low stock products by category
{
  "collectionGroup": "products",
  "fields": [
    {"fieldPath": "category", "order": "ASCENDING"},
    {"fieldPath": "currentStock", "order": "ASCENDING"}
  ]
}

// Customer balance aging report
{
  "collectionGroup": "customerTransactions",
  "fields": [
    {"fieldPath": "customerId", "order": "ASCENDING"},
    {"fieldPath": "timestamp", "order": "DESCENDING"}
  ]
}
```

---

# CONCLUSION OF PART 1

This PRD now covers:
✅ Executive summary with market positioning  
✅ 5 detailed user personas  
✅ 20+ functional requirements with UI mockups  
✅ 10 non-functional requirements (performance, security, accessibility)  
✅ Complete design system (colors, typography, components)  
✅ Database schema with 11 collections  
✅ Security rules and indexing strategy  

**NEXT STEPS (Part 2 - Implementation Plan):**
1. Technology stack selection
2. Development phases (sprints)
3. Testing strategy (unit, integration, E2E)
4. Deployment architecture
5. Monitoring & analytics setup
6. Marketing & launch plan
