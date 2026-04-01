"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMe } from "@/lib/api";
import type { MeResponse } from "@/types/user";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [serverUser, setServerUser] = useState<MeResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Once the user is authenticated, verify with the backend
  useEffect(() => {
    if (!user) return;

    fetchMe(user)
      .then(setServerUser)
      .catch((err: Error) => setServerError(err.message));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Sosamala Voting</h1>
        <p className="text-sm text-gray-500">Signed in as {user.email}</p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-zinc-900">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Backend Verification
        </p>
        {serverUser ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">UID</dt>
              <dd className="font-mono text-xs">{serverUser.uid}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd>{serverUser.email}</dd>
            </div>
          </dl>
        ) : serverError ? (
          <p className="text-sm text-red-500">{serverError}</p>
        ) : (
          <p className="text-sm text-gray-400">Verifying with server...</p>
        )}
      </div>

      <button
        onClick={signOut}
        className="text-sm text-red-500 underline hover:text-red-700"
      >
        Sign out
      </button>
    </main>
  );
}
