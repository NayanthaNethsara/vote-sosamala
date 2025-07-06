"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { signOut } from "@/lib/auth/actions";
import { useLoginDialog } from "@/context/LoginDialogContext";

type Props = {
  user: string | null;
};

export function UserMenu({ user }: Props) {
  const { open } = useLoginDialog();
  if (!user) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={open}
          className="p-0 h-8 w-32 sm:h-9 sm:w-36 md:h-10 md:w-40 rounded-full focus:outline-none hover:bg-gray-800/50 cursor-pointer flex items-center justify-center"
        >
          <span className="text-gray-300 text-sm sm:text-base md:text-lg font-medium">
            Login to vote
          </span>
        </Button>
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="p-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full focus:outline-none hover:bg-gray-800/50 cursor-pointer ring-offset-2 focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Avatar className="h-full w-full border-2 border-gray-700/50 hover:border-gray-600/70 transition-colors">
              <AvatarImage src="/placeholder.svg" alt={user} />
              <AvatarFallback className="bg-gray-800 text-gray-300 font-semibold text-xs sm:text-sm">
                {user[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-xl"
      >
        <div className="px-3 py-2 text-xs text-gray-400">
          Signed in as
          <div className="font-semibold text-gray-200 text-sm mt-1 truncate">
            {user}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700/50" />

        <DropdownMenuItem className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-pointer focus:bg-gray-800/50 focus:text-white">
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700/50" />

        <DropdownMenuItem
          onClick={async () => await signOut()}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer focus:bg-red-900/20 focus:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
