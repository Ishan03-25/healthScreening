"use client"

import { Activity, Droplet, ArrowRight, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/use-translation"

interface ScreeningSelectProps {
  onSelect: (type: "OROSCAN" | "MEDTECH") => void
  onBack: () => void
}

export function ScreeningSelect({ onSelect, onBack }: ScreeningSelectProps) {
  const { t } = useTranslation("screeningSelect")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Oroscan */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect("OROSCAN")}
              className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("oroscanTitle")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t("oroscanDesc")}
              </p>
              <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                {t("startScreening")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Medtech */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect("MEDTECH")}
              className="group relative overflow-hidden rounded-2xl border-2 border-red-200 dark:border-red-800 hover:border-red-500 p-6 text-left transition-all bg-white dark:bg-slate-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Droplet className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("medtechTitle")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t("medtechDesc")}
              </p>
              <div className="mt-4 flex items-center text-red-600 dark:text-red-400 font-medium">
                {t("startScreening")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full py-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
