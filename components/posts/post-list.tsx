import Link from "next/link"

import { formatAuthorLabel } from "@/lib/posts"

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
