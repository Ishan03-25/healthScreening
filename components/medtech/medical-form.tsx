"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProgressBar from "@/components/progress-bar"
import { ArrowLeft, ArrowRight, AlertCircle, Cigarette, Pill } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface MedicalFormProps {
  data: Record<string, string>
  onUpdate: (data: Record<string, string>) => void
  onNext: () => void
  onBack: () => void
}

export function MedicalForm({ data, onUpdate, onNext, onBack }: MedicalFormProps) {
  const [medicalData, setMedicalData] = useState<Record<string, string>>(data)
  const { t } = useTranslation("medtechMedical")
  const { t: tc } = useTranslation("common")

  const handleChange = useCallback((field: string, value: string) => {
    const newData = { ...medicalData, [field]: value }
    setMedicalData(newData)
    onUpdate(newData)
  }, [medicalData, onUpdate])

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

  const yesNoOptions = ["Yes", "No", "Not Sure"]
  const smokingOptions = ["Never", "Former", "Current"]
  const frequencyOptions = ["Never", "Rarely", "Sometimes", "Often", "Daily"]
  const menstrualOptions = ["Regular", "Irregular", "Pre-menopausal", "Post-menopausal", "N/A"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">Step 2 of 3</span>
          <div className="flex-1">
            <ProgressBar progress={66} />
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

          {/* Medical History */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  {t("medicalHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("familyAnemiaHistory")}</label>
                  <select
                    value={medicalData.familyAnemiaHistory || ""}
                    onChange={(e) => handleChange("familyAnemiaHistory", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {yesNoOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("personalAnemiaHistory")}</label>
                  <select
                    value={medicalData.personalAnemiaHistory || ""}
                    onChange={(e) => handleChange("personalAnemiaHistory", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {yesNoOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("otherBloodDisorders")}</label>
                  <Input
                    type="text"
                    value={medicalData.otherBloodDisorders || ""}
                    onChange={(e) => handleChange("otherBloodDisorders", e.target.value)}
                    placeholder="e.g., Thalassemia, Sickle Cell"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("chronicDiseases")}</label>
                  <Input
                    type="text"
                    value={medicalData.chronicDiseases || ""}
                    onChange={(e) => handleChange("chronicDiseases", e.target.value)}
                    placeholder="e.g., Diabetes, Kidney Disease"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("currentMedications")}</label>
                  <Input
                    type="text"
                    value={medicalData.currentMedications || ""}
                    onChange={(e) => handleChange("currentMedications", e.target.value)}
                    placeholder="List current medications"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("transfusions")}</label>
                  <select
                    value={medicalData.transfusions || ""}
                    onChange={(e) => handleChange("transfusions", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {yesNoOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Women's Health */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Pill className="w-5 h-5" />
                  {t("womensHealth")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("menstrualStatus")}</label>
                  <select
                    value={medicalData.menstrualStatus || ""}
                    onChange={(e) => handleChange("menstrualStatus", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {menstrualOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("menstrualCycle")}</label>
                  <Input
                    type="number"
                    value={medicalData.menstrualCycle || ""}
                    onChange={(e) => handleChange("menstrualCycle", e.target.value)}
                    placeholder="e.g., 28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("pregnancies")}</label>
                  <Input
                    type="number"
                    value={medicalData.pregnancies || ""}
                    onChange={(e) => handleChange("pregnancies", e.target.value)}
                    placeholder="e.g., 0"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lifestyle & Habits */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Cigarette className="w-5 h-5" />
                  {t("lifestyleHabits")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t("smokingStatus")}</label>
                  <select
                    value={medicalData.smokingStatus || ""}
                    onChange={(e) => handleChange("smokingStatus", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {smokingOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("alcoholConsumption")}</label>
                  <select
                    value={medicalData.alcoholConsumption || ""}
                    onChange={(e) => handleChange("alcoholConsumption", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    {frequencyOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("recentIllness")}</label>
                  <Input
                    type="text"
                    value={medicalData.recentIllness || ""}
                    onChange={(e) => handleChange("recentIllness", e.target.value)}
                    placeholder="Any recent illness?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t("vaccinations")}</label>
                  <Input
                    type="text"
                    value={medicalData.vaccinations || ""}
                    onChange={(e) => handleChange("vaccinations", e.target.value)}
                    placeholder="Recent vaccinations"
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
