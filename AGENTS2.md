# AGENTS.md — Robotics E-Commerce AI Chat System

This file is the single source of truth for codex when building this project.
Read every section before writing any code. This is a production system — not a prototype.

---

## Project Overview

We are building an AI-powered conversational layer on top of a **Robotics E-Commerce website**.
Users can search products, place orders, make payments, track orders, and get invoices — entirely
through a chat interface. No clicking through menus. Just typing.

Four systems work as one:

1. **Catalog Hybrid RAG** — answers product/SKU/category questions using vector + keyword search
2. **Claude Tool-Use Layer** — executes real account actions (order, pay, invoice, track) via validated backend handlers
3. **PageIndex Document Retrieval** — reasons over hierarchical document trees for manuals, policies, datasheets, tutorials, and project reports
4. **Graph Reasoning** — traverses product compatibility relations for contextual recommendations

The architecture is token-efficient, secure, production-ready, and built for Indian robotics
e-commerce (Razorpay for payments, ₹ currency, CBSE/school robotics catalog context).

---

## Current Repository Structure

```
robo-gig/
├── frontend/                       → Customer Next.js App Router storefront + chat widget
├── backend/                        → Express + Prisma API, RAG pipeline, tool-use handlers
│   ├── prisma/                     → Existing Prisma schema, migrations, pgvector extension SQL
│   ├── src/
│   │   ├── features/
│   │   │   ├── ai-chat/            → Chat endpoint, SSE controller, session and intent services
│   │   │   ├── embeddings/         → Chunker, embedder, indexer offline pipeline
│   │   │   ├── rag/                → Retriever, reranker, graph, context and prompt builders
│   │   │   └── tools/              → Claude tool definitions, permissions, schemas, handlers
│   │   └── scripts/                → index-products.ts, index-docs.ts
│   └── docker-compose.yml
├── admin-frontend/                 → Admin Next.js app; optional indexing/AI ops views later
├── AGENTS.md                       → Existing project build-agent instructions
└── AGENTS2.md                      → AI chat/RAG/tool-use feature instructions
```

Do not create a new `apps/` or `packages/` tree for this feature. Adapt every folder mentioned below into the existing `frontend/`, `backend/`, and `admin-frontend/` directories.

### Path Mapping From The Original Design

```
apps/web                    → frontend
apps/api                    → backend
packages/db                 → backend/prisma + backend/src/lib/prisma.ts
packages/embeddings         → backend/src/features/embeddings
packages/rag                → backend/src/features/rag
packages/tools              → backend/src/features/tools
packages/shared             → backend/src/types, backend/src/utils, frontend/types as needed
scripts/index-products.ts   → backend/src/scripts/index-products.ts
scripts/index-docs.ts       → backend/src/scripts/index-docs.ts
infra/docker-compose.yml    → backend/docker-compose.yml or root docker-compose.yml later
```

---

## Tech Stack

| Layer            | Technology                              | Why                                      |
|------------------|-----------------------------------------|------------------------------------------|
| Frontend         | Existing Next.js App Router + Tailwind CSS | SSR, streaming, file-based routing    |
| Backend          | Existing Node.js + Express API          | Fits current backend structure           |
| LLM              | Anthropic Claude API                    | Best tool-use, streaming, context window |
| Claude Model     | `claude-sonnet-4-20250514`              | Balance of speed, quality, cost          |
| Embeddings       | DigitalOcean Qwen3 Embedding 0.6B       | 1024-dim, serverless, multilingual       |
| Vector DB        | pgvector on Neon PostgreSQL             | Fast catalog/product retrieval           |
| Keyword Search   | pg_trgm (BM25-style)                    | Exact part numbers, model codes          |
| PageIndex        | In-DB document tree + LLM tree reasoning | Long document retrieval with page/section traceability |
| Graph Relations  | PostgreSQL recursive CTEs               | Product compatibility traversal          |
| Session + Cache  | Upstash Redis                           | Edge-ready, TTL per query type           |
| Auth             | Existing JWT middleware                 |                                          |
| ORM              | Prisma                                  | Type-safe, migration support             |
| Payments         | Razorpay                                | India-first, UPI + card + wallet         |
| Notifications    | Nodemailer + WhatsApp (Twilio)          |                                          |
| Deploy           | Docker + Railway or Fly.io             |                                          |
| Package manager  | Existing per-app pnpm setup             |                                          |
| Language         | TypeScript strict mode everywhere       |                                          |

---

## Environment Variables

Use the existing `backend/.env.example` and `frontend/.env.example` patterns. Add AI chat variables to the app that needs them. Never commit real secrets.

```bash
# Database
DATABASE_URL=postgresql://...neon.tech/robomaniac?sslmode=require

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# DigitalOcean / Qwen embeddings
EMBEDDING_PROVIDER=digitalocean
DIGITALOCEAN_TOKEN=doo_v1_or_model_access_key
DIGITALOCEAN_INFERENCE_BASE_URL=https://inference.do-ai.run
DIGITALOCEAN_EMBEDDING_MODEL=qwen3-embedding-0.6b
EMBEDDING_DIMENSIONS=1024

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=

# Auth
JWT_SECRET=minimum-32-chars-random-string
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://store.robomaniac.in
NEXT_PUBLIC_API_URL=https://api.robomaniac.in
```

---

## Database Schema

Location: `backend/prisma/schema.prisma`

Rules:
- Preserve the current Prisma conventions unless a migration specifically requires otherwise.
- The current schema uses `cuid()` IDs; keep that style for new Prisma models unless there is a strong compatibility reason to change.
- All timestamps should continue using `TIMESTAMPTZ` where the existing backend already does.
- Embeddings stored as `Unsupported("vector(1024)")` in Prisma (raw SQL for vector ops)
- Add a backend migration SQL step for `vector` and `pg_trgm` before using vector queries.

### 001_extensions.sql (run manually once on Neon)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Core Tables

**products / components** — use the existing `Component` model as the primary product catalog.
```sql
Component.id, name, description, category, subcategory, brand, unitPriceCents,
stockQuantity, tags, productType, createdAt, updatedAt
```
Do not create a duplicate `products` table unless the existing catalog is intentionally redesigned. RAG chunks should reference existing `Component` and `Project` records.

**rag_chunks** — embedded catalog and short knowledge entries
```sql
id, source_type TEXT, source_id UUID, chunk_text TEXT,
metadata JSONB, embedding vector(1024), created_at
```
source_type values: `component | project | faq | short_policy`

Indexes required:
```sql
CREATE INDEX ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON rag_chunks USING GIN (chunk_text gin_trgm_ops);
```

**documents** — long source documents for PageIndex-style retrieval
```sql
id, title, source_type TEXT, source_id TEXT?, file_url TEXT?,
metadata JSONB, created_at, updated_at
```
source_type values: `manual | datasheet | policy | tutorial | project_report | course_material`

**document_nodes** — hierarchical PageIndex tree nodes
```sql
id, document_id → documents, parent_id → document_nodes?,
node_id TEXT, title TEXT, summary TEXT, full_text TEXT?,
start_page INT?, end_page INT?, start_index INT?, end_index INT?,
sort_order INT, metadata JSONB, created_at
```

Indexes required:
```sql
CREATE INDEX ON document_nodes (document_id, parent_id, sort_order);
CREATE INDEX ON document_nodes USING GIN (summary gin_trgm_ops);
CREATE INDEX ON document_nodes USING GIN (title gin_trgm_ops);
```

**relations** — graph edges between components/products
```sql
id, source_id → components, target_id → components,
type TEXT, metadata JSONB
```
type values: `compatible_with | includes | upgrade_of | frequently_bought_with | requires`

Reuse the existing `User`, `Order`, `OrderItem`, `Payment`, `Address`, `Cart`, `WishlistItem`, and `Review` models. Extend them only when the chat/tool layer needs a field that does not already exist.

---

## Combined RAG Pipeline

This project uses **combined retrieval**, not a single RAG style:

1. **Embedding + keyword retrieval** for catalog-like data: components, projects, SKUs, categories, prices, stock, short FAQs.
2. **PageIndex-style tree retrieval** for long documents: PDFs, datasheets, manuals, policies, tutorials, course material, project reports.
3. **Graph retrieval** for relationships: compatible components, required parts, kit contents, upgrades, frequently bought together.

Do not force every source through the same pipeline. Product catalogs should stay fast and searchable through pgvector + pg_trgm. Long professional documents should be indexed into natural page/section trees and retrieved by reasoning over that tree.

### Indexing Pipeline (offline — `backend/src/features/embeddings/`)

Runs via scripts. Re-runs on product create/update via webhook.

**Embedding indexing rules:**
- Components: one structured chunk per component: name + SKU + category + subcategory + brand + price + stock + description + tags. Max 300 tokens.
- Projects: one structured chunk per project: title + category + difficulty + summary + outcomes + estimated cost + required components. Max 350 tokens.
- FAQs and short policies: one chunk per Q&A or policy entry.
- Do not convert long PDFs/manuals/datasheets into artificial sliding-window chunks by default. Use the PageIndex tree pipeline for those.
- Always attach metadata: `{ source_type, source_id, category, brand, price, stock, url }`

**Embedding:**
- Model: `qwen3-embedding-0.6b` — 1024 dimensions
- Batch size: 100 chunks per API call
- Upsert pattern: delete old chunks for source_id, then insert new ones

**PageIndex tree indexing rules:**
- Long documents are parsed into natural pages/sections.
- Generate a hierarchical table-of-contents tree with stable `node_id` values.
- Each node stores: `title`, `summary`, `start_page`, `end_page`, optional `full_text`, `parent_id`, `sort_order`.
- Do not embed every long-document node unless a later optimization specifically requires optional section embeddings.
- Tree summaries must be short enough for LLM tree search. Prefer 1-3 sentences per node.
- Keep page and section references so answers can cite where information came from.

**Files to build:**
```
backend/src/features/embeddings/
├── services/
│   ├── chunker.service.ts       → chunkComponent(), chunkProject(), chunkShortDocument()
│   ├── embedder.service.ts      → embed(texts[]) → number[][]
│   ├── indexer.service.ts       → embedAndStore(chunks[])
│   └── document-tree-indexer.service.ts → buildAndStoreDocumentTree(document)
├── types/
│   └── embeddings.types.ts
└── index.ts
```

### Query Pipeline (real-time — `backend/src/features/rag/`)

Runs on every chat message that needs knowledge retrieval.

**Step 1 — Query expansion**
Expand robotics synonyms before embedding:
- "servo" → "servo motor actuator SG90 MG996R"
- "board" → "microcontroller development board"
- "lidar" → "LiDAR laser distance sensor RPLidar"
Keep a `synonyms.json` lookup table. Apply before embedding.

**Step 2 — Retrieval routing**
Classify retrieval need as `catalog | document | graph | combined`.

Use catalog retrieval for:
- product search, SKUs, part numbers, categories, prices, stock, "best under ₹X", "show ESP32"

Use PageIndex document retrieval for:
- wiring instructions, datasheet questions, manual interpretation, policies, tutorials, project-report questions, "what does the document say"

Use combined retrieval for:
- recommendations that need both product matches and document reasoning, e.g. "recommend a motor driver and explain how to wire it"

**Step 3 — Parallel retrieval**
Run independent retrieval paths with `Promise.all`:
- Vector search: pgvector cosine similarity over `rag_chunks`, top 20.
- Keyword search: pg_trgm similarity over `rag_chunks.chunk_text`, top 20.
- PageIndex tree search: LLM or deterministic tree traversal over `document_nodes`, top relevant sections/pages.
- Graph search: compatible/required/upgrade relations for top component/project IDs.

**Step 4 — Rerank and merge**
Merge vector + keyword hits, deduplicate by id, score catalog hits by:
`catalogScore = 0.7 * vectorScore + 0.3 * keywordScore`

Document tree hits are scored separately by reasoning relevance and traceability:
`documentScore = reasoningConfidence + sectionSpecificity + pageTraceability`

Return a balanced set:
- up to 4 catalog/product hits
- up to 4 PageIndex document nodes
- up to 6 graph-related products

**Step 5 — Graph augmentation**
If top results include products, fetch compatible/related products via relations table.
Use recursive CTE — max 2 hops. Append as extra context with label "Related products:".

**Step 6 — Context builder**
Hard token budget: 700 tokens for retrieved context.
- Product/catalog context: max 4 hits, trim each to 1-2 sentences.
- PageIndex context: max 4 document nodes, include title, summary, page range, and only the most relevant full-text excerpt.
- Graph context: max 6 relation facts.
- Format with source labels: `Product`, `Document`, `Related product`.
- If context is too large, trim PageIndex full text first, then catalog descriptions. Do not remove traceability fields.

**Files to build:**
```
backend/src/features/rag/
├── services/
│   ├── retriever.service.ts        → hybridRetrieve(query, filters?)
│   ├── catalog-vector-retriever.service.ts
│   ├── catalog-keyword-retriever.service.ts
│   ├── document-tree-retriever.service.ts
│   ├── expander.service.ts         → expandQuery(query)
│   ├── reranker.service.ts         → mergeAndRerank(query, vectorHits, bm25Hits)
│   ├── graph.service.ts            → getRelated(componentIds[])
│   ├── context-builder.service.ts  → buildContext(chunks[]) → string
│   └── prompt-builder.service.ts   → buildPrompt(context, history, query) → Message[]
├── data/
│   └── synonyms.json
├── types/
│   └── rag.types.ts
└── index.ts
```

**Token budget per Claude call (hard limit):**
```
System prompt:      ~80 tokens
Retrieved context: ~700 tokens
Session history:   ~100 tokens  (last 4 turns only — always slice(-4))
User query:         ~50 tokens
─────────────────────────────
Total:             ~930 tokens input per call
```

Never exceed this. If context is too large, trim excerpts first while preserving source labels, document node titles, page ranges, and product IDs.

---

## Tool-Use Layer

Location: `backend/src/features/tools/` + wired into the existing Express backend.

This project does not need a separate Fastify app or separate MCP package for the first implementation. Build Claude-compatible tool definitions and handlers inside the backend, then call them from the chat service.

### Tool Registry (`backend/src/features/tools/registry.ts`)

Export array of Anthropic tool definitions. These are passed to every Claude API call.

Tools to implement:
1. `search_products` — delegates to RAG retriever
2. `place_order` — creates order in DB, validates stock
3. `initiate_payment` — creates Razorpay order, returns payment link
4. `verify_payment` — webhook handler, marks payment success
5. `get_invoice` — fetches order + payment, generates PDF
6. `track_order` — returns order status + tracking URL
7. `get_order_history` — last 10 orders for user
8. `cancel_order` — cancels if status is pending/confirmed only
9. `get_product_details` — single product full details + relations

### Tool Handlers (`backend/src/features/tools/handlers.ts`)

**CRITICAL SECURITY RULES — never break these:**
1. `userId` ALWAYS comes from `ctx.userId` (JWT middleware) — NEVER from tool params
2. All order/payment/invoice tools must verify `order.user_id === ctx.userId` before proceeding
3. Validate all params with Zod before executing any DB operation
4. Tool handler returns `{ data }` on success or `{ error: string }` on failure — never throws
5. Log every tool call: `{ tool, userId, params, result, duration_ms }`

**Tool permission matrix:**
```typescript
const PERMISSIONS: Record<string, UserRole[]> = {
  search_products:   ['guest', 'user', 'admin'],
  get_product_details: ['guest', 'user', 'admin'],
  place_order:       ['user', 'admin'],
  initiate_payment:  ['user', 'admin'],
  get_invoice:       ['user', 'admin'],
  track_order:       ['user', 'admin'],
  get_order_history: ['user', 'admin'],
  cancel_order:      ['user', 'admin'],
};
```

### Chat Endpoint (`backend/src/features/ai-chat/routes/chat.routes.ts`)

This is the core loop. Every chat message goes through here.

```
POST /api/chat
Auth: Bearer JWT required
Body: { message: string, sessionId: string }
Response: text/event-stream (SSE)
```

**Request flow:**
1. Rate limit check — 20 messages/minute per userId (Upstash sliding window)
2. Load session history from Redis key `session:{sessionId}` — last 8 items (4 turns)
3. Classify intent: `knowledge | action | mixed` using keyword heuristics
4. If `knowledge` or `mixed`: run hybridRetrieve(), build context string
5. Call Claude API with tools + context + history (streaming)
6. For each streamed event:
   - `content_block_delta` (text) → write to SSE stream immediately
   - `content_block_start` with `tool_use` → execute handler, feed result back to Claude
7. After tool execution, make second Claude call with `tool_result` to get user-facing reply
8. Save turn to Redis: `RPUSH session:{sessionId} {userMsg} {assistantReply}`, TTL 3600
9. Cache static answers (FAQ/policy): `SET chat:{queryHash} {reply}` TTL 86400

**Intent classifier heuristics (`backend/src/features/ai-chat/services/intent.service.ts`):**
- Action keywords: order, buy, purchase, pay, payment, upi, invoice, bill, track, cancel, history, return
- Knowledge keywords: what, which, how, does, compatible, difference, specs, price, stock, recommend
- Mixed: contains both → run RAG AND include tools

---

## Redis Cache Strategy

```
Key pattern                   TTL         What
──────────────────────────────────────────────────────────────────
chat:{md5(query)}             86400s      Static: FAQ, policy answers
products:{category}           3600s       Product listing results
session:{sessionId}           3600s       Conversation history (list)
ratelimit:{userId}            60s         Sliding window counter
embed:{md5(text)}             forever     Cached embedding vectors
```

Never cache: order status, payment state, stock levels, user-specific data.

---

## Frontend Chat Widget

Location: `frontend/features/chat/`

**Files:**
```
frontend/features/chat/
├── components/
│   ├── ChatWidget.tsx       → main widget component
│   ├── MessageList.tsx      → renders message history
│   ├── MessageBubble.tsx    → single message, handles product cards
│   ├── InputBar.tsx         → input + send button
│   ├── ProductCard.tsx      → inline product result card with Add to Cart
│   └── QuickReplies.tsx     → suggested action chips
├── hooks/
│   └── useChatStream.ts     → SSE hook, handles streaming
├── services/
│   └── chat.service.ts
├── types/
│   └── chat.types.ts
└── index.ts
```

Mount `ChatWidget` in the existing storefront layout wrapper, most likely `frontend/components/layout/LayoutWrapper.tsx`, after reading the current layout code.

**UX requirements:**
- Floating button bottom-right, opens panel on click
- Streaming text renders token by token (no waiting for full response)
- Product results render as cards inline in the chat (not just text)
- Quick reply chips on first open: "Search products", "Track my order", "View catalog"
- Show typing indicator (3-dot animation) while waiting for first token
- Persist chat history in localStorage for current session
- Mobile responsive — full screen on mobile, 380px panel on desktop

**SSE streaming hook pattern:**
Use `EventSource` for GET requests or `fetch` with `ReadableStream` for POST.
Prefer `fetch` + `ReadableStream` since we need to send a POST body.
Parse `data: {...}\n\n` lines, accumulate delta text, update last message in state.

---

## API Routes

```
POST   /api/chat                         → Main chat endpoint (SSE stream)
POST   /api/auth/signup                  → Existing create user account route
POST   /api/auth/login                   → Existing JWT login route
GET    /api/components                   → Existing product/component listing route
GET    /api/components/:id               → Existing product/component detail route
POST   /api/webhooks/product             → New re-index trigger (admin only, if needed)
POST   /api/payments/webhook/razorpay    → Existing Razorpay callback route
GET    /api/orders/my                    → Existing user order history route
GET    /api/orders/:id                   → Existing order detail route
GET    /api/orders/:id/invoice           → Existing invoice PDF route
```

---

## Razorpay Integration

Use `razorpay` npm package.

**Flow:**
1. `place_order` tool → creates order in DB with status `pending`
2. `initiate_payment` tool → calls `razorpay.orders.create()`, returns `razorpay_order_id` + amount
3. Frontend opens Razorpay checkout with the order details
4. On payment success, Razorpay calls the existing `POST /api/payments/webhook/razorpay`
5. Webhook verifies signature using `RAZORPAY_KEY_SECRET`, updates payment + order status
6. Send order confirmation notification (email + WhatsApp)

**Always verify webhook signature — never skip this step.**

---

## Invoice PDF Generation

Use `pdfkit` npm package.

Invoice must include:
- Robomaniac Store header + logo
- Invoice number, date
- Customer name, email, address
- Line items table (product name, qty, unit price, total)
- Subtotal, GST (18%), grand total
- Payment method + transaction ID
- "Thank you for supporting robotics education!" footer

Save generated PDFs to Cloudflare R2 or local `/tmp` in dev.
Return a signed URL valid for 24 hours.

---

## Error Handling

All API routes and tool handlers use this pattern:

```typescript
// Standard API response shape
type ApiResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: string; code: string }

// Tool handler response shape
type ToolResult<T> =
  | { data: T }
  | { error: string }
```

Never let unhandled errors reach the SSE stream — catch everything, return `{ error }`.
Log errors with enough context: `{ userId, tool, input, error: err.message, stack }`

HTTP status codes:
- 400: invalid input (Zod validation failure)
- 401: missing/invalid JWT
- 403: permission denied (wrong role or wrong user_id)
- 429: rate limited
- 500: unexpected server error

---

## Key Commands

```bash
# Install deps per app
cd backend && pnpm install
cd frontend && pnpm install
cd admin-frontend && pnpm install

# Run backend API
cd backend && pnpm dev

# Run customer storefront
cd frontend && pnpm dev

# Run admin frontend
cd admin-frontend && pnpm dev

# Run indexing pipeline
cd backend && pnpm exec tsx src/scripts/index-products.ts
cd backend && pnpm exec tsx src/scripts/index-docs.ts

# Database
cd backend && pnpm prisma:migrate
cd backend && pnpm bootstrap
cd backend && pnpm prisma:studio

# Backend type check
cd backend && pnpm build

# Frontend builds
cd frontend && pnpm build
cd admin-frontend && pnpm build

# Docker dev for backend services
cd backend && docker-compose up -d
```

---

## Coding Conventions

- TypeScript strict mode — no `any`, no `!` assertions without comment explaining why
- Zod for all external input validation (API request bodies, tool params, env vars)
- All async DB operations wrapped in try/catch — no unhandled promise rejections
- Use `Promise.all` for independent parallel operations (vector + BM25 search, etc.)
- No raw SQL except for pgvector operations — use Prisma everywhere else
- Prisma `$queryRaw` for vector ops — use `Prisma.sql` tagged template to prevent injection
- Import paths: follow the existing backend/frontend import style. Do not introduce package aliases unless the project already uses them.
- One function per file for core pipeline steps — keeps things testable
- All tool handlers are pure functions: `(params, ctx) => Promise<ToolResult>`
- Never log API keys, JWT tokens, or payment details
- All currency in paise internally (integer), convert to ₹ only at display layer
- Dates always UTC internally — format for IST only at response layer

---

## What codex Should Build — Ordered Task List

Work through these in order. Complete each before starting the next.

### Milestone 1 — Feature scaffold in current repo
- [ ] Create `backend/src/features/ai-chat`
- [ ] Create `backend/src/features/embeddings`
- [ ] Create `backend/src/features/rag`
- [ ] Create `backend/src/features/tools`
- [ ] Create `frontend/features/chat`
- [ ] Extend existing `.env.example` files with AI chat variables
- [ ] Do not create `apps/` or `packages/`

### Milestone 2 — Database layer
- [ ] Extend `backend/prisma/schema.prisma` with `RagChunk`, `Document`, `DocumentNode`, and product/component relation models
- [ ] Add migration SQL for `vector` and `pg_trgm`
- [ ] Reuse `backend/src/lib/prisma.ts`
- [ ] Add seed/index support using existing `Component` and `Project` data
- [ ] Add indexes for vector search, keyword search, and document tree traversal

### Milestone 3 — Combined indexing pipeline
- [ ] Build catalog chunker (`chunkComponent`, `chunkProject`, `chunkShortDocument`)
- [ ] Build embedder (batch DigitalOcean Qwen embedding calls)
- [ ] Build catalog indexer (embed + upsert to `rag_chunks`)
- [ ] Build PageIndex-style document tree indexer (parse long docs into `DocumentNode` hierarchy)
- [ ] Store page/section traceability for every document node
- [ ] Build `backend/src/scripts/index-products.ts` CLI
- [ ] Build `backend/src/scripts/index-docs.ts` CLI

### Milestone 4 — Combined RAG query pipeline
- [ ] Build query expander with robotics synonyms JSON
- [ ] Build vector search function (pgvector cosine query)
- [ ] Build BM25 search function (pg_trgm query)
- [ ] Build PageIndex document tree retriever
- [ ] Build retrieval router (`catalog | document | graph | combined`)
- [ ] Build reranker (merge catalog, PageIndex, and graph results)
- [ ] Build graph augmentation (recursive CTE for compatible products)
- [ ] Build context builder (700 token retrieval budget)
- [ ] Build prompt builder (80 + 700 + 100 + 50 token structure)

### Milestone 5 — MCP tool layer
- [ ] Write all 9 tool definitions in registry.ts
- [ ] Write all 9 tool handlers in handlers.ts
- [ ] Write permission checker middleware
- [ ] Write Zod schemas for every tool's input params

### Milestone 6 — API server
- [ ] Reuse the existing Express app in `backend/src/server.ts`
- [ ] Reuse existing auth routes and JWT middleware
- [ ] Build `/api/chat` route (SSE stream, tool-use loop, session management)
- [ ] Reuse existing component/product routes
- [ ] Reuse existing order routes
- [ ] Reuse existing Razorpay webhook handler
- [ ] Build product re-index webhook

### Milestone 7 — Frontend
- [ ] Reuse existing `frontend` Next.js app
- [ ] Build `frontend/features/chat` component tree
- [ ] Build `useChatStream` hook
- [ ] Build ProductCard inline component
- [ ] Integrate with API chat endpoint
- [ ] Mount ChatWidget in the existing storefront layout

### Milestone 8 — Production hardening
- [ ] Add structured logging (pino)
- [ ] Reuse or extend existing health check endpoint
- [ ] Extend existing Docker setup instead of creating a new app tree
- [ ] Add Redis caching to chat route
- [ ] Reuse existing invoice PDF generation where possible

---

## Important Context

- This is for **Robomaniac**, a Mumbai-based robotics EdTech and e-commerce brand
- Products are robotics components: ESP32, Arduino, Raspberry Pi, servos, sensors, motor drivers, LiDAR, robot kits, etc.
- Target customers: students, hobbyists, engineering college labs, school robotics programs
- Currency: Indian Rupees (₹), payment via Razorpay (UPI primary)
- The assistant should speak technically but clearly — users range from beginners to engineering students
- Product catalog will have ~500–2000 SKUs at launch
- Expected chat volume: ~1000 messages/day at launch, scale to 10k/day

---

## Never Do These Things

- Never put `userId` as a parameter in any tool that executes account actions — always use `ctx.userId` from JWT
- Never skip Razorpay signature verification on webhooks
- Never dump entire DB results into Claude context — always use the context builder with token budget
- Never store conversation history in the DB — Redis only (it expires naturally)
- Never use `embedding <=>` without an index — always ensure ivfflat index exists first
- Never force long PDFs/manuals into arbitrary embedding chunks when a PageIndex document tree is more appropriate
- Never return PageIndex document text without page/section traceability
- Never hardcode API keys anywhere — always from `process.env`
- Never use `findFirst` without a `where` clause on `user_id` for user-specific data
- Never let the LLM decide the user's identity — only JWT can do that
