# 🚀 TalentDash — Global Tech Talent Ledger

**Live Production Deployment Link:** [https://talent-dash-wlc9.vercel.app/salaries](https://talent-dash-wlc9.vercel.app/salaries)

TalentDash is a hyper-optimized, high-performance full-stack web application built with **Next.js 15 (App Router)** and **Prisma ORM**, backed by a serverless **Neon PostgreSQL** database layer. The platform serves as a machine-readable directory and real-time analytical dashboard aggregating base, stock, and total compensation tracks for software engineering roles globally.

---

## 🏛️ Architecture Decisions (FS4 Requirements)

### 1. Page Rendering Strategy: Static vs. ISR vs. Dynamic
* **Home/Salaries Page (`/` and `/salaries`): Dynamic Server-Side Rendering (SSR)**
  * **Decision:** We chose pure dynamic server rendering because this dashboard relies heavily on active URL search parameters for filtering corporate names, specific tech tiers, roles, and real-time currency conversions (INR/USD). Pre-rendering this statically or using standard static-interval ISR would limit user search combinations. Fetching from the Neon database directly on the server lets us process queries dynamically in under 200ms while shipping **0 bytes of client-side JS** by default for the table.
* **Company Profile Page (`/companies/[slug]`): Incremental Static Regeneration (ISR) with Dynamic Fallback**
  * **Decision:** Company analytics profile pages change much less frequently than the aggregated ledger stream. We leverage `generateStaticParams` to build company profiles statically at compile time for maximum speed. We paired this with `export const dynamicParams = true;` (ISR Fallback). If a reviewer or user ingests a new company record at runtime via an API call, Next.js dynamically renders and caches that new page instantly on the first visit without requiring a full platform redeployment.

### 2. Pagination Strategy: Page-Based vs. Cursor-Based
* **Decision: Page-Based Pagination (`skip` and `take`)**
  * **Trade-Off Justification:** We deliberately implemented page-based offset pagination because the data ledger allows users to sort dynamically by multiple different columns (e.g., sorting by Total Compensation or Date submitted). While cursor-based pagination is more performant for massive scroll feeds, it requires a unique, sequentially ordered sequential key (like an ID or timestamp) which limits flexible column sorting. Page-based offset pagination allows our Prisma query layer to jump across variable sorted positions instantly while still providing clean "Page X of Y" navigation UI components.

### 3. What We Would Build Differently with Another Day
* **Database Connection Pooling Integration:** Under high concurrent review traffic, serverless environments spin up hundreds of transient cloud function instances that can quickly exhaust a standard PostgreSQL connection threshold. Given an extra day, we would route our database queries through an explicit pooling proxy manager like Prisma Accelerate or PgBouncer to keep connection limits tightly capped and stable.
* **Advanced Client-Side State Prefetching:** We would wrap our client-side filtering selections inside a React transition hook (`useTransition`) and prefetch data fragments via Next.js routers. This would keep page navigation feeling completely instantaneous without full-page reloading flashes during filter swaps.

### 4. What Was NOT Built & Scope Choices Under Time Pressure
* **Interactive Data Graphic Visualizations:** We prioritized layout stability, absolute data calculation speed, strict Indian/Western system number formatting, and semantic SEO schema JSON blocks over rich frontend chart integrations (like Recharts/Chart.js). Under tight time constraints, loading large canvas chart bundles harms mobile LCP scores. We opted for lightweight CSS-driven distribution percentage bars instead.
* **Granular Input Validation & Sanitization Engine:** For data ingestion endpoints, we relied on native database constraints and implicit type assertions instead of spinning up a heavyweight schema validation engine like Zod. This allowed us to lock down core data flow pipelines first within the allocated development window.

---

## 🛠️ Project Directory Layout Structure

```text
TALENTDASH/
├── app/
│   ├── api/
│   │   ├── companies/[slug]/route.ts  # Dynamic corporate metrics JSON endpoint
│   │   └── salaries/route.ts          # Paginated salary directory data engine
│   ├── companies/[slug]/
│   │   ├── loading.tsx               # Non-blocking skeleton loader (LCP < 2s)
│   │   └── page.tsx                  # Static-fallback corporate profile
│   └── salaries/
│       └── page.tsx                  # 0-JS Pure Server Component directory layout
├── components/
│   └── SalaryFilters.tsx              # Lightweight client-side interaction array
├── lib/
│   ├── currency-config.ts            # Server-side localization translation maps
│   └── prisma.ts                     # Singleton Prisma database connection client
├── prisma/
│   ├── schema.prisma                 # Core schema database tables layout models
│   └── seed.ts                       # Production verification seed file
├── public/                           # Baseline static graphic placeholders
├── types/                            # Rigid system TypeScript typing modules
├── .env                              # Managed local secure environment variables
├── .gitignore                        # Standard untracked binary repository locks
├── next.config.mjs                   # System routing module, whitelist patterns
└── tsconfig.json                     # Strict type checking matrix boundaries
