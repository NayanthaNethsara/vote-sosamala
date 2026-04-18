"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CheckSquareOffset,
  Gear,
  SquaresFour,
  UserList,
  Users,
} from "@phosphor-icons/react";

import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { adminSupportLinks } from "@/config/side-config";

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
] as const;

const superAdminItems = [
  {
    title: "User Management",
    url: "/admin/users",
    icon: UserList,
  },
] as const;

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user, role } = useAuth();
  const pathname = usePathname();
  const isSuperAdmin = role === "super-admin";

  const navigationGroups = [
    {
      label: "Management",
      items,
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Super Admin",
            items: superAdminItems,
          },
        ]
      : []),
  ] as const;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin" className="gap-3">
                <Image
                  src="/logo/logo.png"
                  alt="Logo"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-bold uppercase tracking-tight">
                    Voting System
                  </span>
                  <span className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/60">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="h-10"
                    >
                      <Link href={item.url} className="gap-3">
                        <item.icon className="size-4" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/60">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminSupportLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-3"
                    >
                      <item.icon className="size-4" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
