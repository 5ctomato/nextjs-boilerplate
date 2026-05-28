# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal, public Next.js 15 boilerplate with Tailwind v4, shadcn/ui, Auth.js v5 Google OAuth, Prisma, and Neon — ready to clone and use in under 15 minutes.

**Architecture:** Flat App Router structure. Auth.js v5 handles Google OAuth with a Prisma adapter persisting sessions to Neon (serverless PostgreSQL). All auth/db config lives in `lib/auth.ts` and `lib/db.ts`. Auth pages live under `app/(auth)/` (route group, no URL prefix).

**Tech Stack:** Next.js 15 · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Auth.js v5 (next-auth@beta) · @auth/prisma-adapter · Prisma · Neon · pnpm

---

## File Map

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config (strict mode) |
| `next.config.ts` | Next.js config |
| `prisma/schema.prisma` | Auth.js adapter tables: User, Account, Session, VerificationToken |
| `lib/db.ts` | Prisma client singleton (dev hot-reload safe) |
| `lib/auth.ts` | Auth.js config — Google provider, Prisma adapter, custom page paths |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js GET/POST handlers |
| `middleware.ts` | Session propagation on every non-static route |
| `app/layout.tsx` | Root layout with SessionProvider |
| `app/page.tsx` | Home — shows session state, login/logout |
| `app/(auth)/login/page.tsx` | Google sign-in page |
| `app/(auth)/error/page.tsx` | Auth error display |
| `components/ui/button.tsx` | shadcn Button (added by CLI) |
| `components/ui/card.tsx` | shadcn Card (added by CLI) |
| `.env.example` | Required environment variables with comments |
| `README.md` | Step-by-step setup guide |

---

### Task 1: Initialize Next.js 15 project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, and other scaffolded files

- [ ] **Step 1: Run create-next-app in the project directory**

```bash
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

If prompted "The directory contains files that could conflict", select **Yes** to continue.

- [ ] **Step 2: Verify TypeScript strict mode**

Open `tsconfig.json`. Confirm `"strict": true` exists under `compilerOptions`. If missing, add it:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

- [ ] **Step 3: Verify the dev server starts**

```bash
pnpm dev
```

Expected: server starts on `http://localhost:3000` with no errors. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 15 project"
```

---

### Task 2: Initialize shadcn/ui and add base components

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`, `components/ui/card.tsx`
- Modify: `app/globals.css` (adds CSS variables for theming)

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

- [ ] **Step 2: Add Button and Card components**

```bash
pnpm dlx shadcn@latest add button card
```

Expected: creates `components/ui/button.tsx` and `components/ui/card.tsx`.

- [ ] **Step 3: Verify components exist**

```bash
ls components/ui/
```

Expected: `button.tsx  card.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui with Button and Card"
```

---

### Task 3: Install Prisma and configure Auth.js schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Install Prisma**

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

- [ ] **Step 2: Initialize Prisma**

```bash
pnpm prisma init --datasource-provider postgresql
```

Expected: creates `prisma/schema.prisma` and adds `DATABASE_URL` placeholder to `.env`.

- [ ] **Step 3: Replace prisma/schema.prisma with Auth.js adapter schema**

Overwrite `prisma/schema.prisma` entirely:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Prisma schema with Auth.js adapter tables"
```

---

### Task 4: Create Prisma client singleton

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Generate Prisma client types**

```bash
pnpm prisma generate
```

Expected: "Generated Prisma Client (vX.X.X) to ./node_modules/@prisma/client"

- [ ] **Step 2: Create lib/db.ts**

```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
```

- [ ] **Step 3: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add Prisma client singleton"
```

---

### Task 5: Install and configure Auth.js v5

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Install Auth.js and Prisma adapter**

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Create lib/auth.ts**

```ts
// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/error",
  },
})
```

- [ ] **Step 3: Create API route handler**

Create directory `app/api/auth/[...nextauth]/` and file `route.ts`:

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 4: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts app/api/
git commit -m "feat: configure Auth.js v5 with Google provider and Prisma adapter"
```

---

### Task 6: Create middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware.ts**

```ts
// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

This propagates the Auth.js session token on every non-static route. To protect specific routes, replace with a custom handler (see README for example).

- [ ] **Step 2: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Auth.js session middleware"
```

---

### Task 7: Create auth pages

**Files:**
- Create: `app/(auth)/login/page.tsx`, `app/(auth)/error/page.tsx`

- [ ] **Step 1: Create login page**

Create `app/(auth)/login/page.tsx`:

```tsx
// app/(auth)/login/page.tsx
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <Button type="submit" className="w-full">
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create error page**

Create `app/(auth)/error/page.tsx`:

```tsx
// app/(auth)/error/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error ?? "An unexpected error occurred."}
          </p>
          <a href="/login" className="text-sm underline">
            Try again
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
```

Note: `searchParams` is a `Promise` in Next.js 15 — must be awaited.

- [ ] **Step 3: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/"
git commit -m "feat: add login and auth error pages"
```

---

### Task 8: Update root layout and home page

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js 15 · Tailwind · shadcn/ui · Auth.js · Prisma · Neon",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Replace app/page.tsx**

```tsx
// app/page.tsx
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {session ? (
        <>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user?.email}
          </p>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </>
      ) : (
        <a href="/login">
          <Button>Sign in with Google</Button>
        </a>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: update layout with SessionProvider and home page with auth state"
```

---

### Task 9: Create .env.example and README

**Files:**
- Create: `.env.example`, `README.md`

- [ ] **Step 1: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Database — Neon serverless PostgreSQL
# Get your pooled connection string from https://console.neon.tech
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Auth.js secret — generate with: openssl rand -base64 32
AUTH_SECRET=

# Google OAuth — create credentials at https://console.cloud.google.com
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
```

- [ ] **Step 2: Create README.md**

```markdown
# next.js boilerplate

Minimal Next.js 15 starter. Clone, configure env, and you're building.

**Stack:** Next.js 15 App Router · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Auth.js v5 · Prisma · Neon

---

## Quick Start

### 1. Clone and install

\`\`\`bash
git clone <repo-url> my-app
cd my-app
pnpm install
\`\`\`

### 2. Set up Neon database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **pooled connection string** from the dashboard

### 3. Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials**
3. **Create Credentials → OAuth 2.0 Client ID** → Web application
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 4. Configure environment

\`\`\`bash
cp .env.example .env
\`\`\`

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Neon dashboard → Connection string (pooled) |
| `AUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |

### 5. Push database schema

\`\`\`bash
pnpm prisma db push
\`\`\`

### 6. Start dev server

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) — click **Sign in with Google**.

---

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx              # Root layout (SessionProvider)
│   ├── page.tsx                # Home — shows auth state
│   └── (auth)/
│       ├── login/page.tsx      # Google sign-in
│       └── error/page.tsx      # Auth error display
├── components/ui/              # shadcn/ui components
├── lib/
│   ├── auth.ts                 # Auth.js config (Google + Prisma adapter)
│   └── db.ts                   # Prisma singleton
├── prisma/schema.prisma        # DB schema (Auth.js tables)
└── middleware.ts               # Session propagation
\`\`\`

---

## Protecting Routes

Edit `middleware.ts` to redirect unauthenticated users:

\`\`\`ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
\`\`\`

## Adding shadcn Components

\`\`\`bash
pnpm dlx shadcn@latest add <component-name>
\`\`\`

## Deploying to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com)
2. Add all four env vars in the Vercel dashboard
3. Update Google OAuth redirect URI to `https://your-domain.com/api/auth/callback/google`
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add .env.example and README setup guide"
```

---

### Task 10: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Type check**

```bash
pnpm tsc --noEmit
```

Expected: exits with code 0, no errors

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: no errors or warnings

- [ ] **Step 3: Push schema to Neon**

Ensure `.env` is filled with real values, then:

```bash
pnpm prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 4: Smoke test the full auth flow**

```bash
pnpm dev
```

Verify:
1. `http://localhost:3000` → shows "Sign in with Google" button
2. Click button → navigates to `/login`
3. Click "Continue with Google" → Google OAuth consent screen
4. Complete sign-in → redirected to `/` showing "Signed in as [your email]"
5. Click "Sign out" → session cleared, "Sign in with Google" button returns

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: boilerplate complete"
```
