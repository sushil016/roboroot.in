# AGENTS.md — RoboGig Autonomous Build Agent

> This file governs how codex operates on this project.
> Follow every instruction here before writing any code.
Codex --resume 22d5a030-1a84-41a6-bd5e-13aa0efd644c
---

## MONOREPO STRUCTURE

```
robo-gig/
├── admin-frontend/   # Admin panel (React/Next.js)
├── backend/          # Express + Prisma + PostgreSQL API
│   ├── src/
│   ├── prisma/
│   ├── docker-compose.yml
│   └── .env
├── frontend/         # Customer-facing storefront
└── vercel.json
```

---

## THE AGENT LOOP — ALWAYS FOLLOW THIS

Every time you are invoked, run this loop. Do not skip steps.

```
STEP 1 → SCAN       Understand what exists
STEP 2 → AUDIT      Find what is incomplete or missing
STEP 3 → PLAN       Decide what to build next (one focused unit)
STEP 4 → BUILD      Implement it fully, end-to-end
STEP 5 → VERIFY     Check it compiles, types pass, no regressions
STEP 6 → REPORT     Tell the user exactly what was built
STEP 7 → NEXT       State clearly what the next build unit should be
```

Repeat from STEP 1 each new session.

---

## STEP 1 — SCAN (always run these first)

```bash
# Map every file in the repo
find . -type f \
  | grep -v node_modules \
  | grep -v .git \
  | grep -v dist \
  | grep -v ".next" \
  | sort

# Read the backend entry point and routes
cat backend/src/index.ts   # or app.ts / server.ts
ls backend/src/routes/
ls backend/src/controllers/
ls backend/src/middleware/

# Read the Prisma schema — this is the source of truth for the data model
cat backend/prisma/schema.prisma

# Read frontend pages and components
ls frontend/src/app/        # or frontend/src/pages/
ls frontend/src/components/

# Read admin structure
ls admin-frontend/src/

# Check what APIs are already wired
cat backend/src/routes/*.ts 2>/dev/null || ls backend/src/routes/

# Check env vars in use
cat backend/.env.example
```

Read the output of all of these before proceeding.

---

## STEP 2 — AUDIT

After scanning, build an internal audit checklist. For each area below, mark DONE / PARTIAL / MISSING:

### Backend
- Auth (register, login, JWT refresh, Google OAuth)
- User roles and permissions middleware
- Products CRUD (all types: component, kit, book, software, PCB service, build request, premade project)
- Categories and Subcategories CRUD
- Cart (add, remove, update qty, sync)
- Orders (create, list, detail, status update, cancel)
- Razorpay payment (create order, verify webhook, refund)
- PCB quote request flow
- Custom build/drone request flow
- File upload (Cloudflare R2 or local)
- Search (full-text with filters)
- Coupons (validate, apply)
- Shipping (Shiprocket rate fetch, tracking)
- Reviews (create, list, moderate)
- Wishlist
- Email (Resend — order confirm, quote, welcome, reset)
- Admin analytics endpoints
- Admin inventory / low stock alerts
- Admin team member management
and according to product if needed add and build


### Frontend (Customer Storefront)
- Homepage (hero, categories, featured, bestsellers)
- Product listing with filters/sort/pagination
- Product detail (gallery, variants, specs, reviews)
- Cart drawer + cart page
- Checkout (address to shipping to payment)
- Order confirmation + order history
- PCB services page + quote request form
- Projects page (premade + custom build form)
- Auth (login, register, forgot password)
- Account page (profile, addresses, orders, wishlist)
- Search results page
- Robomaniac Store section
and according to product if needed add and build


### Admin Frontend
- Dashboard (KPIs, revenue chart, recent orders)
- Products (list, add, edit, bulk actions, image upload)
- Categories management
- Inventory and stock management
- Orders (list, detail, status update, invoice)
- PCB requests management
- Build requests management
- Customers list and detail
- Analytics (revenue, top products, charts)
- Coupons management
- Team members and roles
- Banners and content management
- Settings (store config, integrations)
and according to product if needed add and build

---

## STEP 3 — PLAN

After the audit, select the **highest-priority incomplete unit** using this priority order:

```
1. Blocking issues (something existing is broken)
2. Backend API routes needed by already-built frontend pages
3. Core commerce flow: auth → product → cart → checkout → order → payment
4. Admin panel features (in sidebar order)
5. Supporting features (search, reviews, coupons, wishlist)
6. Polish (SEO, emails, empty states, loading skeletons)
```

State your plan clearly before coding:

```
PLAN:
- What I found: [brief audit summary]
- What I will build now: [specific feature]
- Files I will create: [list]
- Files I will modify: [list]
- Estimated scope: [small / medium / large]
```

Do not start coding until the plan is stated.

---

## STEP 4 — BUILD RULES

### General
- One feature at a time — complete it fully before moving on
- End-to-end — backend route + controller + frontend page/component together
- No stubs — no TODO comments, no "not implemented" throws in production paths
- Read before writing — always read a file before modifying it
- Never hardcode — no secrets, IDs, or URLs in code. Use env vars.

### Backend (Express + Prisma + TypeScript)

Folder responsibilities:
```
src/
  routes/        Route definitions only — no logic here
  controllers/   Request handling, calls services, sends response
  services/      Business logic — pure functions, no req/res
  middleware/    auth, roleGuard, validate, errorHandler, rateLimit
  validators/    Zod schemas — single source of truth for all shapes
  utils/         Pure helpers — formatCurrency, slugify, asyncHandler
  types/         Shared TypeScript interfaces
  emails/        Resend email templates
```

Rules:
- All routes use a `validate(zodSchema)` middleware before the controller
- All controllers wrapped in `asyncHandler` — no unhandled promise rejections
- Services return typed results; they never throw HTTP errors (controllers handle that)
- API response shape is always: `{ success: boolean, data?: T, error?: string, message?: string }`
- Use `Prisma.$transaction` for any multi-step DB write
- Soft delete with `deletedAt` — never hard delete orders, users, or products




## PRODUCT CONTEXT

**RoboRoot** (roboroot.in) is a marketplace for:
- Electronics components (sensors, dev boards, motors, drones, power, tools)
- Robomaniac branded products (course kits, LEGO kits, AI books, BlockSquare software)
- PCB design and fabrication services (quote request to custom order flow)
- Custom drone, robot, and IoT build requests
- Pre-made project kits ready to purchase

**Users**: Students, hobbyists, makers, engineers across India  
**Admin team**: Sushil (SUPER_ADMIN) + team members with role-based access  
**Reference store**: robu.in — match or exceed their feature depth and UX

---

## WHAT NEVER TO DO

- Do NOT write code without scanning existing files first
- Do NOT create a file if one already exists for that purpose — extend it
- Do NOT use the `any` type
- Do NOT leave `console.log` in production code
- Do NOT skip Zod validation on any API endpoint
- Do NOT call the database directly from frontend code
- Do NOT use the `pages/` directory if the project uses App Router
- Do NOT hardcode secrets, prices, or IDs
- Do NOT build a frontend page before its backend API route exists
- Do NOT report a session complete while TypeScript errors remain
- Do NOT delete or rename existing routes without explicitly flagging the change

---

*This file is the single source of truth for codex behavior on this project.*  
*Update it whenever the stack, priorities, or structure changes.*