"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

interface MobileAnimatedMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

interface MobileMenuItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Main menu container with animated background layers
export const MobileAnimatedMenu = ({
  isOpen,
  onClose,
  children,
  className,
}: MobileAnimatedMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 30,
        mass: 1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 40,
        mass: 1,
      },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={containerRef}
          className={cn("fixed inset-0 z-50 lg:hidden", className)}
        >
          {/* Overlay - Clickable to close */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-[#2b0d15]/55 backdrop-blur-md"
          />

          {/* Full screen menu */}
          <motion.nav
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#14070b]"
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute right-6 top-6 z-50 rounded-lg p-2 transition-colors hover:bg-[#881337]/20"
              aria-label="Close menu"
            >
              <IconX className="h-6 w-6 text-rose-50" />
            </motion.button>

            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              {children}
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
};

// Menu item with staggered animation
export const MobileMenuItem = ({
  href,
  children,
  onClick,
  className,
}: MobileMenuItemProps) => {
  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.a
      variants={itemVariants}
      href={href}
      onClick={onClick}
      className={cn(
        "block px-4 py-4 text-center text-3xl font-bold text-rose-50 transition-colors duration-300 hover:text-rose-200",
        className,
      )}
    >
      {children}
    </motion.a>
  );
};

// Container for animated menu items with stagger effect
export const MobileMenuItems = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-2"
    >
      {children}
    </motion.div>
  );
};

// Social icons container
export const MobileMenuSocialLinks = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socialVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={socialVariants}
      initial="hidden"
      animate="visible"
      className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6"
    >
      {children}
    </motion.div>
  );
};
