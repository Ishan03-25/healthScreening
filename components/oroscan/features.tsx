"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import ImageSelector from "@/components/image-selector"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface QuestionResponse {
  questionId: string
  answer: string
}

interface FeaturesProps {
  data: QuestionResponse[]
  onUpdate: (data: QuestionResponse[]) => void
  onNext: () => void
  onBack: () => void
}

// Extract YesNoButtons outside the main component
function YesNoButtonsComponent({ 
  questionId, 
  selectedAnswer, 
  onAnswer, 
  yesLabel, 
  noLabel 
}: { 
  questionId: string
  selectedAnswer: string
  onAnswer: (id: string, value: string) => void
  yesLabel: string
  noLabel: string
}) {
  return (
    <div className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700">
      <div className="flex gap-3">
        <Button
          onClick={() => onAnswer(questionId, "yes")}
          variant={selectedAnswer === "yes" ? "default" : "outline"}
          className={`rounded-full px-6 font-semibold transition-all duration-300 ${
            selectedAnswer === "yes"
              ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
              : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
          }`}
        >
          {yesLabel}
        </Button>
        <Button
          onClick={() => onAnswer(questionId, "no")}
          variant={selectedAnswer === "no" ? "default" : "outline"}
          className={`rounded-full px-6 font-semibold transition-all duration-300 ${
            selectedAnswer === "no"
              ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
              : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
          }`}
        >
          {noLabel}
        </Button>
      </div>
    </div>
  )
}

export function Features({ data, onUpdate, onNext, onBack }: FeaturesProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    data.forEach(d => {
      initial[d.questionId] = d.answer
    })
    return initial
  })
  
  const { t } = useTranslation("features")
  const { t: tc } = useTranslation("common")

  const handleAnswer = useCallback((id: string, value: string) => {
    const newAnswers = { ...answers, [id]: value }
    setAnswers(newAnswers)
    
    // Convert to array format for parent
    const responses: QuestionResponse[] = Object.entries(newAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }))
    onUpdate(responses)
  }, [answers, onUpdate])

  const getAnswer = (questionId: string) => answers[questionId] || ""

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

  // Images for the different image-selection questions
  const asymmetryImages = [{ id: "1", label: t("asymmetry"), url: "/mouth/assymetry.png" }]

  const patchesImages = Array.from({ length: 13 }).map((_, i) => ({
    id: String(i + 1),
    label: `${t("patches")} ${i + 1}`,
    url: `/mouth/patch-${i + 1}.png`,
  }))

  const lumpsImages = Array.from({ length: 4 }).map((_, i) => ({
    id: String(i + 1),
    label: `${t("lumps_mouth")} ${i + 1}`,
    url: `/mouth/lumps-${i + 1}.png`,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 3 of 4</span>
          <div className="flex-1">
            <ProgressBar progress={75} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground dark:text-slate-100">
            {t("title")}
          </motion.h2>

          {/* Question 1 - Asymmetry */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">1. {t("asymmetry")}</p>
            <ImageSelector
              images={asymmetryImages}
              selected={getAnswer("asymmetry")}
              onSelect={(id) => handleAnswer("asymmetry", id)}
            />
          </motion.div>

          {/* Question 2 - Red/White patches */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">2. {t("patches")}</p>
            <ImageSelector
              images={patchesImages}
              selected={getAnswer("patches_image")}
              onSelect={(id) => handleAnswer("patches_image", id)}
            />
          </motion.div>

          {/* Question 3 - Sore/Ulcer */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">3. {t("sore")}</p>
            <YesNoButtonsComponent 
              questionId="sore" 
              selectedAnswer={getAnswer("sore")}
              onAnswer={handleAnswer}
              yesLabel={tc("yes")}
              noLabel={tc("no")}
            />
          </motion.div>

          {/* Question 4 - Neck lumps */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">4. {t("lumps_neck")}</p>
            <YesNoButtonsComponent 
              questionId="neck_lumps" 
              selectedAnswer={getAnswer("neck_lumps")}
              onAnswer={handleAnswer}
              yesLabel={tc("yes")}
              noLabel={tc("no")}
            />
          </motion.div>

          {/* Question 5 - Lumps in mouth */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">5. {t("lumps_mouth")}</p>
            <ImageSelector
              images={lumpsImages}
              selected={getAnswer("lumps_mouth")}
              onSelect={(id) => handleAnswer("lumps_mouth", id)}
            />
          </motion.div>

          {/* Question 6 - Change in speech */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">6. {t("speech")}</p>
            <YesNoButtonsComponent 
              questionId="speech" 
              selectedAnswer={getAnswer("speech")}
              onAnswer={handleAnswer}
              yesLabel={tc("yes")}
              noLabel={tc("no")}
            />
          </motion.div>

          {/* Question 7 - Difficulty chewing/swallowing */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">7. {t("chewing")}</p>
            <YesNoButtonsComponent 
              questionId="chewing" 
              selectedAnswer={getAnswer("chewing")}
              onAnswer={handleAnswer}
              yesLabel={tc("yes")}
              noLabel={tc("no")}
            />
          </motion.div>

          {/* Question 8 - Oral/facial pain */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">8. {t("oral_pain")}</p>
            <YesNoButtonsComponent 
              questionId="oral_pain" 
              selectedAnswer={getAnswer("oral_pain")}
              onAnswer={handleAnswer}
              yesLabel={tc("yes")}
              noLabel={tc("no")}
            />
          </motion.div>

          {/* Question 9 - Trismus test */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-semibold text-red-600 mb-4">9. {t("trismus")}</p>
            <div className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700">
              {/* Trismus reference image */}
              <div className="mb-4">
                <div className="relative w-full max-w-md mx-auto">
                  <img 
                    src="/mouth/trismus.png" 
                    alt="Trismus test reference"
                    className="w-full h-auto rounded-lg border border-border dark:border-slate-600 shadow-sm"
                  />
                  {/* <p className="text-sm text-muted-foreground dark:text-slate-400 text-center mt-2">
                    Reference: Can the patient fit 3 fingers between their teeth?
                  </p> */}
                </div>
              </div>
              {/* Yes/No buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleAnswer("trismus", "yes")}
                  variant={getAnswer("trismus") === "yes" ? "default" : "outline"}
                  className={`rounded-full px-6 font-semibold transition-all duration-300 ${
                    getAnswer("trismus") === "yes"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
                      : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
                  }`}
                >
                  {tc("yes")}
                </Button>
                <Button
                  onClick={() => handleAnswer("trismus", "no")}
                  variant={getAnswer("trismus") === "no" ? "default" : "outline"}
                  className={`rounded-full px-6 font-semibold transition-all duration-300 ${
                    getAnswer("trismus") === "no"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0"
                      : "border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
                  }`}
                >
                  {tc("no")}
                </Button>
              </div>
            </div>
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
