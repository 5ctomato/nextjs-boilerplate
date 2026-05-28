// app/(auth)/error/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error ?? "An unexpected error occurred."}
          </p>
          <a href="/login" className="text-sm underline">
            Try again
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
