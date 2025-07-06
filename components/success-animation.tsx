"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface SuccessAnimationProps {
  show: boolean
}

export function SuccessAnimation({ show }: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-16 h-16 text-green-400" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
