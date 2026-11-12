# **Product Requirements Document (PRD)**

## **Project Name: Shift-Based Inventory & Sales Reconciliation Platform**

**Target Platform:** Progressive Web App (Offline-First Mobile & Desktop) **Document Version:** 1.0.0 **Status:** Ready for Engineering Review

## **1\. Executive Summary & Problem Statement**

### **1.1 Executive Summary**

TallyBakery is a multi-tenant, offline-first Software-as-a-Service (SaaS) platform engineered for shift-based manufacturing and retail operations (using commercial bakeries as the anchor reference). The software enforces zero-trust departmental accountability by cross-reconciling raw materials consumed, finished units produced, customer orders billed, units disbursed, and cash drawer balances across recurring shift handovers.

### **1.2 Problem Statement**

Small-to-medium manufacturing and retail businesses (SMEs) face high rates of revenue leakage, internal theft, and unrecorded inventory shrinkage. Key operational pain points include:

> * **The "Shift Blame" Loop:** When closing inventory is short, outgoing and incoming shift workers dispute when the shortage occurred.  
> * **Dispatch Mismatches:** Bread or packaged products leave the stock room before or without payment verification.  
> * **Owner Blindness:** Business owners cannot monitor operational integrity without physically sitting at the facility.  
> * **Network Vulnerability:** Typical cloud point-of-sale (POS) systems break down during frequent local internet blackouts.

## **2\. Product Goals & Success Metrics**

### **2.1 Core Goals**

> * **Enforce Departmental Parity:** Formally interlock Production, Dispatch, Reception, and Procurement logs at each shift change.  
> * **Offline Floor Continuity:** Guarantee 100% operational uptime for order logging, baking entrieshi, and handovers on local devices regardless of internet availability.  
> * **Noise-Free Executive Monitoring:** Restrict active push alerts strictly to discrepancies and critical exceptions while aggregating holistic analytics for executive review on demand.

### **2.2 Success Metrics (KPIs)**

> * **Shrinkage Reduction:** \\ge 85\\% drop in unexplained finished stock variances within 30 days of deployment.  
> * **Shift Handover Duration:** Dual-verification shift seal completed in under 4 minutes.  
> * **Sync Reliability:** 0\\% data loss during offline-to-online state synchronizations.  
> * **Discrepancy Resolution Time:** Alert delivery to Owner/Manager within \\le 30 seconds of an unbalanced shift closure.

## **3\. User Personas & Role-Based Access Control (RBAC)**

The system enforces strict boundary isolation. A user logged into one department cannot view, manipulate, or sign off on another department's records unless explicitly granted cross-departmental administrative rights.  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                              Super Admin                               │`  
`│                           (Business Owner)                             │`  
`└───────────────────────────────────┬────────────────────────────────────┘`  
                                    `│`  
                                    `▼`  
`┌────────────────────────────────────────────────────────────────────────┐`  
`│                             Shift Manager                              │`  
`│             (Procurement, Staff Shifts, Anomaly Resolution)            │`  
`└───────┬───────────────────────────┼────────────────────────────┬───────┘`  
        `│                           │                            │`  
        `▼                           ▼                            ▼`  
`┌──────────────┐            ┌──────────────┐             ┌───────────────┐`  
`│  Reception   │            │  Production  │             │ Packaging &   │`  
`│   (Cashier)  │            │ (Bakehouse)  │             │ Dispatch  │`  
`└──────────────┘            └──────────────┘             └───────────────┘`

| Role | Default Access Permissions | Restrictions |
| :---- | :---- | :---- |
| **Super Admin (Owner)** | Organization-wide visibility, multi-branch analytics, audit logs, subscription billing, threshold configs. | None. |
| **Shift / Branch Manager** | Procurement logging, expense approval, employee onboarding/scheduling, discrepancy resolution, handover co-sign. | Cannot alter finalized audit trails or delete historic shifts. |
| **Receptionist (Cashier)** | Customer order entry, multi-method payment receipt, credit/debt ledger, manual order push to dispatch. | Blocked from production sheets, raw material balances, and dispatch fulfillment screens. |
| **Production Supervisor** | Raw material draw-downs (e.g., bags of flour, sugar), finished batch logging (units/sizes), scrap/waste logging. | Blocked from sales figures, cash totals, customer data, and dispatch inventories. |
| **Packaging & Dispatch Officer** | Production batch acceptance, live queue of pushed customer orders, order fulfillment, physical closing counts. | Blocked from monetary values, cash drawer tallies, and raw material procurement logs. |

### Dynamic tenant role and department catalog

TallyBakery does not assume a single static role or department taxonomy. Each tenant starts with a seeded default catalog in the database, and the business owner or delegated administrator can edit that catalog without any application deployment or code change.

The seeded baseline for a new business includes the core operating departments and role definitions needed by a bakery workflow:

- Departments: Reception, Production, Dispatch, and Store
- Roles: Owner, Manager, Receptionist, Production Supervisor, and Dispatch Officer

These records are tenant-scoped configuration, not hard-coded app classes. The business can rename departments, deactivate unused ones, add custom departments, clone or update a role's permission bundle, and change which branches or departments a staff member can access. The system still validates edits against the approved permission set and tenant boundaries, but the catalog itself is dynamic and editable by the tenant.

The default seed provides a working starter configuration for onboarding, while preserving room for business-specific configurations across bakery locations and future operational models.

## **4\. Functional Specifications**

### **4.1 Module 1: Departmental Operational Workflows**

#### **A. Procurement & Management**

> * **Material Acquisition:** The Manager records raw material arrivals (Vendor, Item, Quantity, Unit Cost, Invoice/Receipt Reference). This automatically increments the central raw material balance.  
> * **Ad-Hoc Cash Outflow:** Petty cash dispatchs (e.g., fuel for generator, minor repairs) must be logged with an attached reason and category.

#### **B. Production (Bakehouse)**

> * **Batch Logging:** The Production Lead logs each production run:  
  * Materials consumed: e.g., N bags of flour, M kg of sugar, X units of yeast.  
  * Finished goods output: Quantity and SKU/size (e.g., 250 units of 500g family loaf, 100 units of 1kg sandwich bread).  
> * **Yield Decoupling:** Yield variations (e.g., flour producing 48 loaves instead of 50\) are logged transparently for analytics but do not halt the operational flow.  
> * **Batch Transfer:** Submitting a batch creates a pending **Incoming Stock Transfer** queued for Dispatch acceptance.

#### **C. Packaging & Dispatch**

> * **Batch Acceptance:** The Dispatch Officer inspects the transfer from Production, confirms the actual physical count received, and accepts it into available stock. Any count difference at this step is recorded as an intake discrepancy.  
> * **Live Fulfillment Board:** Displays orders manually dispatched by Reception.  
> * **Order Handover:** Staff packages the requested units and taps **\[Mark Fulfilled\]**, immediately decrementing physical inventory.

#### **D. Reception (Cashier & Sales)**

> * **Order Creation:** Cashier selects products, enters quantities, and calculates the total.  
> * **Flexible Tender Options:** Supports split payments across:  
  * **Cash** (increments calculated cash drawer balance).  
  * **Direct Bank Transfer** (requires bank reference / transaction note).  
  * **Customer Debt / Credit** (requires customer identity and contact; tracks receivables).  
> * **Manual Dispatch Protocol:** Orders remain in a PAID\_PENDING\_DISPATCH state until Reception explicitly clicks **\[Push to Dispatch\]**. Orders are not visible on the dispatch fulfillment screen until this action is taken.

### **4.2 Module 2: The Shift Handover & Reconciliation Engine**

The system enforces an interlocking, dual-signoff shift rollover. Morning shift leads cannot simply leave; the incoming evening shift lead must physically verify and co-sign the transition.  
       `[Outgoing Shift Lead]                       [Incoming Shift Lead]`  
                 `│                                           │`  
  `1. Counts physical cash drawer                             │`  
  `2. Counts physical shelf stock                             │`  
  `3. Submits "Draft Handover"                                │`  
                 `│                                           │`  
                 `└───────────────────► 4. Reviews physical counts on-device`  
                                       `5. Conducts independent physical audit`  
                                       `6. Taps [Accept] or [Flag Variance]`  
                                                             `│`  
                                                             `▼`  
                                                    `[Shift Record Sealed]`  
                                                             `│`  
                                                `Discrepancy $\Delta \ne 0$?`  
                                                `├── YES ──► Push Alert to Owner`  
                                                `└── NO  ──► Silent Log`

#### **Mathematical Reconciliation Formulas**

> 1. **Dispatch Stock Reconciliation:** \\text{Expected Stock} \= \\text{Opening Stock} \+ \\sum \\text{Accepted Production} \- \\sum \\text{Fulfilled Orders} \\Delta\_{\\text{Stock}} \= \\text{Physical Count} \- \\text{Expected Stock}  
> 2. **Reception Cash Drawer Reconciliation:** \\text{Expected Cash} \= \\text{Opening Drawer Float} \+ \\sum \\text{Cash Tendered} \- \\sum \\text{Approved Petty Cash} \\Delta\_{\\text{Cash}} \= \\text{Counted Cash} \- \\text{Expected Cash}

#### **Handover Resolution Rules**

> * **Zero Discrepancy (\\Delta \= 0):** Shift status marked BALANCED. Closed seamlessly.  
> * **Non-Zero Discrepancy (\\Delta \\ne 0):**  
  * The shift **is allowed to close** to prevent operational gridlock.  
  * Outgoing lead must input an mandatory explanation comment.  
  * Incoming lead co-signs the acknowledged starting deficiency.  
  * Shift status marked UNBALANCED.  
  * **Incident Trigger:** Fires an immediate priority notification to the Business Owner and General Manager.

### **4.3 Module 3: Alert & Incident Management**

To eliminate notification fatigue, the platform maintains complete silence for all routine operations (sales, payments, baking runs, or smooth handovers). The notification engine triggers **only** on anomalies.  
`[System Event] ──► [Audit Evaluator] ──► Is Anomaly?`  
                                            `│`  
                                            `├── NO  ──► Silent DB Commit`  
                                            `│`  
                                            `└── YES ──► Write Incident Log`  
                                                            `│`  
                                                            `▼`  
                                                `Dispatch Urgent Alert`  
                                                `(Web Push / SMS / WhatsApp)`  
                                                `To: Business Owner & Manager`

#### **Anomaly Matrix**

| Incident Type | Trigger Condition | Severity | Notification Channel |
| :---- | :---- | :---- | :---- |
| **Stock Shrinkage** | \\Delta\_{\\text{Stock}} \< 0 at Shift Seal | Critical | Web Push \+ SMS/WhatsApp |
| **Unaccounted Stock Surplus** | \\Delta\_{\\text{Stock}} \> 0 at Shift Seal | High | Web Push |
| **Cash Drawer Deficit** | \\Delta\_{\\text{Cash}} \< 0 at Shift Seal | Critical | Web Push \+ SMS/WhatsApp |
| **Production Transfer Dispute** | Dispatch accepts count \< Production submitted count | High | In-App Alert to Manager |
| **Debt Ceiling Breach** | Single customer unpaid balance exceeds preset limit | Medium | Web Push to Manager **WhatsApp Executive Summary** Automated daily AI shift summary generated and dispatched to Director Low WhatsApp  |

### **4.4 Module 4: Owner Analytics & AI Insights Engine**

The Business Owner has an executive portal that converts raw shift ledgers into operational intelligence.

#### **Executive Dashboards**

> * **Throughput & Production Velocity:**  
  * Ratio of raw materials consumed to finished output across arbitrary date ranges.  
  * Product-level sales velocity (e.g., peak demand hours for 500g vs. 1kg loaves).  
> * **Cash Flow & Revenue Integrity:**  
  * Realized Liquid Inflow (Cash \+ Verified Transfers) vs. Unrealized Receivables (Customer Debts).  
  * Debt Aging Table (0–7 days, 8–14 days, 15–30 days, 30+ days).  
  * Procurement vs. Operating Petty Cash expenditure tracking.  
> * **Staff Attendance & Shift Routing:**  
  * Staff check-in and check-out time tracking per shift.  
  * Routing and shift allocation matrix across departments.  
> * **Shift Variance Heatmap:**  
  * Discrepancy rates correlated with specific shift times (Morning vs. Evening) and individual staff IDs.

#### **AI Executive Insights Engine**

An automated analysis engine evaluates shift data, production logs, and sales records to surface actionable business summaries:

> * **Yield Efficiency:** *"Flour batch yield dropped by 8.4% during Evening shifts over the last 14 days compared to Morning shifts."*  
> * **Predictive Stocking:** *"500g loaves stock out before 3:30 PM on 4 out of 5 Fridays. Recommend shifting 15% of morning 1kg production capacity into 500g loaves."*  
> * **Credit Risk Profiling:** *"Customer Debt represents 24% of gross revenue this week, up from 11% last week. Two primary accounts account for 78% of outstanding credit."*

## **5\. Non-Functional Requirements & Architecture**

### **5.1 Offline-First Architecture (PWA)**

> * **Local Persistence:** All operational screens must run against client-side **IndexedDB**. Users can perform orders, dispatch goods, and record batches with zero network connectivity.  
> * **Event-Driven Outbox:** Mutating actions create serialized change events placed in an append-only Outbox table locally.  
> * **Sync & Conflict Resolution:**  
  * When connectivity is detected, events stream to the backend using an idempotency key (client\_event\_id).  
  * In the event of conflicting counts, the server applies an event-sourcing reconciliation strategy where deterministic shift handovers supersede floating balances.

### **5.2 Security & Immutable Auditability**

> * **Immutable Logs:** No table containing financial records, shift summaries, or production batches may be altered or deleted (UPDATE and DELETE queries disabled at DB role level for transactional tables). Corrections require offsetting compensatory entries.  
> * **Actor Attribution:** Every database record captures tenant\_id, user\_id, department\_id, device\_fingerprint, and client\_timestamp.  
> * **RBAC Enforcement:** Enforced at both the edge API gateway and database Row-Level Security (RLS).

## **6\. Relational Data Model (Core Entities)**

`┌──────────────┐       ┌─────────────────┐       ┌───────────────────┐`  
`│   Tenants    │◄──────┤   Departments   │◄──────┤       Users       │`  
`└──────┬───────┘       └────────┬────────┘       └─────────┬─────────┘`  
       `│                        │                          │`  
       `│                        ▼                          │`  
       `│               ┌─────────────────┐                 │`  
       `├──────────────►│     Shifts      │◄────────────────┘`  
       `│               └────────┬────────┘`  
       `│                        │`  
       `▼                        ▼`  
`┌──────────────┐       ┌─────────────────┐       ┌───────────────────┐`  
`│   Products   │       │     Orders      │◄──────┤     Payments      │`  
`└──────┬───────┘       └────────┬────────┘       └───────────────────┘`  
       `│                        │`  
       `▼                        ▼`  
`┌──────────────┐       ┌─────────────────┐`  
`│ Batch Items  │       │   Order Items   │`  
`└──────────────┘       └─────────────────┘`

### **Core Entity Definitions**

> * **tenants**: Enterprise account records (id, name, subscription\_tier, created\_at).  
> * **departments**: Functional units (id, tenant\_id, name, type \[RECEPTION, PRODUCTION, DISPATCH, STORE\]).  
> * **users**: Staff accounts (id, tenant\_id, department\_id, role, pin\_hash, is\_active).  
> * **shifts**: Shift ledger instances (id, tenant\_id, department\_id, shift\_type, outgoing\_lead\_id, incoming\_lead\_id, status \[OPEN, BALANCED, UNBALANCED\], variance\_data, opened\_at, closed\_at).  
> * **production\_batches**: Output batches (id, tenant\_id, shift\_id, product\_id, units\_produced, raw\_materials\_summary).  
> * **orders**: Customer transactions (id, tenant\_id, reception\_shift\_id, status \[DRAFT, PUSHED, FULFILLED, CANCELLED\], total\_amount, pushed\_at, fulfilled\_at).  
> * **payments**: Payment splits (id, order\_id, method \[CASH, TRANSFER, DEBT\], amount, customer\_ref, payment\_metadata).  
> * **incidents**: Audit alerts (id, tenant\_id, shift\_id, type, severity, delta\_values, resolved\_status).

## **7\. Implementation Roadmap & MVP Phasing**

`[Phase 1: MVP Core] ────────► [Phase 2: Reconciliation & PWA] ────────► [Phase 3: Executive Suite]`  
`• RBAC & Tenant Setup         • Offline Outbox Sync Engine              • AI Insights Engine`  
`• Basic Department Forms      • Shift Handover Co-Sign State Machine    • Advanced Multi-Org Config`  
`• Manual Order Dispatch       • Anomaly Alerting (SMS/Push)             • Customer Debt Aging`

### **Phase 1: MVP Core (Weeks 1–6)**

> * Multi-tenant data isolation and RBAC setup.  
> * Production batch recording and Raw Material logs.  
> * Reception order screen with Cash, Transfer, and Debt support.  
> * Manual "Push to Dispatch" queue and one-tap fulfillment.

### **Phase 2: Reconciliation & PWA Engine (Weeks 7–12)**

> * Local IndexedDB client storage with background sync outbox.  
> * Dual-signoff Shift Handover state machine for Dispatch and Reception.  
> * Discrepancy math engine and asynchronous owner alert pipeline (Web Push / SMS).

### **Phase 3: Analytics & Advanced Features (Weeks 13–16)**

> * Business Owner executive dashboard (real-time velocity, debt tracking, variance heatmaps).  
> * AI insights generation for operational optimization and yield loss detection.  
> * Custom department and role configuration builder for multi-industry expansion.