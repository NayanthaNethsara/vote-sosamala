"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";
import Image from "next/image";

interface VotingHeaderProps {
  user: string | null;
}

function getParentPath(pathname: string): string {
  const parts = pathname.replace(/\/$/, "").split("/");
  parts.pop();
  return parts.length === 0 ? "/" : parts.join("/") || "/";
}

export function VotingHeader({ user }: VotingHeaderProps) {
  const pathname = usePathname();
  const backUrl = getParentPath(pathname);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900/30 border-b border-gray-700/30 backdrop-blur-xl top-0 z-50 fixed w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/10 via-gray-700/5 to-gray-800/10" />

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-20 py-2 sm:py-3 lg:py-2 relative z-10">
        <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
          {/* Left: Back Button */}
          <div className="flex justify-start">
            <Link href={backUrl}>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm px-2 sm:px-3"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link href={"/"}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Image
                  src="/logo/logo.png"
                  alt="Sosamala Logo"
                  width={80}
                  height={80}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-12 md:w-12 lg:h-14 lg:w-14 object-cover transition-all duration-200"
                />
              </motion.div>
            </Link>
          </div>

          {/* Right: User Menu */}
          <div className="flex justify-end">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
