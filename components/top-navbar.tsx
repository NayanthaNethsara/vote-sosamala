import Link from "next/link";
import { UserCircle2 } from "lucide-react";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

function getDisplayName(email: string | undefined) {
  if (!email) {
    return "User";
  }

  return email.split("@")[0] || email;
}

export async function TopNavbar() {
  const user = await getAuthenticatedUser();

  return (
    <header className="border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-wide text-white">
          Sosamala Voting
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85">
              <UserCircle2 className="h-4 w-4 text-emerald-300" />
              <span>{getDisplayName(user.email)}</span>
            </div>

            <form action={signOut}>
              <Button type="submit" variant="secondary" size="sm">
                Logout
              </Button>
            </form>
          </div>
        ) : (
          <Button asChild size="sm">
            <Link href="/auth/login">Login to vote</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
