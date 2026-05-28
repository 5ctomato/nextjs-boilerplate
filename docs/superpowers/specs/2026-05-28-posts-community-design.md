# Posts Community Design

## Goal

Add a simple cafe-style community feature to the project with public reading and authenticated writing.

The first version should support:

- A `/posts` page that lists posts
- A `/posts/new` page for writing a post
- A `/posts/[id]` page for reading a post and its comments
- Authenticated users can create posts and comments
- Unauthenticated users can read posts and comments

The first version does not include editing, deleting, likes, categories, nested comments, or attachments.

## Product Scope

This feature should feel like a lightweight community board rather than a full forum.

User-facing behavior:

- Anyone can visit the posts list and post detail pages
- Only signed-in users can write posts
- Only signed-in users can write comments
- If an unauthenticated user tries to open `/posts/new`, redirect them to `/login`
- If an unauthenticated user views a post detail page, show comments but replace the comment form with a sign-in prompt

## Route Structure

Add the following routes:

- `app/posts/page.tsx`
- `app/posts/new/page.tsx`
- `app/posts/[id]/page.tsx`

Route responsibilities:

- `app/posts/page.tsx`: fetch all posts, sort newest first, render a simple list
- `app/posts/new/page.tsx`: render the post creation form for authenticated users
- `app/posts/[id]/page.tsx`: fetch a post by id, render the post body, render comments, render comment form for authenticated users

## Data Model

Extend the current Prisma schema with two new models.

### Post

- `id`: `String`, primary key, `cuid()`
- `title`: `String`
- `content`: `String`
- `authorId`: `String`
- `createdAt`: `DateTime`, default `now()`
- `updatedAt`: `DateTime`, `@updatedAt`

Relations:

- belongs to `User`
- has many `Comment`

### Comment

- `id`: `String`, primary key, `cuid()`
- `content`: `String`
- `postId`: `String`
- `authorId`: `String`
- `createdAt`: `DateTime`, default `now()`
- `updatedAt`: `DateTime`, `@updatedAt`

Relations:

- belongs to `Post`
- belongs to `User`

### User model updates

The existing `User` model should gain:

- `posts Post[]`
- `comments Comment[]`

## Server/Data Access Design

Use server components for reads and server actions for writes.

### Reads

- `app/posts/page.tsx` reads posts directly with Prisma
- `app/posts/[id]/page.tsx` reads the post and its comments directly with Prisma

Read queries should include the author relation so the UI can show a recognizable writer label such as name or email.

### Writes

Use server actions for:

- creating a post
- creating a comment

Server actions should:

- call `auth()` to verify the current user
- reject unauthenticated writes
- validate the submitted fields
- write through Prisma
- redirect after success

Recommended write flow:

- post create: save, then redirect to `/posts/[id]`
- comment create: save, then refresh the same detail page

## Validation Rules

Keep validation intentionally small and explicit.

### Post validation

- `title` is required
- `content` is required
- `title` max length: 100 characters
- `content` max length: 10000 characters

### Comment validation

- `content` is required
- `content` max length: 3000 characters

Validation failures should surface simple inline messages near the form.

## UI Design

Follow the current minimal design language already in the app.

### Posts list

The `/posts` page should include:

- page title
- button to create a post
- list of posts with title, author label, created date, and comment count

If the user is not signed in, the create button can still be visible but should lead them through the login flow before writing.

### New post page

The `/posts/new` page should include:

- title input
- content textarea
- submit button
- cancel link back to `/posts`

The layout should stay compact and readable rather than trying to mimic a heavy forum editor.

### Post detail page

The `/posts/[id]` page should include:

- post title
- author label
- created date
- full post content
- comment list below the post
- comment form for authenticated users
- sign-in prompt for unauthenticated users

## Auth and Access Control

Access control rules:

- reading posts: public
- reading comments: public
- writing posts: authenticated only
- writing comments: authenticated only

Enforcement points:

- page-level guard on `/posts/new`
- server action checks for all write actions

The server action checks remain mandatory even if the UI already hides the form.

## Error Handling

Handle failure cases with straightforward behavior.

- missing or invalid post id: return 404
- unauthenticated write attempt: redirect to `/login` or reject cleanly from the action
- validation error: show inline form feedback
- database error: show a generic failure message and avoid leaking internals

The first version should optimize for clarity over sophisticated recovery behavior.

## Testing and Verification

Manual verification for the first version should cover:

1. Unauthenticated user can open `/posts`
2. Unauthenticated user can open `/posts/[id]`
3. Unauthenticated user is redirected from `/posts/new`
4. Authenticated user can create a post
5. New post appears in `/posts`
6. Authenticated user can create a comment
7. New comment appears on the post detail page
8. Invalid post id returns a 404 page

Operational verification:

- run Prisma schema update against Neon
- confirm post and comment rows persist correctly
- confirm author relations are stored and rendered

## Implementation Boundaries

Do not include the following in this implementation:

- post edit
- post delete
- comment edit
- comment delete
- likes or reactions
- categories or boards
- pinned posts
- file uploads
- rich text editor
- nested replies

These are natural future extensions, but excluding them keeps the first implementation fast and coherent.

## Recommended Implementation Shape

Keep the implementation compact and aligned with current project patterns.

- Prisma schema change in `prisma/schema.prisma`
- Prisma-backed server reads in route files
- Server actions colocated with the relevant route or a nearby feature file
- Reuse existing auth helpers from `lib/auth.ts`
- Reuse existing Prisma client from `lib/db.ts`

This keeps the feature understandable without introducing extra abstraction too early.
