"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Apple } from "lucide-react"
import ProgressBar from "@/components/progress-bar"
import { useTranslation } from "@/hooks/use-translation"

interface DietaryHabitsProps {
  data: Record<string, string>
  onUpdate: (data: Record<string, string>) => void
  onNext: () => void
  onBack: () => void
}

// Yes/No Button Component
function YesNoButtons({ 
  value, 
  onChange,
  yesLabel = "Yes",
  noLabel = "No"
}: { 
  value: string
  onChange: (val: string) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === "Yes" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("Yes")}
        className={value === "Yes" ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        {yesLabel}
      </Button>
      <Button
        type="button"
        variant={value === "No" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("No")}
        className={value === "No" ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        {noLabel}
      </Button>
    </div>
  )
}

// Three Option Button Component
function ThreeOptionButtons({ 
  options, 
  value, 
  onChange,
  labels
}: { 
  options: string[]
  value: string
  onChange: (val: string) => void
  labels?: string[]
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option, index) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option)}
          className={value === option ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {labels ? labels[index] : option}
        </Button>
      ))}
    </div>
  )
}

// Question Card Component
function QuestionCard({ 
  question, 
  children 
}: { 
  question: string
  children: React.ReactNode 
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <p className="text-red-500 font-medium mb-3">{question}</p>
      {children}
    </div>
  )
}

export function DietaryHabits({ data, onUpdate, onNext, onBack }: DietaryHabitsProps) {
  const [formData, setFormData] = useState<Record<string, string>>(data)

  const handleChange = useCallback((field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }, [formData, onUpdate])

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Apple className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Health and Dietary Habits</h2>
              <p className="text-muted-foreground">Tell us about your eating habits and how you &apos;ve been feeling</p>
            </div>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <motion.div variants={itemVariants}>
                <QuestionCard question="How often do you eat fruits and vegetables?">
                  <ThreeOptionButtons
                    options={["Daily", "Occasionally", "Rarely"]}
                    value={formData.fruitsVegetablesFrequency || ""}
                    onChange={(val) => handleChange("fruitsVegetablesFrequency", val)}
                  />
                </QuestionCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <QuestionCard question="Do you consume iron-rich foods like green leafy vegetables, red meat, or beans?">
                  <YesNoButtons
                    value={formData.consumesIronRichFoods || ""}
                    onChange={(val) => handleChange("consumesIronRichFoods", val)}
                  />
                </QuestionCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <QuestionCard question="Have you had any recent episodes of feeling unusually tired or weak?">
                  <YesNoButtons
                    value={formData.feelsTiredOrWeak || ""}
                    onChange={(val) => handleChange("feelsTiredOrWeak", val)}
                  />
                </QuestionCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <QuestionCard question="Do you often feel dizzy or have headaches?">
                  <YesNoButtons
                    value={formData.feelsDizzyOrHeadaches || ""}
                    onChange={(val) => handleChange("feelsDizzyOrHeadaches", val)}
                  />
                </QuestionCard>
              </motion.div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <motion.div variants={itemVariants} className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={onNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
