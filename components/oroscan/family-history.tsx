"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/question-card"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface QuestionResponse {
  questionId: string
  answer: string
}

interface FamilyHistoryProps {
  data: QuestionResponse[]
  onUpdate: (data: QuestionResponse[]) => void
  onNext: () => void
  onBack: () => void
}

export function FamilyHistory({ data, onUpdate, onNext, onBack }: FamilyHistoryProps) {
  const [answer, setAnswer] = useState<string>(() => {
    const found = data.find(d => d.questionId === "family_cancer")
    return found?.answer || ""
  })
  const { t } = useTranslation("family")
  const { t: tc } = useTranslation("common")

  const handleAnswer = useCallback((value: string) => {
    setAnswer(value)
    onUpdate([{ questionId: "family_cancer", answer: value }])
  }, [onUpdate])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 2 of 4</span>
          <div className="flex-1">
            <ProgressBar progress={50} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-8 border border-border dark:border-slate-700 transition-colors duration-300"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground dark:text-slate-100">
            {t("title")}
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded transition-colors duration-300"
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">
                  {t("title")}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuestionCard
              question={`1. ${t("subtitle")}`}
              onAnswer={handleAnswer}
              selected={answer}
              showMoreInfo
            />
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between pt-6 border-t border-border dark:border-slate-700"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onBack}
                variant="outline"
                className="border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-8 py-3 rounded-lg flex items-center gap-2 bg-transparent transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" /> {tc("back")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onNext}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
                {tc("next")} <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
