"use client"

import { CheckCircle, Plus, Home } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"

interface SuccessScreenProps {
  screeningNumber: string
  screeningType: "OROSCAN" | "MEDTECH"
  onNewScreening: () => void
}

export function SuccessScreen({ screeningNumber, screeningType, onNewScreening }: SuccessScreenProps) {
  const { t } = useTranslation("success")

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl max-w-lg mx-auto">
        <CardContent className="pt-12 pb-8 px-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t("message")}
            </p>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Screening Number ID</p>
              <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">{screeningNumber}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("screeningType")}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {screeningType === "OROSCAN" ? "Oral Cancer Screening" : "Anemia Screening"}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <Button
              onClick={onNewScreening}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("newScreening")}
            </Button>
            <Link href="/screening" className="block">
              <Button
                variant="outline"
                className="w-full py-4"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("backToHome")}
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
