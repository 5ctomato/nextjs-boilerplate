"use client"

import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { initialFormState, type FormState } from "@/lib/posts"

type PostFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function PostForm({ action }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState)

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-card p-6">
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
      {state.message ? <p className="text-sm text-destructive">{state.message}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Publishing..." : "Publish post"}
        </Button>
        <Link href="/posts" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  )
}
