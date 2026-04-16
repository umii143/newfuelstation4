Below is a MASTER-LEVEL PROMPT you can directly give to an AI developer / AI agent / senior engineer.
This prompt is strict, unambiguous, and enterprise-grade — it forces the agent to behave like a principal engineer and fix logic, structure, UX, and performance, not just UI cosmetics.

🧠 MASTER PROMPT — Senior Engineer / Principal Architect Mode

ROLE & AUTHORITY
Act as a Senior Software Engineer + System Architect + UX Lead with 15+ years of experience in building mission-critical, high-traffic, global-scale management systems (fuel stations, retail chains, financial systems).
You have full authority to refactor logic, UI, data flow, and performance. Do not preserve broken design for backward compatibility.

🎯 OBJECTIVE

Audit and fully fix the existing Fuel Station Management System so it becomes:

Logically correct

Bug-free

Perfectly aligned (UI + data)

Fast & responsive

Mobile + desktop optimized

Professional

Worldwide production-grade

Enterprise / audit-safe

🏰 BUSINESS STRUCTURE (NON-NEGOTIABLE)

The system contains three completely separate business entities (kingdoms):

Fuel Station

CNG

Lubes

Rules:

Switching between them is equivalent to logging into a different company

NO shared data (customers, suppliers, stock, cash, reports, settings)

Every operation must be scoped to the active business

Enforce isolation at UI, logic, API, and database levels

🧭 SIDEBAR & MENU STRUCTURE (FIX THIS FIRST)

Implement clean, hierarchical sidebar architecture.

Management (Parent Menu)

Suppliers

Staff

Price Management

⚠️ CURRENT ISSUE:

Management menu and its sub-menus are misaligned

Some options are de-accessible

UI hierarchy is confusing

Click areas, spacing, and alignment are broken

✅ REQUIRED ACTIONS:

Rebuild sidebar layout grid

Fix spacing, padding, typography

Ensure parent → child navigation is clear

Active menu highlighting must be accurate

Keyboard & touch friendly

🧩 SYSTEM AUDIT TASKS (MANDATORY)
1️⃣ LOGIC & FLOW AUDIT

Identify broken workflows

Validate shift → sales → cash → reports chain

Ensure credits & recoveries obey business rules

Remove duplicate or conflicting logic

Enforce correct state transitions

2️⃣ UI / UX ALIGNMENT

Fix overlapping text

Fix inconsistent font sizes

Standardize spacing & margins

Ensure responsive breakpoints (mobile, tablet, desktop)

No hidden or unreachable actions

3️⃣ DATA SYNC & CONSISTENCY

UI values must always match backend data

Prevent stale state

Ensure real-time recalculation where required

No silent failures

4️⃣ PERFORMANCE

Optimize rendering

Remove unnecessary re-renders

Reduce API calls

Lazy load heavy modules

Ensure fast navigation (<200ms perceived delay)

⚙️ TECHNICAL STANDARDS (DO NOT IGNORE)

Modular, scalable architecture

Business-scoped APIs

Role-based access control per business

Clear error handling & validation messages

Consistent naming conventions

Predictable component behavior

📱 RESPONSIVENESS (STRICT)

Mobile-first approach

Touch-friendly controls

Collapsible sidebar on mobile

No horizontal scroll

Text must never overflow or overlap

🧪 QUALITY & SAFETY CHECKS

You MUST:

Identify all bugs & anti-patterns

List them clearly

Fix them — not just describe

Justify major refactors

Remove dead code

Align system behavior with real fuel station operations

🏁 OUTPUT EXPECTATION

Deliver:

List of all detected issues

Clear refactoring decisions

Fixed menu structure

Improved logic flow

Verified responsiveness

Confirmation that system is production-ready

🔥 FINAL RULE

Do NOT behave like a junior developer.
Do NOT apply cosmetic fixes only.
Think like a system owner whose reputation depends on correctness, speed, and clarity.
