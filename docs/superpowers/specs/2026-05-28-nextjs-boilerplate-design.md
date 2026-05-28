# Next.js Boilerplate — Design Spec

**Date:** 2026-05-28
**Status:** Approved

## Overview

A minimal, opinionated Next.js boilerplate for public use. Bundles the most common production stack — Tailwind, shadcn/ui, Google OAuth, Prisma, Neon — so any project can skip boilerplate setup and start building features immediately.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Auth.js v5 (NextAuth) + Google OAuth |
| ORM | Prisma |
| Database | Neon (serverless Postgres) |
| Package manager | pnpm |

## Project Structure

```
nextjs-boilerplate/
├── app/
│   ├── layout.tsx           # Root layout with SessionProvider
│   ├── page.tsx             # Minimal home — shows login state + button
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx     # Google sign-in button
│       └── error/
│           └── page.tsx     # Auth error display
├── components/
│   └── ui/                  # shadcn/ui components (Button, Card)
├── lib/
│   ├── auth.ts              # Auth.js config: Google provider + Prisma adapter
│   └── db.ts                # Prisma client singleton (dev hot-reload safe)
├── prisma/
│   └── schema.prisma        # Auth.js required tables
├── middleware.ts             # Session handling via auth()
├── .env.example             # Required environment variables
└── README.md                # Step-by-step setup guide
```

## Auth + DB Architecture

Auth.js v5 is configured with:
- **Google OAuth provider** — handles sign-in flow
- **Prisma adapter** — persists sessions and accounts to Neon

`lib/auth.ts` exports `{ auth, handlers, signIn, signOut }` used across the app and middleware.

`lib/db.ts` exports a single `prisma` instance, guarded against multiple instantiation in development (Next.js hot reload).

### Prisma Schema

Four tables required by the Auth.js Prisma adapter:

- `User` — id, name, email, image
- `Account` — OAuth provider linkage (Google)
- `Session` — active session records
- `VerificationToken` — included for Auth.js schema compliance (unused at launch)

### Middleware

`middleware.ts` wraps `auth()` for session propagation. Route protection (e.g., redirect unauthenticated users) is left for the user to implement per project.

## Environment Variables

```env
DATABASE_URL=          # Neon connection string (pooled)
AUTH_SECRET=           # openssl rand -base64 32
GOOGLE_CLIENT_ID=      # Google Cloud Console
GOOGLE_CLIENT_SECRET=  # Google Cloud Console
```

## Included

- ESLint + Prettier with sensible defaults
- TypeScript strict mode
- shadcn/ui initialized (`components.json`, default theme, Button + Card)
- Tailwind CSS v4
- README with step-by-step: Neon setup → Google OAuth console → local dev → deploy

## Explicitly Excluded

- Husky / lint-staged (user's choice)
- Test setup (Jest, Playwright, etc.)
- Email, payments, file uploads
- CI/CD pipeline
- Dashboard or example feature pages

## Success Criteria

1. `git clone` → follow README → working Google login in under 15 minutes
2. Zero example/demo code that needs to be deleted before real development
3. Every included file has a clear, necessary purpose
