# المحترف | AL MUHTARIF

متجر إلكتروني عراقي احترافي — [al-muhtarif.com](https://al-muhtarif.com)

Iraqi professional e-commerce store for **المحترف / AL MUHTARIF**.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Framer Motion
- PostgreSQL + Prisma
- NextAuth.js (Credentials) for Admin
- Zustand (cart / wishlist)

## Features

- Public store (RTL Arabic): home, shop, categories, product details, cart, checkout (COD)
- Admin panel: products, categories, orders, customers, inventory, coupons, CMS, settings, users
- WhatsApp integration, SEO (sitemap, robots, metadata), purple brand theme

## Official info

| Field | Value |
|-------|-------|
| Store | المحترف / AL MUHTARIF |
| Address | العراق – بابل – الحلة – شارع 40 |
| Email | info@al-muhtraif.com |
| Phone / WhatsApp | +964 7743571934 |
| Facebook | https://www.facebook.com/professionaltecnostore |
| Instagram | https://www.instagram.com/pro_40st |

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill:

```env
DATABASE_URL="postgresql://..."
DATABASE_URL_DIRECT="postgresql://..."
AUTH_SECRET="long-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

- Store: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

**Demo admin (change after first login):**  
- Email: `admin@al-muhtarif.com`  
- Password: `Admin@123456`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed demo data |

## Production

```bash
npm run build
npm run start
```

Deploy to Vercel / Node host. Set all env vars. Point domain `al-muhtarif.com` to the deployment.

Ensure `public/uploads` is writable (or switch storage to S3/Cloudinary later).

## Neon claimable DB

If you used a temporary Neon database during development, claim it within 72 hours via the `NEON_CLAIM_URL` in your local `.env` so it is not deleted.

## Security notes

- Never commit `.env`
- Change the default admin password immediately
- Rotate `AUTH_SECRET` in production
- Admin routes are protected by middleware + server-side session checks

## License

Private — AL MUHTARIF / المحترف
