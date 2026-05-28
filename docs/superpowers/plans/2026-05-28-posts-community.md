# Posts Community Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple public `/posts` community board with authenticated post/comment creation on top of the existing NextAuth + Prisma + Neon stack.

**Architecture:** Extend the existing Prisma schema with `Post` and `Comment`, then implement server-rendered App Router pages for listing, creating, and reading posts. Reads should stay in server components, while writes should use server actions guarded by `auth()` and backed by the existing shared Prisma client.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 5, NextAuth v5, Neon PostgreSQL, shadcn/base-ui components, Tailwind CSS

---

## File Structure

### Create

- `app/posts/page.tsx`
- `app/posts/new/page.tsx`
- `app/posts/[id]/page.tsx`
- `components/posts/post-list.tsx`
- `components/posts/post-form.tsx`
- `components/posts/comment-form.tsx`
- `lib/posts.ts`

### Modify

- `prisma/schema.prisma`
- `app/page.tsx`

### Existing references

- `lib/auth.ts`
- `lib/db.ts`

The feature should keep data access in `lib/posts.ts`, route rendering in `app/posts/*`, and reusable presentational form pieces in `components/posts/*`. This keeps each file small and avoids pushing data logic into UI components.

## Task 1: Extend Prisma Schema For Posts And Comments

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `posts` and `comments` relations to `User`**

Update the `User` model in `prisma/schema.prisma` to include the new relations:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

- [ ] **Step 2: Add `Post` and `Comment` models**

Append these models to `prisma/schema.prisma`:

```prisma
model Post {
  id        String    @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([createdAt])
  @@index([authorId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId, createdAt])
  @@index([authorId])
}
```

- [ ] **Step 3: Validate the Prisma schema**

Run:

```bash
pnpm prisma validate
```

Expected: output includes `The schema at prisma/schema.prisma is valid`

- [ ] **Step 4: Generate the Prisma client**

Run:

```bash
pnpm prisma generate
```

Expected: output includes `Generated Prisma Client`

- [ ] **Step 5: Push the schema to Neon**

Run:

```bash
pnpm prisma db push
```

Expected: output includes `Your database is now in sync with your Prisma schema`

- [ ] **Step 6: Commit the schema work**

Run:

```bash
git add prisma/schema.prisma
git commit -m "Add posts and comments schema"
```

## Task 2: Add Shared Posts Data Access And Mutations

**Files:**
- Create: `lib/posts.ts`

- [ ] **Step 1: Create shared query helpers for post reads**

Create `lib/posts.ts` with the shared select helpers and list/detail queries:

```ts
import { db } from "@/lib/db"

export const postListInclude = {
  author: {
    select: {
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} as const

export const postDetailInclude = {
  author: {
    select: {
      name: true,
      email: true,
    },
  },
  comments: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
} as const

export async function getPosts() {
  return db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: postListInclude,
  })
}

export async function getPostById(id: string) {
  return db.post.findUnique({
    where: { id },
    include: postDetailInclude,
  })
}
```

- [ ] **Step 2: Add shared validation helpers for writes**

Append simple validation helpers to `lib/posts.ts`:

```ts
export function validatePostInput(title: string, content: string) {
  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()

  if (!trimmedTitle) {
    return { ok: false as const, message: "Title is required." }
  }

  if (!trimmedContent) {
    return { ok: false as const, message: "Content is required." }
  }

  if (trimmedTitle.length > 100) {
    return { ok: false as const, message: "Title must be 100 characters or less." }
  }

  if (trimmedContent.length > 10_000) {
    return { ok: false as const, message: "Content must be 10000 characters or less." }
  }

  return {
    ok: true as const,
    value: {
      title: trimmedTitle,
      content: trimmedContent,
    },
  }
}

export function validateCommentInput(content: string) {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    return { ok: false as const, message: "Comment is required." }
  }

  if (trimmedContent.length > 3_000) {
    return { ok: false as const, message: "Comment must be 3000 characters or less." }
  }

  return {
    ok: true as const,
    value: {
      content: trimmedContent,
    },
  }
}
```

- [ ] **Step 3: Verify TypeScript still understands the new Prisma models**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: no `Property 'post' does not exist on type 'PrismaClient'` or similar model errors

- [ ] **Step 4: Commit the shared posts helpers**

Run:

```bash
git add lib/posts.ts
git commit -m "Add shared posts data helpers"
```

## Task 3: Build The Posts List Page

**Files:**
- Create: `components/posts/post-list.tsx`
- Create: `app/posts/page.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the reusable post list presenter**

Create `components/posts/post-list.tsx`:

```tsx
import Link from "next/link"

type PostListItem = {
  id: string
  title: string
  createdAt: Date
  author: {
    name: string | null
    email: string
  }
  _count: {
    comments: number
  }
}

function formatAuthorLabel(author: PostListItem["author"]) {
  return author.name?.trim() || author.email
}

export function PostList({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No posts yet. Be the first to start the conversation.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/40"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
            <p className="text-sm text-muted-foreground">
              {formatAuthorLabel(post.author)} · {post.createdAt.toLocaleDateString()} · {post._count.comments} comments
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the `/posts` page**

Create `app/posts/page.tsx`:

```tsx
import Link from "next/link"

import { PostList } from "@/components/posts/post-list"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { getPosts } from "@/lib/posts"

export default async function PostsPage() {
  const [session, posts] = await Promise.all([auth(), getPosts()])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Community</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Posts</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Read what people are building, thinking about, and discussing.
          </p>
        </div>
        <Link href={session ? "/posts/new" : "/login"}>
          <Button>Write a post</Button>
        </Link>
      </div>
      <PostList posts={posts} />
    </main>
  )
}
```

- [ ] **Step 3: Add an entry point from the home page**

Update `app/page.tsx` so signed-in and signed-out users can reach the board:

```tsx
import Link from "next/link"

import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Link href="/posts">
        <Button variant="outline">Browse posts</Button>
      </Link>
      {session ? (
        <>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user?.email}
          </p>
          <Link href="/posts/new">
            <Button>Write a post</Button>
          </Link>
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

- [ ] **Step 4: Verify the posts list route builds cleanly**

Run:

```bash
pnpm exec tsc --noEmit
pnpm run lint
```

Expected: both commands complete without errors

- [ ] **Step 5: Commit the posts list work**

Run:

```bash
git add app/page.tsx app/posts/page.tsx components/posts/post-list.tsx
git commit -m "Add posts list page"
```

## Task 4: Build The Authenticated Post Creation Flow

**Files:**
- Create: `components/posts/post-form.tsx`
- Create: `app/posts/new/page.tsx`

- [ ] **Step 1: Create the reusable post form**

Create `components/posts/post-form.tsx`:

```tsx
import { Button } from "@/components/ui/button"

type PostFormProps = {
  action: (formData: FormData) => Promise<void>
  error?: string
}

export function PostForm({ action, error }: PostFormProps) {
  return (
    <form action={action} className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          name="title"
          maxLength={100}
          required
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-0"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          maxLength={10000}
          required
          rows={10}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-0"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit">Publish post</Button>
        <a href="/posts" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Cancel
        </a>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create the `/posts/new` page with auth guard and server action**

Create `app/posts/new/page.tsx`:

```tsx
import { redirect } from "next/navigation"

import { PostForm } from "@/components/posts/post-form"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { validatePostInput } from "@/lib/posts"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  async function createPost(formData: FormData) {
    "use server"

    const session = await auth()

    if (!session?.user?.email) {
      redirect("/login")
    }

    const title = String(formData.get("title") ?? "")
    const content = String(formData.get("content") ?? "")
    const result = validatePostInput(title, content)

    if (!result.ok) {
      throw new Error(result.message)
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      throw new Error("Authenticated user record not found.")
    }

    const post = await db.post.create({
      data: {
        title: result.value.title,
        content: result.value.content,
        authorId: user.id,
      },
      select: {
        id: true,
      },
    })

    redirect(`/posts/${post.id}`)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Community</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Write a post</h1>
      </div>
      <PostForm action={createPost} />
    </main>
  )
}
```

- [ ] **Step 3: Manually verify the auth gate and post creation flow**

Run:

```bash
pnpm dev
```

Expected manual results:

- signed-out visit to `/posts/new` redirects to `/login`
- signed-in user can submit a title and content
- successful submit lands on `/posts/[id]`

- [ ] **Step 4: Run static checks again**

Run:

```bash
pnpm exec tsc --noEmit
pnpm run lint
```

Expected: both commands complete without errors

- [ ] **Step 5: Commit the post creation flow**

Run:

```bash
git add app/posts/new/page.tsx components/posts/post-form.tsx
git commit -m "Add post creation flow"
```

## Task 5: Build Post Detail And Comment Creation

**Files:**
- Create: `components/posts/comment-form.tsx`
- Create: `app/posts/[id]/page.tsx`

- [ ] **Step 1: Create the reusable comment form**

Create `components/posts/comment-form.tsx`:

```tsx
import { Button } from "@/components/ui/button"

type CommentFormProps = {
  action: (formData: FormData) => Promise<void>
}

export function CommentForm({ action }: CommentFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Leave a comment
        </label>
        <textarea
          id="content"
          name="content"
          maxLength={3000}
          required
          rows={5}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-0"
        />
      </div>
      <Button type="submit">Post comment</Button>
    </form>
  )
}
```

- [ ] **Step 2: Create the post detail page**

Create `app/posts/[id]/page.tsx`:

```tsx
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { CommentForm } from "@/components/posts/comment-form"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPostById, validateCommentInput } from "@/lib/posts"

function formatAuthorLabel(author: { name: string | null; email: string }) {
  return author.name?.trim() || author.email
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, post] = await Promise.all([auth(), getPostById(id)])

  if (!post) {
    notFound()
  }

  async function createComment(formData: FormData) {
    "use server"

    const session = await auth()

    if (!session?.user?.email) {
      redirect("/login")
    }

    const result = validateCommentInput(String(formData.get("content") ?? ""))

    if (!result.ok) {
      throw new Error(result.message)
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    })

    if (!user) {
      throw new Error("Authenticated user record not found.")
    }

    await db.comment.create({
      data: {
        content: result.value.content,
        postId: post.id,
        authorId: user.id,
      },
    })

    redirect(`/posts/${post.id}`)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="space-y-3">
        <Link href="/posts" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Back to posts
        </Link>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {formatAuthorLabel(post.author)} · {post.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <article className="rounded-2xl border border-border bg-card p-6 text-sm leading-7 text-foreground whitespace-pre-wrap">
        {post.content}
      </article>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Comments</h2>
        <div className="space-y-3">
          {post.comments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No comments yet.
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  {formatAuthorLabel(comment.author)} · {comment.createdAt.toLocaleDateString()}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Join the conversation</h2>
        {session?.user?.email ? (
          <CommentForm action={createComment} />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Sign in to write a comment.
            </p>
            <div className="mt-4">
              <Link href="/login">
                <Button>Sign in with Google</Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Verify the detail and comment flow**

Run:

```bash
pnpm dev
```

Expected manual results:

- visiting `/posts/<valid-id>` shows the post and any comments
- visiting `/posts/<invalid-id>` shows the 404 page
- signed-in user can add a comment
- signed-out user sees the sign-in prompt instead of the comment form

- [ ] **Step 4: Run full static and production checks**

Run:

```bash
pnpm exec tsc --noEmit
pnpm run lint
pnpm run build
```

Expected: all three commands complete without errors

- [ ] **Step 5: Commit the detail/comment flow**

Run:

```bash
git add app/posts/[id]/page.tsx components/posts/comment-form.tsx
git commit -m "Add post detail and comments"
```

## Task 6: Final QA And Cleanup

**Files:**
- Review only: `app/posts/page.tsx`
- Review only: `app/posts/new/page.tsx`
- Review only: `app/posts/[id]/page.tsx`
- Review only: `components/posts/post-form.tsx`
- Review only: `components/posts/comment-form.tsx`
- Review only: `components/posts/post-list.tsx`
- Review only: `lib/posts.ts`
- Review only: `prisma/schema.prisma`

- [ ] **Step 1: Run the end-to-end manual checklist from the spec**

Verify all of the following manually:

```text
1. Unauthenticated user can open /posts
2. Unauthenticated user can open /posts/[id]
3. Unauthenticated user is redirected from /posts/new
4. Authenticated user can create a post
5. New post appears in /posts
6. Authenticated user can create a comment
7. New comment appears on the post detail page
8. Invalid post id returns a 404 page
```

Expected: each checklist item passes without requiring code changes

- [ ] **Step 2: Confirm the database rows in Neon**

Run:

```bash
pnpm prisma studio
```

Expected manual results:

- `Post` rows appear after publishing
- `Comment` rows appear after commenting
- `authorId` and `postId` relations are populated correctly

- [ ] **Step 3: Review for scope creep**

Check that the implementation still excludes:

```text
- editing and deleting
- nested replies
- likes or reactions
- categories
- uploads
- rich text
```

Expected: none of these appear in code or UI

- [ ] **Step 4: Create the final feature commit if any cleanup changed files**

Run:

```bash
git status --short
```

Expected: either a clean working tree or a short list of cleanup-only files to commit

- [ ] **Step 5: Push the feature branch or main branch**

Run:

```bash
git push
```

Expected: remote accepts the completed posts community implementation

## Self-Review

Spec coverage check:

- `/posts`, `/posts/new`, `/posts/[id]` routes are covered in Tasks 3, 4, and 5
- public reads and authenticated writes are covered in Tasks 3, 4, and 5
- `Post` and `Comment` schema changes are covered in Task 1
- validation rules are covered in Tasks 2, 4, and 5
- 404 and auth handling are covered in Task 5
- manual verification requirements are covered in Task 6

Placeholder scan:

- No `TBD`, `TODO`, or deferred implementation placeholders remain
- Every changed file has an explicit task assignment
- Every verification step has a concrete command or manual check

Type consistency check:

- Data model naming is consistent: `Post`, `Comment`, `authorId`, `postId`
- Shared helpers referenced by routes are defined in `lib/posts.ts`
- Route paths are consistent with the approved design
