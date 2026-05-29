# Black Needle — Premium Men's Apparel Store

<div align="center">

**A full-stack, production-grade e-commerce web application for a premium men's shirt brand.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Overview

**Black Needle** is a premium men's apparel e-commerce store built to deliver a luxurious, editorial shopping experience. The store focuses on meticulously tailored shirts with live inventory management, a passwordless phone-based checkout flow, and a complete admin back-office.

### Key Highlights

- 🛍️ **Storefront** — Elegant product catalogue with color-specific listings, size selector, and live stock indicators
- 🔐 **Passwordless Auth** — Customers log in via SMS OTP — no passwords, no friction
- 🛒 **Cart & Checkout** — Persistent cart context, delivery address collection, and instant order creation
- 📦 **Order Tracking** — Customers can view their order status and tracking number post-purchase
- 🧑‍💼 **Admin Dashboard** — Full back-office for products, inventory, orders, and customers
- 📱 **Fully Responsive** — Optimised for every screen from mobile to widescreen desktop

---

## 🖼️ Screenshots

| Storefront Hero | Description | Checkout |
|---|---|---|
| ![Hero](./public/images/hero.png) | ![Catalogue](./public/images/display.png) | ![Casual](./public/images/check.png) |

---

## 🗂️ Project Structure


```
black-needle/
├── public/
│   └── images/               # Static product & editorial images
├── src/
│   ├── app/
│   │   ├── admin/            # Admin dashboard (products, orders, inventory, customers)
│   │   │   ├── (dashboard)/  # Protected admin layout & pages
│   │   │   ├── components/   # Admin-specific UI components
│   │   │   └── login/        # Admin login page
│   │   ├── api/
│   │   │   ├── admin/        # REST API routes for admin operations
│   │   │   ├── checkout/     # Order creation endpoint
│   │   │   ├── send-otp/     # SMS OTP dispatch
│   │   │   └── verify-otp/   # OTP verification & session
│   │   ├── checkout/         # Customer checkout page
│   │   ├── components/       # Shared storefront components (Navbar, ProductGrid, etc.)
│   │   ├── context/          # React context (CartContext)
│   │   ├── order-success/    # Post-purchase confirmation page
│   │   ├── globals.css       # Global styles & Tailwind configuration
│   │   ├── layout.tsx        # Root app layout
│   │   └── page.tsx          # Homepage (hero, new drops, fabric section)
│   ├── db/
│   │   ├── index.ts          # Drizzle database connection
│   │   ├── schema.ts         # Full database schema (tables, enums, indexes)
│   │   └── seed.ts           # Database seeder with sample products & variants
│   ├── lib/
│   │   └── admin-auth.ts     # Admin session verification helpers
│   └── utils/supabase/       # Supabase client helpers (client, server, middleware)
├── drizzle/                  # Auto-generated SQL migrations
├── drizzle.config.ts         # Drizzle Kit configuration
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) — App Router, Server Components, API Routes |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 — dark editorial design system |
| **Database** | [Supabase](https://supabase.com/) — hosted PostgreSQL |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) — type-safe queries & migrations |
| **Auth** | Supabase SSR + custom SMS OTP (passwordless) |
| **State** | React Context API (cart) |
| **Deployment** | Vercel (recommended) |

---

## 🗄️ Database Schema

```
users          → id, name, phone_number (unique), role (customer|admin)
products       → id, name, color, slug (unique), price, type, fabric_details, is_active
product_variants → id, product_id (FK), sku, size, stock, size_measurements (JSONB), images (JSONB)
orders         → id, user_id (FK), status, payment_status, total_amount, shipping_address (JSONB)
order_items    → id, order_id (FK), variant_id (FK), quantity, price_at_purchase
```

Each **product** entry represents one **colour variant** of a shirt (e.g., "Classic Oxford - Midnight Black" is a separate row from "Classic Oxford - Arctic White"). Each product then has **size variants** with individual stock levels and measurements.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com/) project (free tier works)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Tahmid690/black-needle.git
cd black-needle
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Direct Postgres connection string (for Drizzle ORM)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Admin dashboard credentials
ADMIN_PASSWORD=your-secure-admin-password

# SMS OTP provider (e.g., Twilio, etc.) — configure in /src/app/api/send-otp
# OTP_API_KEY=...
```

### 4. Push the database schema

```bash
npx drizzle-kit push
```

### 5. Seed with sample products *(optional)*

```bash
npm run seed
```

This inserts 3 sample products (Classic Oxford in Midnight Black & Arctic White, Premium Linen in Sahara Sand) with 4 size variants each.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

The admin dashboard is available at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🧑‍💼 Admin Dashboard

The admin panel (`/admin`) provides full control over the store:

| Section | Features |
|---|---|
| **Products** | Create, edit, delete products & variants. Toggle active/draft status. Upload variant images. |
| **Inventory** | Adjust stock levels per size variant in real-time. |
| **Orders** | View all orders, update fulfilment status, add tracking numbers, toggle payment status. |
| **Customers** | Browse registered customer accounts. |

Admin access is protected by a password set in `ADMIN_PASSWORD` (stored as an HTTP-only cookie session).

---

## 🔐 Customer Authentication

Customers authenticate **passwordlessly** using their phone number:

1. Enter phone number → receive a 6-digit SMS OTP
2. Verify OTP → session is created
3. Access order history and saved profiles

No email, no password — frictionless and secure.

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run seed` | Seed the database with sample data |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push schema changes to the database |
| `npx drizzle-kit studio` | Open Drizzle Studio (visual DB browser) |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your repo to GitHub (already done ✅)
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Set all environment variables from `.env.local` in the Vercel project settings
4. Deploy — Vercel handles the rest automatically

> **Note:** Make sure `DATABASE_URL` uses the **connection pooler** URL from Supabase for production (port `6543` with `?pgbouncer=true`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <strong>Built with precision. Designed for perfection.</strong><br/>
  <em>— Black Needle Apparel</em>
</div>
