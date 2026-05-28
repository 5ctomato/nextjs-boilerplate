import { db } from "@/lib/db"

export type FormState = {
  message: string | null
}

export const initialFormState: FormState = {
  message: null,
}

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

export function formatAuthorLabel(author: { name: string | null; email: string }) {
  return author.name?.trim() || author.email
}

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
