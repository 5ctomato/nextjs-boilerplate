// app/page.tsx
import Link from "next/link"

import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cream canvas with Green feature */}
      <header className="bg-house-green text-white py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.01em] text-white mb-4">
            Welcome
          </h1>
          <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
            Your Next.js boilerplate with a warm, confident design system.
          </p>
        </div>
      </header>

      {/* Main Content - Neutral Warm canvas */}
      <main className="bg-neutral-warm py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <div className="max-w-xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Explore posts or create your own content
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Link href="/posts" className="w-full">
                  <Button variant="outline" className="w-full">
                    Browse posts
                  </Button>
                </Link>
                
                {session ? (
                  <>
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Signed in as {session.user?.email}
                    </p>
                    <Link href="/posts/new" className="w-full">
                      <Button className="w-full">Write a post</Button>
                    </Link>
                    <form
                      action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/" })
                      }}
                      className="w-full"
                    >
                      <Button type="submit" variant="dark-outline" className="w-full">
                        Sign out
                      </Button>
                    </form>
                  </>
                ) : (
                  <a href="/login" className="w-full">
                    <Button variant="black" className="w-full">
                      Sign in with Google
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer - House Green */}
      <footer className="bg-house-green text-white py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-10 text-center">
          <p className="text-sm text-white/70">
            Built with Next.js 16 · Tailwind CSS v4 · shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}
