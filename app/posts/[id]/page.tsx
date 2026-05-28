import Link from "next/link"
import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"

import { CommentForm } from "@/components/posts/comment-form"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  formatAuthorLabel,
  getPostById,
  type FormState,
  validateCommentInput,
} from "@/lib/posts"

export default async function PostDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const [session, post] = await Promise.all([auth(), getPostById(id)])

  if (!post) {
    notFound()
  }

  const currentPost = post

  async function createComment(_: FormState, formData: FormData): Promise<FormState> {
    "use server"

    const session = await auth()

    if (!session?.user?.email) {
      redirect("/login")
    }

    const result = validateCommentInput(String(formData.get("content") ?? ""))

    if (!result.ok) {
      return { message: result.message }
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
      return { message: "Authenticated user record not found." }
    }

    await db.comment.create({
      data: {
        content: result.value.content,
        postId: currentPost.id,
        authorId: user.id,
      },
    })

    revalidatePath("/posts")
    revalidatePath(`/posts/${currentPost.id}`)
    redirect(`/posts/${currentPost.id}`)
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
            {formatAuthorLabel(currentPost.author)} · {currentPost.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <article className="rounded-2xl border border-border bg-card p-6 whitespace-pre-wrap text-sm leading-7 text-foreground">
        {currentPost.content}
      </article>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Comments</h2>
        <div className="space-y-3">
          {currentPost.comments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No comments yet.
            </div>
          ) : (
            currentPost.comments.map((comment) => (
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
            <p className="text-sm text-muted-foreground">Sign in to write a comment.</p>
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
