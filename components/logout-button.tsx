"use client";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => await signOut()}
      className="flex items-center gap-2 bg-transparent"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
