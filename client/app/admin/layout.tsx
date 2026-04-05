"use client";

import { useAuth } from "@/context/AuthContext";
import env from "@/config/env";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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

  if (
    loading ||
    !user ||
    !user.email ||
    !env.adminEmails.includes(user.email)
  ) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono">
        Checking admin authorization...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 sticky top-0 bg-background z-10">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border mx-2" />
          <h2 className="text-sm font-bold tracking-tight uppercase font-mono">
            Administration
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
