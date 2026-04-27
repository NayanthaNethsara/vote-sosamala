"use client";

import Link from "next/link";
import {
  IconHome,
  IconMenu2,
  IconX,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Navbar, NavBody, NavItems } from "@/components/ui/resizable-navbar";
import { MobileNav, MobileNavHeader } from "@/components/ui/resizable-navbar";
import {
  MobileAnimatedMenu,
  MobileMenuItems,
  MobileMenuItem,
  MobileMenuSocialLinks,
} from "@/components/ui/mobile-animated-menu";
import { siteConfig } from "@/config/site-config";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { LoginModal } from "@/components/auth/login-modal";

const navItems = [
  { name: "Home", link: "/", icon: <IconHome className="h-5 w-5" /> },
  {
    name: "Kumaraya",
    link: "/male",
    icon: <IconUser className="h-5 w-5" />,
  },
  {
    name: "Kumari",
    link: "/female",
    icon: <IconUser className="h-5 w-5" />,
  },
];

export function HomeNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <Navbar>
        <NavBody>
          <Link
            href="/"
            className="relative z-20 flex items-center space-x-3 px-4 py-2 text-base font-semibold text-rose-50 font-mono"
          >
            <span className="drop-shadow-[0_0_10px_rgba(128,0,32,0.45)]">
              {siteConfig.name}
            </span>
          </Link>

          <NavItems items={navItems} />

          <div className="relative z-20 flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden text-xs font-medium text-rose-100 lg:block">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-rose-100 transition-colors hover:text-rose-200 p-1.5 rounded-full hover:bg-rose-500/10"
                  aria-label="Logout"
                >
                  <IconLogout className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <LoginModal
                triggerLabel="Login to Vote"
                triggerVariant="ghost"
                className="h-8 rounded-full bg-white/10 px-3 text-xs font-bold text-white border border-white/20 hover:bg-white/20"
              />
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-1.5 text-base font-semibold text-rose-50 font-mono"
            >
              <span className="drop-shadow-[0_0_8px_rgba(128,0,32,0.4)]">
                {siteConfig.name}
              </span>
            </Link>
            <button
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="z-50 rounded-lg p-2 transition-colors hover:bg-[#881337]/15"
            >
              {isMobileMenuOpen ? (
                <IconX className="h-6 w-6 text-rose-50" />
              ) : (
                <IconMenu2 className="h-6 w-6 text-rose-50" />
              )}
            </button>
          </MobileNavHeader>
        </MobileNav>
      </Navbar>

      {/* Animated mobile menu */}
      <MobileAnimatedMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        <MobileMenuItems>
          {navItems.map((item) => (
            <MobileMenuItem
              key={item.link}
              href={item.link}
              onClick={closeMobileMenu}
            >
              {item.name}
            </MobileMenuItem>
          ))}
        </MobileMenuItems>

        <MobileMenuSocialLinks>
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-rose-100">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="text-rose-100 transition-colors hover:text-rose-200 flex flex-col items-center gap-1"
                aria-label="Logout"
              >
                <IconLogout className="h-6 w-6" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Logout
                </span>
              </button>
            </div>
          ) : (
            <LoginModal
              triggerLabel="Login to Vote"
              triggerVariant="outline"
              className="h-10 rounded-full px-6 text-sm font-bold bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={closeMobileMenu}
            />
          )}
        </MobileMenuSocialLinks>
      </MobileAnimatedMenu>
    </>
  );
}
