# next.js boilerplate

Minimal Next.js starter. Clone, configure env, and you're building.

**Stack:** Next.js App Router · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Auth.js v5 · Prisma · Neon

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> my-app
cd my-app
pnpm install
```

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

```bash
cp .env.example .env
```

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Neon dashboard → Connection string (pooled) |
| `AUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |

### 5. Push database schema

```bash
pnpm prisma db push
```

### 6. Start dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — click **Sign in with Google**.

---

## Project Structure

```
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
└── proxy.ts                    # Session propagation (Next.js 16)
```

---

## Protecting Routes

Edit `proxy.ts` to redirect unauthenticated users:

```ts
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
```

## Adding shadcn Components

```bash
pnpm dlx shadcn@latest add <component-name>
```

## Deploying to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com)
2. Add all four env vars in the Vercel dashboard
3. Update Google OAuth redirect URI to `https://your-domain.com/api/auth/callback/google`
