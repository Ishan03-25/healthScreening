"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"
import { Check } from "lucide-react"

interface ImageSelectorProps {
  images: Array<{ id: number | string; label: string; url: string }>
  selected: string
  onSelect: (id: string) => void
  title?: string
}

export default function ImageSelector({ images, selected, onSelect, title }: ImageSelectorProps) {
  const { t } = useTranslation("features")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  }

  return (
    <div className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700">
      {title && <p className="text-lg font-semibold text-red-600 mb-6">{title}</p>}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {images.map((img) => (
          <motion.div
            key={img.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(String(img.id))}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
              selected === String(img.id)
                ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-lg"
                : "border-2 border-border dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div className="relative w-full aspect-square bg-muted dark:bg-slate-700">
              <Image src={img.url || "/placeholder.svg"} alt={img.label} fill className="object-cover" />
            </div>
            {selected === String(img.id) && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* None of Above Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Button
          onClick={() => onSelect("none")}
          className={`w-full rounded-full font-semibold py-3 ${
            selected === "none"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          }`}
        >
          {t("noneOfAbove")}
        </Button>
      </motion.div>
    </div>
  )
}
