"use client";

import { useAuth } from "@/context/AuthContext";
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
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const isAuthorized = !!user && (role === "admin" || role === "super-admin");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAuthorized) {
      router.replace("/");
    }
  }, [user, loading, router, isAuthorized]);

  if (loading || !isAuthorized) {
    return null;
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
        <main className="flex-1 overflow-y-auto py-10 px-6 sm:px-8 font-mono">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
