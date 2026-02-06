"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/question-card"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface QuestionResponse {
  questionId: string
  answer: string
  duration?: string
}

interface MedicalHistoryProps {
  data: QuestionResponse[]
  onUpdate: (data: QuestionResponse[]) => void
  onNext: () => void
  onBack: () => void
}

export function MedicalHistory({ data, onUpdate, onNext, onBack }: MedicalHistoryProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    data.forEach(d => {
      initial[d.questionId] = d.answer
    })
    return initial
  })
  const [durations, setDurations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    data.forEach(d => {
      if (d.duration) initial[d.questionId] = d.duration
    })
    return initial
  })
  const { t } = useTranslation("medical")
  const { t: tc } = useTranslation("common")

  // Questions that require duration when answered "yes"
  const questionsWithDuration = ["alcohol", "tobacco", "gutka", "paan"]

  const questions = [
    { id: "alcohol", label: t("q_alcohol") },
    { id: "tobacco", label: t("q_tobacco") },
    { id: "gutka", label: t("q_gutka") },
    { id: "paan", label: t("q_paan") },
    { id: "precipitation", label: t("q_precipitation") },
  ]

  const handleAnswer = useCallback((id: string, value: string, duration?: string) => {
    const newAnswers = { ...answers, [id]: value }
    setAnswers(newAnswers)
    
    const newDurations = { ...durations }
    if (duration !== undefined) {
      if (duration) {
        newDurations[id] = duration
      } else {
        delete newDurations[id]
      }
    } else if (value === "no") {
      delete newDurations[id]
    }
    setDurations(newDurations)
    
    // Convert to array format for parent
    const responses: QuestionResponse[] = Object.entries(newAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
      duration: newDurations[questionId]
    }))
    onUpdate(responses)
  }, [answers, durations, onUpdate])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 1 of 4</span>
          <div className="flex-1">
            <ProgressBar progress={25} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* History of Habits Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-xl p-4 font-semibold text-lg transition-colors duration-300"
          >
            {t("historyOfHabits")}
          </motion.div>

          {/* Questions with numbers */}
          {questions.map((q, index) => (
            <motion.div key={q.id} variants={itemVariants}>
              <QuestionCard
                question={`${index + 1}. ${q.label}`}
                onAnswer={(value, duration) => handleAnswer(q.id, value, duration)}
                selected={answers[q.id]}
                selectedDuration={durations[q.id]}
                showDuration={questionsWithDuration.includes(q.id)}
              />
            </motion.div>
          ))}

          {/* HIV/HPV Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-xl p-4 font-semibold text-lg transition-colors duration-300"
          >
            {t("historyOfHivHpv")}
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuestionCard
              question={`1. ${t("q_hiv")}`}
              onAnswer={(value) => handleAnswer("hiv", value)}
              selected={answers["hiv"]}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuestionCard
              question={`2. ${t("q_hpv")}`}
              onAnswer={(value) => handleAnswer("hpv", value)}
              selected={answers["hpv"]}
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
