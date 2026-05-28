# Next.js Boilerplate Design

**Date:** 2026-05-28  
**Purpose:** Team shared starter template

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Package Manager | pnpm |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js v5 (Auth.js) + Google OAuth |
| Database | PostgreSQL (Neon) + Prisma ORM |

## Folder Structure

```
nextjs-boilerplate/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── .env.example
└── ...config files
```

## Auth & DB

- `lib/auth.ts`: NextAuth v5 config with Google Provider and Prisma Adapter
- `lib/db.ts`: Prisma Client singleton (handles dev hot-reload)
- Prisma schema includes NextAuth required models: `User`, `Account`, `Session`, `VerificationToken`
- `.env.example` exposes: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

## Pages & Components

- `/sign-in` — Google login button
- `/` — Home page with auth-aware UI
- `middleware.ts` — Protects authenticated routes
- `layout.tsx` — Wraps app with `SessionProvider`
- shadcn components included: `Button`, `Card`, `Input`, `Avatar`, `DropdownMenu`
