"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, ArrowRight, Apple, Droplet, Activity } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface HealthFormProps {
  data: Record<string, string>
  onUpdate: (data: Record<string, string>) => void
  onNext: () => void
  onBack: () => void
}

export function HealthForm({ data, onUpdate, onNext, onBack }: HealthFormProps) {
  const [healthData, setHealthData] = useState<Record<string, string>>(data)
  const { t } = useTranslation("health")
  const { t: tc } = useTranslation("common")

  const handleChange = useCallback((field: string, value: string) => {
    const newData = { ...healthData, [field]: value }
    setHealthData(newData)
    onUpdate(newData)
  }, [healthData, onUpdate])

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

  const dietTypeOptions = ["Vegetarian", "Non-Vegetarian", "Vegan", "Pescatarian", "Flexitarian"]
  const frequencyOptions = ["Never", "Rarely", "Sometimes", "Often", "Daily"]
  const servingsOptions = ["0", "1-2", "3-4", "5+"]
  const exerciseOptions = ["Never", "1-2 times/week", "3-4 times/week", "5+ times/week", "Daily"]
  const stressOptions = ["Low", "Moderate", "High", "Very High"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 1 of 3</span>
          <div className="flex-1">
            <ProgressBar progress={33} />
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
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground dark:text-slate-100">
            {t("title")}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground">
            {t("subtitle")}
          </motion.p>

          {/* Health Metrics */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600">
                  <Activity className="w-5 h-5" />
                  {t("healthMetrics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("height")}</label>
                  <Input
                    type="number"
                    value={healthData.height || ""}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="e.g., 170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("weight")}</label>
                  <Input
                    type="number"
                    value={healthData.weight || ""}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="e.g., 65"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("bloodPressure")}</label>
                  <Input
                    type="text"
                    value={healthData.bloodPressure || ""}
                    onChange={(e) => handleChange("bloodPressure", e.target.value)}
                    placeholder="e.g., 120/80"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dietary Habits */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Apple className="w-5 h-5" />
                  {t("dietaryHabits")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("dietType")}</label>
                  <select
                    value={healthData.dietType || ""}
                    onChange={(e) => handleChange("dietType", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {dietTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("meatConsumption")}</label>
                  <select
                    value={healthData.meatConsumption || ""}
                    onChange={(e) => handleChange("meatConsumption", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {frequencyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("vegetableServings")}</label>
                  <select
                    value={healthData.vegetableServings || ""}
                    onChange={(e) => handleChange("vegetableServings", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {servingsOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("fruitServings")}</label>
                  <select
                    value={healthData.fruitServings || ""}
                    onChange={(e) => handleChange("fruitServings", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {servingsOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("ironRichFoods")}</label>
                  <select
                    value={healthData.ironRichFoods || ""}
                    onChange={(e) => handleChange("ironRichFoods", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {frequencyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("vitaminCIntake")}</label>
                  <select
                    value={healthData.vitaminCIntake || ""}
                    onChange={(e) => handleChange("vitaminCIntake", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {frequencyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lifestyle Habits */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Droplet className="w-5 h-5" />
                  {t("lifestyleHabits")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("exerciseFrequency")}</label>
                  <select
                    value={healthData.exerciseFrequency || ""}
                    onChange={(e) => handleChange("exerciseFrequency", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {exerciseOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("exerciseDuration")}</label>
                  <Input
                    type="number"
                    value={healthData.exerciseDuration || ""}
                    onChange={(e) => handleChange("exerciseDuration", e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("sleepHours")}</label>
                  <Input
                    type="number"
                    value={healthData.sleepHours || ""}
                    onChange={(e) => handleChange("sleepHours", e.target.value)}
                    placeholder="e.g., 7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("stressLevel")}</label>
                  <select
                    value={healthData.stressLevel || ""}
                    onChange={(e) => handleChange("stressLevel", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {stressOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("waterIntake")}</label>
                  <Input
                    type="number"
                    value={healthData.waterIntake || ""}
                    onChange={(e) => handleChange("waterIntake", e.target.value)}
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("supplements")}</label>
                  <Input
                    type="text"
                    value={healthData.supplements || ""}
                    onChange={(e) => handleChange("supplements", e.target.value)}
                    placeholder="e.g., Iron, Vitamin B12"
                  />
                </div>
              </CardContent>
            </Card>
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
                className="border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-8 py-3 rounded-lg flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" /> {tc("back")}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onNext}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2"
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
