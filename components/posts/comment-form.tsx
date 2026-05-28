"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { initialFormState, type FormState } from "@/lib/posts"

type CommentFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

export function CommentForm({ action }: CommentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-5">
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
      {state.message ? <p className="text-sm text-destructive">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post comment"}
      </Button>
    </form>
  )
}
