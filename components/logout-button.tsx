"use client";
import { signOut } from "@/lib/auth/actions";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => await signOut()}
      className="text-red-500 hover:underline"
    >
      Log out
    </button>
  );
}
