"use client";

import Image from "next/image";
import {
  Users,
  SquaresFour,
  CheckSquareOffset,
  Gear,
  UserList,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { NavUser } from "@/components/admin/nav-user";

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: SquaresFour,
  },
  {
    title: "Contestants",
    url: "/admin/contestants",
    icon: Users,
  },
  {
    title: "Vote Results",
    url: "/admin/results",
    icon: CheckSquareOffset,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Gear,
  },
];

const superAdminItems = [
  {
    title: "User Management",
    url: "/admin/users",
    icon: UserList,
  },
];

export function AdminSidebar() {
  const { user, role } = useAuth();
  const pathname = usePathname();
  const isSuperAdmin = role === "super-admin";

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="font-mono">
      <SidebarHeader className="h-16 border-b border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-none">
                  <Image
                    src="/logo/logo.png"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold uppercase tracking-tight">
                    Voting System
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase font-bold tracking-widest text-[10px]">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase font-bold tracking-widest text-[10px]">
              Super Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <NavUser
          user={{
            name: user?.displayName || "Admin User",
            email: user?.email || "",
            avatar: user?.photoURL || "",
            role,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
