"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Chrome } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth/actions";
import { useRouter, usePathname } from "next/navigation";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const router = useRouter();
  const currentPath = usePathname();

  const handleGoogleLogin = async () => {
    const url = await signInWithGoogle(currentPath);
    if (url) router.push(url);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 "
          >
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full mx-auto relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors "
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Chrome className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  Login Required
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 mb-8 leading-relaxed"
                >
                  You need to be logged in to cast your vote. Sign in with
                  Google to continue and support your favorite contestant.
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  {/* Google Login Button */}
                  <Button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300 "
                  >
                    <Chrome className="w-5 h-5 mr-3" />
                    Continue with Google
                  </Button>

                  {/* Cancel Button */}
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50 py-3 rounded-xl transition-all duration-300 "
                  >
                    Cancel
                  </Button>
                </motion.div>

                {/* Footer text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-gray-500 mt-6"
                >
                  Your vote will be securely recorded and counted
                </motion.p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500/30 rounded-full blur-sm" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-500/20 rounded-full blur-sm" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
