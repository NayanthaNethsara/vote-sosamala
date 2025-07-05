"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { signOut } from "@/lib/auth/actions";

type Props = {
  user: string | null;
  onLoginClick?: () => void;
};

export function UserMenu({ user, onLoginClick }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="p-0 h-10 w-10 rounded-full focus:outline-none hover:bg-gray-800/50 cursor-none"
          >
            <Avatar className="h-9 w-9 border-2 border-gray-700/50">
              <AvatarImage src={"/placeholder.svg"} alt={user ?? "User"} />
              <AvatarFallback className="bg-gray-800 text-gray-300 font-semibold">
                {user ? user[0]?.toUpperCase() : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-gray-900/95 backdrop-blur-xl border-gray-700/50 cursor-none"
      >
        {user ? (
          <>
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700/50">
              Signed in as
              <br />
              <span className="font-semibold text-gray-200 text-sm">
                {user}
              </span>
            </div>
            <DropdownMenuItem
              onClick={async () => await signOut()}
              className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-none"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={onLoginClick}
            className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-none"
          >
            <LogIn className="h-4 w-4" />
            Login
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
