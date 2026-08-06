# Rani's Cook House — E-commerce Website

A full production-ready e-commerce site for **Rani's Cook House** (Nagercoil, Tamil Nadu) —
homemade pickles, dry fish powder, avalose podi, sangu sathai and dry fruits & nuts,
under the tagline "Mom's Secret Taste".

Built with **Next.js 15 (App Router, plain JavaScript)**, **MongoDB (Mongoose)**, and
**Cloudinary** for images, with a full admin panel.

## What's included

**Storefront**
- Home page with hero, category grid, banners, featured products, trust strip
- Product listing with category filter
- Product detail page with add-to-cart / buy now
- Cart (persisted in the browser) and checkout with state-wise shipping
- Order confirmation + public order tracking page (no login required)

**Admin panel** (`/admin`, protected by login)
- Dashboard: today/weekly/monthly sales, pending orders, 14-day sales chart, top sellers, low stock alerts
- Products: list, search, add, edit, delete, multi-image upload via Cloudinary
- Categories: add/edit/delete with image
- Banners: add/edit/delete, active/inactive toggle
- Orders: list with status filters and search, detail view with status updates (Pending → Confirmed → Packed → Shipped → Delivered / Cancelled)
- Inventory: stock levels, low-stock / out-of-stock filters, inline stock updates
- Settings: store info, default + state-wise shipping fees, free shipping threshold, socials, SEO fields, maintenance mode toggle

## 1. Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- A free [Cloudinary](https://cloudinary.com/users/register/free) account
- A [Vercel](https://vercel.com) account (for deployment)

## 2. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Atlas → Connect → Drivers → copy connection string, add a database name e.g. `/ranis-cook-house` before the `?` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary Dashboard home page |
| `JWT_SECRET` | Any long random string (e.g. run `openssl rand -base64 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The login you want for the admin panel — used only when you run the seed script |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local dev, your live URL after deploying |

Seed the database with your admin account, categories, all starter products, banners and default settings:

```bash
npm run seed
```

This prints your admin login. **Product images are not uploaded by the seed script** — after seeding,
log into `/admin/products`, edit each product, and upload photos (they'll go straight to Cloudinary).

Run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin panel.

## 3. Deploying to Vercel

1. Push this project to a GitHub repo (or use `vercel` CLI directly from this folder).
2. Import the repo in Vercel → New Project.
3. Add the same environment variables from `.env.local` in Vercel → Project Settings → Environment Variables.
4. Deploy. After the first deploy, update `NEXT_PUBLIC_SITE_URL` to your real Vercel URL and redeploy.
5. Run `npm run seed` **once**, locally, pointed at your production `MONGODB_URI`, to create your admin account and starter catalog.

## 4. Project structure

```
app/                    Public pages + admin pages + API routes (App Router)
  admin/                Admin panel pages (protected by middleware.js)
  api/                  REST API routes (products, categories, banners, orders, settings, upload, admin auth)
  products/, cart/, checkout/, track-order/   Public storefront pages
components/             Shared UI (Header, Footer, ProductCard, cart panel)
components/admin/       Admin-only UI (sidebar, forms, image uploader, dashboard chart)
lib/                    Mongo connection, Cloudinary helpers, JWT auth, cart store, slugify
models/                 Mongoose schemas (Product, Category, Banner, Order, Settings, Admin)
scripts/seed.js         One-time database seed script
middleware.js           Edge auth guard for /admin/*
```

## 5. Starting product catalog

The seed script creates these products under four categories — edit prices, weights, and
descriptions any time from **Admin → Products**:

**Pickles**: Mango Pickle, Lime Pickle, Garlic Pickle, Prawn Pickle

**Dry Fish Powder**: Dry Fish Powder (Nethili/Anchovy), Mixed Dry Fish Powder

**Powders & Masala**: Avalose Podi (Fried Rice Powder), Sangu Sathai (Conch Meat)

**Dry Fruits & Nuts**: Mixed Dry Fruits & Nuts, Cashew Nuts, Almonds, Raisins

Add, remove, or reprice any product from the admin panel — the seed script only needs to be run once.

## 6. Support

Store contact used throughout the site (edit anytime in Admin → Settings):
- Email: ranipickles13@gmail.com
- Phone / WhatsApp: 7418058533
- Location: Nagercoil, Tamil Nadu
