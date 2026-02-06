"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

interface QuestionCardProps {
  question: string
  onAnswer: (value: string, duration?: string) => void
  selected?: string
  selectedDuration?: string
  showMoreInfo?: boolean
  showDuration?: boolean
}

const durationOptions = [
  { value: "less-than-1-year", label: "Less than 1 year" },
  { value: "1-2-years", label: "1-2 years" },
  { value: "2-5-years", label: "2-5 years" },
  { value: "5-10-years", label: "5-10 years" },
  { value: "more-than-10-years", label: "More than 10 years" },
]

export default function QuestionCard({ question, onAnswer, selected, selectedDuration, showMoreInfo, showDuration = false }: QuestionCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const [duration, setDuration] = useState(selectedDuration || "")
  const { t } = useTranslation("common")

  const handleAnswerClick = (value: string) => {
    if (value === "no") {
      setDuration("")
      onAnswer(value, "")
    } else {
      onAnswer(value, duration)
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = e.target.value
    setDuration(newDuration)
    onAnswer(selected || "yes", newDuration)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-lg font-semibold text-red-600 dark:text-red-400">{question}</p>
        {showMoreInfo && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-2 transition-colors duration-300"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-3 mb-4 rounded text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300"
        >
          Additional information about this question will be displayed here.
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleAnswerClick("yes")}
            variant={selected === "yes" ? "default" : "outline"}
            className={`rounded-full px-6 font-semibold transition-all duration-300 ${
              selected === "yes"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 dark:from-teal-600 dark:to-teal-700"
                : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
            }`}
          >
            {t("yes")}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleAnswerClick("no")}
            variant={selected === "no" ? "default" : "outline"}
            className={`rounded-full px-6 font-semibold transition-all duration-300 ${
              selected === "no"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 dark:from-teal-600 dark:to-teal-700"
                : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
            }`}
          >
            {t("no")}
          </Button>
        </motion.div>

        {/* Duration dropdown - shown when showDuration is true and answer is "yes" */}
        {showDuration && selected === "yes" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 ml-2"
          >
            <span className="text-sm text-slate-600 dark:text-slate-400">Duration:</span>
            <select
              value={duration}
              onChange={handleDurationChange}
              className="h-10 px-3 rounded-full border-2 border-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t("selectDuration")}</option>
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
