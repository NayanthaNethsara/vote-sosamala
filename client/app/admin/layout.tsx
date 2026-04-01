"use client";

import { useAuth } from "@/context/AuthContext";
import env from "@/config/env";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.email || !env.adminEmails.includes(user.email)) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !user.email || !env.adminEmails.includes(user.email)) {
    return <div className="p-8 text-center text-muted-foreground">Checking admin authorization...</div>;
  }

  return <>{children}</>;
}
