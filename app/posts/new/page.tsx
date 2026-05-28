import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { PostForm } from "@/components/posts/post-form"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { type FormState, validatePostInput } from "@/lib/posts"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  async function createPost(_: FormState, formData: FormData): Promise<FormState> {
    "use server"

    const session = await auth()

    if (!session?.user?.email) {
      redirect("/login")
    }

    const result = validatePostInput(
      String(formData.get("title") ?? ""),
      String(formData.get("content") ?? "")
    )

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

    revalidatePath("/posts")
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
