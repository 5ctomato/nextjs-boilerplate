# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a team-shared Next.js boilerplate with Tailwind, shadcn/ui, NextAuth v5 (Google OAuth), and Prisma + Neon PostgreSQL.

**Architecture:** Minimal flat structure using App Router. Auth handled by NextAuth v5 with Prisma Adapter storing sessions in Neon PostgreSQL. Route protection via Next.js middleware.

**Tech Stack:** Next.js 14+, pnpm, Tailwind CSS, shadcn/ui, NextAuth v5, Prisma, Neon (PostgreSQL)

---

## File Map

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | NextAuth DB models (User, Account, Session, VerificationToken) |
| `src/lib/db.ts` | Prisma Client singleton |
| `src/lib/auth.ts` | NextAuth v5 config (Google provider + Prisma adapter) |
| `src/lib/utils.ts` | shadcn utility (cn) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |
| `src/app/layout.tsx` | Root layout with SessionProvider |
| `src/app/page.tsx` | Home page (auth-aware UI) |
| `src/app/sign-in/page.tsx` | Sign-in page with Google button |
| `src/components/ui/` | shadcn components |
| `middleware.ts` | Route protection |
| `.env.example` | Required env vars reference |

---

### Task 1: Scaffold Next.js App

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
When prompted to confirm current directory — yes. Expected: Next.js project scaffolded in current directory.

- [ ] **Step 2: Verify dev server starts**

```bash
pnpm dev
```
Open http://localhost:3000 — default Next.js page should render. Stop server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js app with TypeScript and Tailwind"
```

---

### Task 2: Install and Configure shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `avatar.tsx`, `dropdown-menu.tsx`

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init -d
```
`-d` uses defaults (New York style, Zinc base color, CSS variables on).

- [ ] **Step 2: Add required components**

```bash
pnpm dlx shadcn@latest add button card input avatar dropdown-menu
```

- [ ] **Step 3: Verify components exist**

```bash
ls src/components/ui/
```
Expected output includes: `button.tsx  card.tsx  input.tsx  avatar.tsx  dropdown-menu.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui with base components"
```

---

### Task 3: Set Up Prisma + Neon

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `.env.example`, `.env.local`

- [ ] **Step 1: Install Prisma**

```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

- [ ] **Step 2: Replace prisma/schema.prisma**

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
}

model Account {
  id                String  @id @default(cuid())
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
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Create .env.local**

Create `.env.local` in project root (fill in your actual Neon connection string):

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET="run: pnpm dlx auth secret"
AUTH_GOOGLE_ID="from Google Cloud Console"
AUTH_GOOGLE_SECRET="from Google Cloud Console"
```

- [ ] **Step 5: Verify .env.local is gitignored**

Check `.gitignore` contains `.env.local`. If missing, add it.

- [ ] **Step 6: Create src/lib/db.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 7: Push schema to Neon**

```bash
pnpm prisma db push
```
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 8: Generate Prisma client**

```bash
pnpm prisma generate
```

- [ ] **Step 9: Commit**

```bash
git add prisma/ src/lib/db.ts .env.example
git commit -m "chore: add Prisma schema and Neon DB connection"
```

---

### Task 4: Configure NextAuth v5

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Install NextAuth v5 and Prisma adapter**

```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Generate AUTH_SECRET**

```bash
pnpm dlx auth secret
```
Copy the printed value into `.env.local` as `AUTH_SECRET`.

- [ ] **Step 3: Set up Google OAuth credentials**

1. Go to https://console.cloud.google.com
2. Create or select a project
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID → `AUTH_GOOGLE_ID` in `.env.local`
7. Copy Client Secret → `AUTH_GOOGLE_SECRET` in `.env.local`

- [ ] **Step 4: Create src/lib/auth.ts**

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
});
```

- [ ] **Step 5: Create src/app/api/auth/[...nextauth]/route.ts**

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/
git commit -m "feat: add NextAuth v5 with Google provider and Prisma adapter"
```

---

### Task 5: Middleware

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create middleware.ts**

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in).*)"],
};
```
This redirects unauthenticated users to `/sign-in` for all routes except the auth API, static assets, and sign-in page itself.

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

### Task 6: Sign-In Page

**Files:**
- Create: `src/app/sign-in/page.tsx`

- [ ] **Step 1: Create src/app/sign-in/page.tsx**

```typescript
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button type="submit" className="w-full">
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/sign-in/
git commit -m "feat: add sign-in page with Google OAuth button"
```

---

### Task 7: Layout and Home Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace src/app/layout.tsx**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Team starter template",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace src/app/page.tsx**

```typescript
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Next.js Boilerplate</h1>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Welcome, {session.user.name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback>
                    {session.user.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button type="submit" className="w-full text-left">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <p className="text-gray-500">Not signed in</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: update layout with SessionProvider and auth-aware home page"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test unauthenticated redirect**

Open http://localhost:3000 — should redirect to `/sign-in`.

- [ ] **Step 3: Test Google login**

Click "Sign in with Google", complete OAuth flow — should redirect to home page showing user avatar and welcome message.

- [ ] **Step 4: Test sign-out**

Click avatar → "Sign out" — should redirect back to `/sign-in`.

- [ ] **Step 5: Verify DB records**

```bash
pnpm prisma studio
```
Open http://localhost:5555 — check that `User`, `Account`, `Session` tables have records.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: finalize boilerplate setup"
```
