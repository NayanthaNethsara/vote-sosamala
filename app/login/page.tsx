"use client";

import { signInWithGoogle } from "@/lib/auth/actions";

export default function LoginPage() {
  const handleLogin = async () => {
    const url = await signInWithGoogle();
    if (url) window.location.href = url;
  };

  return (
    <main className="h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </main>
  );
}
