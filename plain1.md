### ROLE: Senior Full-Stack Architect & UI/UX Specialist
**Project Name:** Motorway Oil – Enterprise Station Management System (v4.0)

### 1. PROJECT OVERVIEW
You are building "Motorway Oil," a high-fidelity, offline-first Single Page Application (SPA) designed to manage multi-service fuel stations. The system consolidates three distinct business verticals into one unified dashboard:
1.  **Liquid Fuel:** Petrol/Diesel tank monitoring and nozzle sales.
2.  **CNG Station:** Gas pressure monitoring and kg-based sales.
3.  **Lube Shop:** Point-of-Sale (POS) for products and inventory.

The app must run in a browser but feel like a native desktop application. It relies on a "Hyper-Premium Glassmorphism" aesthetic with complex animations.

### 2. TECH STACK & ARCHITECTURE
*   **Framework:** React 19 (Functional Components, Hooks).
*   **Language:** TypeScript (Strict typing for all data models).
*   **Styling:** Tailwind CSS (Heavy use of gradients, backdrop-blur, and white-alpha borders).
*   **Icons:** Lucide-React.
*   **Backend/Persistence:** Firebase Firestore (Web SDK v9+).
    *   *Crucial:* Must use `enableIndexedDbPersistence` for offline-first capability.
    *   *Sync Strategy:* Optimistic UI updates (update local state immediately, sync to cloud in background).

### 3. DESIGN SYSTEM (The "Vibe")
*   **Theme:** Dual-mode support (Deep Obsidian Dark Mode & Glassy White Light Mode) using CSS variables.
*   **Visual Language:**
    *   **Cards:** 3D-effect cards with `backdrop-blur-xl`, thin borders (`border-white/5`), and subtle gradients.
    *   **Inputs:** Large, touch-friendly inputs with floating labels or clear headers.
    *   **Dashboard:** Bento-grid layout (grid-cols-12) for dense data visualization.
    *   **Animations:** `animate-in`, `fade-in`, `slide-in` for all page transitions and modal openings.

### 4. CORE MODULES & LOGIC

#### A. Authentication
*   **PIN System:** 4-digit PIN login (no email/password).
*   **Session:** Track active sessions (Device/IP). Auto-lock after inactivity.
*   **Recovery:** Security question flow to reset PIN.

#### B. Fuel Station (Petrol/Diesel)
*   **Tank Visuals:** Animated liquid fill levels. Gradients change color based on fuel type (Orange=Petrol, Blue=Diesel).
*   **Shift Manager (Wizard Flow):**
    1.  **Select Staff & Shift Type.**
    2.  **Input Meter Readings:** Calculate liters sold based on `(Closing - Opening)`. Handle meter rollovers.
    3.  **Financials:** Auto-calculate expected cash. Input expenses, credit sales, recoveries.
    4.  **Closing:** Input "Actual Cash." System calculates Variance (Shortage/Surplus).
*   **Configuration:** Link Nozzles to Tanks. Set Prices globally.

#### C. CNG Station
*   **Visuals:** Custom SVG Gauge for compressor pressure (0-3200 PSI).
*   **Logic:** Sales in KG. Separate ledger for gas suppliers and customers.
*   **Refill:** Log trailer refills which update the stock/pressure.

#### D. Lube Shop (POS)
*   **POS Interface:** Grid of products. Cart management. Hold/Recall orders.
*   **Inventory:** Purchase Orders (Stock In) with supplier ledger integration.
*   **Checkout:** Cash or Credit (Customer Ledger) payment modes.

#### E. Financial Ledgers (The "Khata")
*   **Customer Ledger:** Debit (Sale) / Credit (Recovery). maintain running balance. Limit checks.
*   **Supplier Ledger:** Credit (Stock In) / Debit (Payment Out).
*   **Global Expenses:** Categorized expense tracking.

#### F. Reporting Hub
*   **Interactive Explorer:** "Shift History Explorer" to drill down into past shifts.
*   **CSV Export:** Universal export for all data tables.
*   **KPIs:** Profit/Loss estimation, Expense breakdown, Sales velocity.

### 5. DATA STRUCTURE (TypeScript Interfaces)
*   **DB:** A single monolithic state object (`DB`) containing arrays for `fuelShifts`, `customers`, `inventory`, `suppliers`, etc.
*   **Shift:** Complex object containing nested `nozzleSales`, `expenses`, `credits`, `recoveries`.
*   **User:** Contains `theme` preference ('dark' | 'light').

### 6. CODING STRICT RULES
1.  **No Mock Data:** All data must persist to Firebase/LocalStorage.
2.  **Safety:** Always check for `undefined` before accessing array indices. Use Optional Chaining `?.`.
3.  **Performance:** Use `useMemo` for heavy calculations (Shift totals, Inventory valuation).
4.  **UX:** Never leave the user guessing. Show Success Toasts (`notify()`) for every action.
5.  **Aesthetics:** Do not use default browser alerts or confirms. Use custom Modals.

### 7. EXECUTION INSTRUCTION
When asked to modify the app:
1.  Analyze the `DB` interface first.
2.  Ensure backward compatibility with existing data.
3.  Implement the feature using the existing "Glassmorphism" UI components (`KPICard`, `Input`, `DataTable`).
4.  Update the `App.tsx` or `FuelStation.tsx` logic to handle the state change.