"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4">
      <p className="text-lg font-medium">Welcome, {user.displayName}</p>
      <p className="text-sm text-gray-500">{user.email}</p>
      <button
        onClick={signOut}
        className="text-sm text-red-500 underline hover:text-red-700"
      >
        Sign out
      </button>
    </div>
  );
}
