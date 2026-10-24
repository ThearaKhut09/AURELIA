# AURELIA — Premium Skincare & Fragrance Ecommerce for Cambodia

**Rituals for skin and senses.** A production-ready, full-stack ecommerce store built for the Cambodian market: USD/KHR dual currency, Khmer language toggle, and ABA PayWay payments (ABA PAY, KHQR, Visa/Mastercard).

Next.js 15 (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Prisma) · NextAuth · ABA PayWay

---

## Table of contents

1. [Features](#features)
2. [Quick start (local development)](#quick-start-local-development)
3. [Environment variables](#environment-variables)
4. [Payment flow — ABA PayWay](#payment-flow--aba-payway)
5. [PayWay onboarding (human checklist)](#payway-onboarding-human-checklist)
6. [Deployment (Vercel + Neon)](#deployment-vercel--neon)
7. [Going live checklist](#going-live-checklist)
8. [Architecture notes](#architecture-notes)
9. [Project structure](#project-structure)

---

## Features

**Storefront**
- Home page with glassmorphism hero, collection tiles, bestsellers, story, rituals, testimonials, newsletter
- Shop with floating glass filter bar (category / skin type / concern / price) + sorting + pagination
- Product pages: image gallery with zoom, variant/size selector, quantity, tabs (Description / Ingredients / How to use / Shipping), reviews + review form, related products
- Glass slide-in cart drawer with free-shipping progress (free over **$50**)
- 4-step solid, high-contrast checkout: **Contact → Shipping → Payment → Review**
- Dual currency everywhere: USD prices + KHR equivalent (`1 USD ≈ 4,100 KHR`, configurable)
- Khmer language toggle (ខ្មែរ) — full UI translation, Kantumruy Pro Unicode font, `lang` attribute switching
- Cambodian checkout fields: 25-province dropdown, Khan/District field, local phone validation (`0XX XXX XXX` / `+855…`)
- SEO: metadata API, Open Graph image, JSON-LD Product schema, `sitemap.xml`, `robots.txt`
- Accessible: WCAG-AA contrast on commerce surfaces, focus rings, `prefers-reduced-motion` respected

**Accounts**
- Email/password auth (NextAuth credentials, bcrypt, JWT sessions)
- Customer dashboard: profile, order history with status badges, address book (CRUD + default)

**Admin (`/admin`, role-gated)**
- Analytics: revenue (all-time / 30 days), orders, top products, recent orders
- Product CRUD with variants (SKU, price, stock), images (URL-based), active/featured toggles
- Order management: list, detail, fulfilment status transitions (PENDING → PAID → SHIPPED → DELIVERED)
- Customer list with lifetime spend

**Payments — ABA PayWay (official current API)**
- Hosted checkout (`view_type=hosted_view`) via signed multipart POST to `/api/payment-gateway/v1/payments/purchase`
- HMAC-SHA512 signature over concatenated values in the official field order
- JSON pushback webhook verified with `X-PayWay-HMAC-SHA512` header
- Authoritative status confirmation via the **Check Transaction** API (success-page polling)
- Idempotent payment confirmation, race-safe stock decrement inside a DB transaction
- Payment options: `abapay_khqr` (ABA PAY + KHQR), `cards` (Visa/MC/UnionPay), or "choose on PayWay page"
- **Demo mode** for local development without merchant credentials (auto-disabled in production)

---

## Quick start (local development)

### 1. Prerequisites
- Node.js 20+ and npm
- PostgreSQL 14+ — easiest via the bundled compose file (Docker), or use a free [Neon](https://neon.tech) / [Supabase](https://supabase.com) database

### 2. Install & configure

```bash
npm install
cp .env.example .env.local     # defaults work out of the box for local dev
```

### 3. Database

```bash
# Option A — local Postgres via Docker
docker compose up -d db

# Option B — a PostgreSQL already installed on your machine
#   Create the login + database once (pgAdmin Query Tool or psql as superuser):
#     CREATE ROLE aurelia LOGIN PASSWORD 'aurelia';
#     CREATE DATABASE aurelia OWNER aurelia;
#   (If the database already exists, just run: ALTER DATABASE aurelia OWNER TO aurelia;)
#   The connection string in .env.local matches this out of the box.

# Option C — a free cloud database (Neon / Supabase): paste its connection string
#   into .env.local as DATABASE_URL

npm run db:migrate      # creates tables (prisma migrate dev)
npm run db:seed         # 12 sample products, reviews, admin + demo customer
```

### 4. Run

```bash
npm run dev             # http://localhost:3000
```

**Demo accounts (from seed):**

| Role     | Email                | Password      |
| -------- | -------------------- | ------------- |
| Admin    | `admin@aurelia.test` | `Aurelia#2026` |
| Customer | `sokha@example.com`  | `Sokha#2026`  |

**Demo payment:** with `PAYWAY_DEMO_MODE="true"` and no PayWay keys (the local default), checkout completes with a simulated payment — the whole flow (order → stock decrement → confirmation → success page) works end-to-end without PayWay. Demo mode is hard-disabled when `NODE_ENV=production`.

**PayWay hash sanity check** (no DB needed):

```bash
npx tsx scripts/test-payway.ts
```

---

## Environment variables

See [.env.example](./.env.example) — every variable is documented there. The critical ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Auth secret (`openssl rand -base64 32`) / site URL |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO + payment redirects |
| `NEXT_PUBLIC_KHR_RATE` | Display-only KHR rate (default `4100`) |
| `VAT_RATE` | VAT fraction added at checkout (`0.1` = 10%, set `0` if not VAT-registered) |
| `PAYWAY_BASE_URL` | Sandbox: `https://checkout-sandbox.payway.com.kh` · Prod: `https://checkout.payway.com.kh` |
| `PAYWAY_MERCHANT_ID` / `PAYWAY_API_KEY` | From the PayWay merchant portal |
| `PAYWAY_RETURN_URL` | **Webhook** endpoint receiving the JSON pushback — `https://yourdomain.com/api/payway/webhook` |
| `PAYWAY_SUCCESS_URL` | Browser redirect after successful payment (`continue_success_url`) |
| `PAYWAY_CANCEL_URL` | Browser redirect when the customer cancels |
| `PAYWAY_DEMO_MODE` | `"true"` enables simulated payments in non-production only |
| `RESEND_API_KEY` / `EMAIL_FROM` | Order-confirmation emails via Resend (optional — no-ops without it) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Seed admin credentials |

---

## Payment flow — ABA PayWay

Implemented against the official docs at <https://developer.payway.com.kh/> (Ecommerce Checkout):

```
Browser                Next.js server                PayWay
   │  POST /api/checkout    │                            │
   ├───────────────────────>│ recompute prices from DB,  │
   │                        │ create PENDING order,      │
   │                        │ sign purchase fields       │
   │<───────────────────────┤ {action, fields+hash}      │
   │  auto-submit multipart POST to /api/payment-gateway/v1/payments/purchase
   ├────────────────────────────────────────────────────>│ hosted checkout page
   │                        │      JSON pushback {tran_id, apv, status}
   │                        │<───────── signed X-PayWay-HMAC-SHA512 ─┤
   │                        │ verify → mark PAID → decrement stock
   │  redirect to /checkout/success?tran_id=…              │
   ├───────────────────────>│ poll /api/orders/status     │
   │                        │── Check Transaction API ──>│ (authoritative)
   │<── order confirmed ────┤                            │
```

Key implementation files:

- [`src/lib/payway.ts`](./src/lib/payway.ts) — request signing, pushback verification, Check Transaction client
- [`src/lib/checkout-server.ts`](./src/lib/checkout-server.ts) — server-side price/stock validation, order creation, payment start
- [`src/lib/orders.ts`](./src/lib/orders.ts) — idempotent `markOrderPaid` + status sync
- [`src/app/api/payway/webhook/route.ts`](./src/app/api/payway/webhook/route.ts) — pushback receiver
- [`src/app/api/checkout/route.ts`](./src/app/api/checkout/route.ts) — checkout entry point

**Currency:** prices are stored and charged in USD (PayWay settles USD; KHR display uses `NEXT_PUBLIC_KHR_RATE`). If you switch transactions to KHR, amounts must be integers ≥ 100 KHR per PayWay rules.

**Idempotency & stock:** webhook + polling both call `markOrderPaid`, which is a no-op if the order is already PAID. Stock decrements inside a Prisma transaction; a shortfall after payment is logged for manual follow-up in `/admin`.

---

## PayWay onboarding (human checklist)

To accept **real** payments you need a merchant account — code alone can't do this part:

1. **Register a business** and open a corporate account with ABA Bank (or your Cambodian bank).
2. **Apply for PayWay e-commerce**: email <paywaysales@ababank.com>. Documents typically requested: business registration (MoC), patent/tax certificate, website URL, product listings, delivery & returns policy, ID of the legal representative.
3. You receive **Merchant ID + API Key** and access to the merchant portal.
4. **Whitelist your domains** in the merchant portal (site domain, `PAYWAY_RETURN_URL`, `PAYWAY_SUCCESS_URL`, `PAYWAY_CANCEL_URL`) — otherwise PayWay returns *"Requested domain is not in whitelist"* / error 81.
5. **Sandbox first**: set `PAYWAY_BASE_URL=https://checkout-sandbox.payway.com.kh`, register at the sandbox portal, and test ABA PAY, KHQR and card flows end-to-end.
6. **Switch to production**: `PAYWAY_BASE_URL=https://checkout.payway.com.kh` + production credentials, and verify one real transaction before opening traffic.
7. PayWay requires a **live website with visible products and policies** before production approval — deploy first, then apply if your registration isn't done yet.

---

## Deployment (Vercel + Neon)

1. **Database** — create a project on [Neon](https://neon.tech) (or Supabase), copy the pooled connection string.
2. **Push code** to GitHub, import the repo in Vercel.
3. **Environment variables** — add everything from [.env.example](./.env.example) with production values:
   - `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` = `https://yourdomain.com`
   - `PAYWAY_RETURN_URL=https://yourdomain.com/api/payway/webhook`
   - `PAYWAY_SUCCESS_URL=https://yourdomain.com/checkout/success`
   - `PAYWAY_CANCEL_URL=https://yourdomain.com/checkout?canceled=1`
   - `PAYWAY_DEMO_MODE` — **omit** (production disables demo payments automatically)
4. **Run migrations** from your machine against the production DB:

   ```bash
   DATABASE_URL="<prod-url>" npm run db:deploy   # prisma migrate deploy
   DATABASE_URL="<prod-url>" npm run db:seed     # optional demo catalogue
   ```

5. **Deploy.** All DB-backed routes are dynamic; the build does not need a live database.
6. **Product images**: the seed uses local `/public/products/*.svg` placeholders. For production, upload real photography (1200×1500, 4:5) to Cloudinary or Vercel Blob and paste the URLs in `/admin/products`.

---

## Going live checklist

- [ ] Postgres provisioned, migrations deployed, seed data replaced with real products
- [ ] `NEXTAUTH_SECRET` regenerated (`openssl rand -base64 32`)
- [ ] Admin password changed (create a real admin via `/register`, then promote with SQL: `UPDATE "User" SET role='ADMIN' WHERE email='…';`)
- [ ] PayWay merchant approved, domains whitelisted, sandbox tested, production keys set
- [ ] `VAT_RATE` set to match your registered business status
- [ ] Khmer copy proofread by a native speaker (UI strings live in `src/lib/i18n/km.ts`, page content in `src/lib/content-pages.ts`)
- [ ] Facebook / TikTok links updated in `src/components/footer.tsx`
- [ ] Real product photography uploaded (4:5 ratio), OG image reviewed
- [ ] Resend domain verified if you want order-confirmation emails
- [ ] Test a real $1 transaction end-to-end, including webhook + refund handling

---

## Architecture notes

- **Custom lightweight commerce layer** (no Shopify/Medusa) — required for Cambodia-specific payment integration. Entities: `User`, `Address`, `Product`, `Variant`, `Order`, `OrderItem`, `Payment`, `Review`, `NewsletterSubscriber` (see [`prisma/schema.prisma`](./prisma/schema.prisma)).
- **Server-side price validation** — the client cart is display-only; `/api/checkout` recomputes every line from the DB. Client-sent prices are never trusted.
- **i18n** — cookie-based locale (`aurelia-locale`), no route restructuring: English primary URLs, Khmer toggle refreshes server components. Dictionaries are type-checked (`en.ts` is the shape; `km.ts` must match). Swap to route-based locales later if per-locale SEO URLs become necessary.
- **Design system** — glass (`rgba(255,255,255,.12)`, blur 14px, 1px light border, 18px radius) is used **only as a frame**: nav, hero card, modals, accents. Product pages, prices, totals and checkout are solid/high-contrast per spec. `backdrop-filter` layers are limited (≤3 per view) for mid-range Android performance.
- **Fonts** — Cormorant Garamond (headings), Inter (UI), Kantumruy Pro (Khmer), self-hosted by `next/font` with automatic Khmer glyph fallback.
- **Shipping** — configurable per-province rates in [`src/lib/shipping.ts`](./src/lib/shipping.ts) (Phnom Penh $2 → remote provinces $5, free ≥ $50). Courier partners (J&T Express, Cambodia Post, local) are operational, not in-code.
- **Webhook security** — signature is mandatory (401 otherwise), timing-safe comparison, unknown `tran_id` is acked to stop retry storms but logged loudly.
- **Known limitation** — `next build` compiles without a database, but all commerce routes need one at runtime (by design). The home page degrades gracefully if the DB is briefly unavailable.

---

## Project structure

```
├── prisma/
│   ├── schema.prisma               # data model (PostgreSQL)
│   ├── migrations/…/migration.sql  # initial migration (apply with db:deploy)
│   └── seed.ts                     # catalogue, users, demo order
├── public/products/                # 12 placeholder SVGs (4:5)
├── scripts/
│   ├── make-placeholders.cjs       # regenerates the placeholder art
│   └── test-payway.ts              # PayWay signing/verification sanity check
└── src/
    ├── middleware.ts               # /admin (ADMIN) + /account (auth) gating
    ├── app/
    │   ├── page.tsx                # home
    │   ├── shop · skincare · fragrance · product/[slug]
    │   ├── checkout · checkout/success
    │   ├── login · register · account (+ actions.ts server actions)
    │   ├── admin/                  # overview · products · orders · customers (+ actions.ts)
    │   ├── about · contact · faq · shipping-returns · privacy · terms
    │   ├── api/
    │   │   ├── auth/[...nextauth] · auth/register
    │   │   ├── checkout · checkout/retry
    │   │   ├── payway/webhook      # signed JSON pushback receiver
    │   │   ├── orders/status       # Check Transaction polling
    │   │   └── newsletter · contact · reviews
    │   ├── sitemap.ts · robots.ts · opengraph-image.tsx · not-found.tsx
    ├── components/                 # nav, cart drawer, checkout form, admin forms, …
    └── lib/
        ├── payway.ts               # signing, pushback verify, check-transaction
        ├── checkout-server.ts      # server-side checkout pipeline
        ├── orders.ts               # idempotent payment confirmation
        ├── db.ts · auth.ts · currency.ts · shipping.ts · email.ts · products.ts
        └── i18n/                   # en.ts · km.ts · index.ts · server.ts
```

---

*Built for the Cambodian market — Phnom Penh, Cambodia.* 🇰🇭
