import { auth, signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Next.js Boilerplate</h1>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Welcome, {session.user.name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer rounded-full">
                <Avatar>
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback>
                    {session.user.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button type="submit" className="w-full text-left">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <p className="text-gray-500">Not signed in</p>
        )}
      </div>
    </main>
  );
}
