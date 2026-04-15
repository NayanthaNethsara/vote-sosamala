"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function PublicAuthCta() {
  const { user, role, loading, signInWithGoogle, signOut } = useAuth();
  const isAdmin = role === "admin" || role === "super-admin";

  if (loading) {
    return (
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <p className="max-w-full truncate text-xs text-muted-foreground">
          Signed in as {user.email}
        </p>
        {isAdmin && (
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={signInWithGoogle}>
      Sign in with Google
    </Button>
  );
}
