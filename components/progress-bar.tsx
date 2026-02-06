"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  progress?: number
  current?: number
  total?: number
}

export default function ProgressBar({ progress, current, total }: ProgressBarProps) {
  // Calculate percentage from either progress prop or current/total
  const percentage = progress !== undefined 
    ? progress 
    : (current !== undefined && total !== undefined) 
      ? (current / total) * 100 
      : 0

  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-sm">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 rounded-full shadow-lg"
      />
    </div>
  )
}
