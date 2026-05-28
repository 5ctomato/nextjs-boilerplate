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
