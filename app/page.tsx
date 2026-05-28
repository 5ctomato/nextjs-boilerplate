// app/page.tsx
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {session ? (
        <>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user?.email}
          </p>
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
